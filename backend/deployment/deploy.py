import os
import sys
import time
import zipfile
import subprocess
import shutil
import json
import boto3

# Ensure we're running from the backend root folder
# Since this script is in backend/deployment/deploy.py
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
os.chdir(BACKEND_DIR)

# Configuration
LAMBDA_FUNCTION_NAME = "swavalambi-api-backend"
ROLE_NAME = "swavalambi-lambda-execution-role"
REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
ZIP_NAME = "deployment_package.zip"
BUILD_DIR = "build_package"

def run_command(command, fail_on_error=True):
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0 and fail_on_error:
        print(f"Error: {result.stderr}")
        sys.exit(1)
    return result.stdout.strip()

def create_iam_role(iam_client):
    """Creates the IAM Role for Lambda to access Bedrock and DynamoDB"""
    print("Creating IAM Role for Lambda...")
    assume_role_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": { "Service": "lambda.amazonaws.com" },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    try:
        role = iam_client.create_role(
            RoleName=ROLE_NAME,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy)
        )
        print(f"Created role: {ROLE_NAME}")
        
        # Attach basic execution policy (CloudWatch logs)
        iam_client.attach_role_policy(
            RoleName=ROLE_NAME,
            PolicyArn="arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        )
        
        # Attach custom policy for Bedrock and DynamoDB
        custom_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "bedrock:InvokeModel",
                        "bedrock:InvokeModelWithResponseStream"
                    ],
                    "Resource": "*"
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "dynamodb:PutItem",
                        "dynamodb:GetItem",
                        "dynamodb:UpdateItem",
                        "dynamodb:Scan",
                        "dynamodb:Query"
                    ],
                    "Resource": "*"
                }
            ]
        }
        
        iam_client.put_role_policy(
            RoleName=ROLE_NAME,
            PolicyName="SwavalambiBackendPolicy",
            PolicyDocument=json.dumps(custom_policy)
        )
        
        # Takes a few seconds for IAM Roles to propagate
        print("Waiting 10 seconds for IAM role to propagate...")
        time.sleep(10)
        return role['Role']['Arn']
        
    except iam_client.exceptions.EntityAlreadyExistsException:
        print(f"Role {ROLE_NAME} already exists.")
        return iam_client.get_role(RoleName=ROLE_NAME)['Role']['Arn']

def create_deployment_package():
    """Zips the dependencies and the source code"""
    print("Creating deployment package...")
    
    # 1. Clean previous build
    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)
        
    os.makedirs(BUILD_DIR, exist_ok=True)
    
    # 2. Add mangum for FastAPI Lambda support to requirements if missing
    reqs_content = ""
    with open("requirements.txt", "r") as f:
        reqs_content = f.read()
    if "mangum" not in reqs_content:
        with open("requirements.txt", "a") as f:
            f.write("\nmangum\n")
    
    # 3. Install pip dependencies to the build folder
    print("Installing dependencies via pip...")
    run_command(f'pip install -r requirements.txt -t {BUILD_DIR}')
    
    # 4. Copy source code to the build folder
    for folder in folders_to_copy:
        item_path = os.path.join(os.getcwd(), folder)
        if os.path.isdir(item_path):
            shutil.copytree(item_path, os.path.join(BUILD_DIR, folder))
            
    for file in files_to_copy:
        item_path = os.path.join(os.getcwd(), file)
        if os.path.isfile(item_path):
            shutil.copy2(item_path, BUILD_DIR)
            
    # 5. Zip the Build folder contents
    print(f"Zipping {BUILD_DIR} to {ZIP_NAME}...")
    shutil.make_archive(ZIP_NAME.replace(".zip", ""), 'zip', BUILD_DIR)
    print("Deployment package created successfully.")

def deploy_lambda(lambda_client, role_arn):
    """Creates or Updates the Lambda Function"""
    with open(ZIP_NAME, 'rb') as f:
        zipped_code = f.read()
        
    try:
        print(f"Attempting to create Lambda function {LAMBDA_FUNCTION_NAME}...")
        response = lambda_client.create_function(
            FunctionName=LAMBDA_FUNCTION_NAME,
            Runtime='python3.11',
            Role=role_arn,
            Handler='main.handler', # main.py and Mangum wrapper
            Code={'ZipFile': zipped_code},
            Timeout=300, # 5 min for LLM
            MemorySize=512,
        )
        print("Lambda function created.")
    except lambda_client.exceptions.ResourceConflictException:
        print("Function already exists. Updating code and configuration...")
        lambda_client.update_function_code(
            FunctionName=LAMBDA_FUNCTION_NAME,
            ZipFile=zipped_code
        )
        lambda_client.update_function_configuration(
            FunctionName=LAMBDA_FUNCTION_NAME,
            Timeout=300,
            MemorySize=512,
            Handler='main.handler',
        )
        print("Lambda function updated.")

def setup_function_url(lambda_client):
    """Sets up a public Function URL for the backend so we don't need API Gateway"""
    print("Setting up Lambda Function URL...")
    try:
        response = lambda_client.create_function_url_config(
            FunctionName=LAMBDA_FUNCTION_NAME,
            AuthType='NONE', # Publicly accessible API
            Cors={
                'AllowOrigins': ['*'],
                'AllowMethods': ['*'],
                'AllowHeaders': ['*']
            }
        )
        
        # Add resource-based permission for public access
        lambda_client.add_permission(
            FunctionName=LAMBDA_FUNCTION_NAME,
            StatementId='FunctionURLAllowPublicAccess',
            Action='lambda:InvokeFunctionUrl',
            Principal='*',
            FunctionUrlAuthType='NONE'
        )
        return response['FunctionUrl']
    except lambda_client.exceptions.ResourceConflictException:
        print("Function URL already exists (or permission already exists). Fetching URL...")
        response = lambda_client.get_function_url_config(FunctionName=LAMBDA_FUNCTION_NAME)
        return response['FunctionUrl']

if __name__ == "__main__":
    boto_session = boto3.Session(region_name=REGION)
    iam = boto_session.client('iam')
    aws_lambda = boto_session.client('lambda')
    
    # 1. Zip Code
    create_deployment_package()
    
    # 2. Setup Role
    role_arn = create_iam_role(iam)
    
    # 3. Deploy
    deploy_lambda(aws_lambda, role_arn)
    
    # 4. Expose via Function URL (cost effective API Gateway replacement)
    public_url = setup_function_url(aws_lambda)
    
    print("\n" + "="*50)
    print("🎉 DEPLOYMENT SUCCESSFUL!")
    print("="*50)
    print(f"Backend API URL: {public_url}")
    print("\nTo hook this up to your frontend:")
    print(f'1. Go to frontend/.env.production')
    print(f'2. Set VITE_API_BASE_URL={public_url}api')
    print("="*50 + "\n")
