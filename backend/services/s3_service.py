import boto3
import os
import uuid
from datetime import datetime
from PIL import Image
from io import BytesIO
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('AWS_S3_BUCKET_NAME', 'swavalambi-profile-pictures')
        
    def upload_profile_picture(self, user_id: str, file_content: bytes, content_type: str) -> str:
        """
        Upload profile picture to S3 after resizing and optimization.
        
        Args:
            user_id: User ID for filename
            file_content: Raw image bytes
            content_type: MIME type (image/jpeg, image/png, etc.)
            
        Returns:
            S3 URL of uploaded image
        """
        try:
            # Resize and optimize image
            optimized_image, final_content_type = self._optimize_image(file_content, content_type)
            
            # Generate unique filename
            timestamp = int(datetime.now().timestamp())
            extension = self._get_extension(final_content_type)
            filename = f"profiles/{user_id}_{timestamp}.{extension}"
            
            # Upload to S3 with public-read ACL
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=filename,
                Body=optimized_image,
                ContentType=final_content_type,
                CacheControl='max-age=31536000',  # 1 year cache
                ACL='public-read'  # Make object publicly readable
            )
            
            # Generate public URL
            url = f"https://{self.bucket_name}.s3.amazonaws.com/{filename}"
            logger.info(f"Uploaded profile picture for user {user_id}: {url}")
            return url
            
        except Exception as e:
            logger.error(f"Error uploading profile picture: {e}")
            raise
    
    def delete_profile_picture(self, s3_url: str) -> bool:
        """
        Delete profile picture from S3.
        
        Args:
            s3_url: Full S3 URL of image
            
        Returns:
            True if deleted successfully
        """
        try:
            # Extract key from URL
            if f"{self.bucket_name}.s3.amazonaws.com/" not in s3_url:
                logger.warning(f"Invalid S3 URL format: {s3_url}")
                return False
                
            key = s3_url.split(f"{self.bucket_name}.s3.amazonaws.com/")[1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            logger.info(f"Deleted profile picture: {s3_url}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting profile picture: {e}")
            return False
    
    def _optimize_image(self, file_content: bytes, content_type: str) -> tuple:
        """
        Resize and optimize image to 512x512, maintain aspect ratio.
        
        Returns:
            (optimized_bytes, content_type)
        """
        # Open image
        image = Image.open(BytesIO(file_content))
        
        # Convert RGBA to RGB if needed
        if image.mode == 'RGBA':
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3])
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to 512x512 (thumbnail maintains aspect ratio)
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        
        # Save optimized image
        output = BytesIO()
        image.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        return output.read(), 'image/jpeg'
    
    def _get_extension(self, content_type: str) -> str:
        """Get file extension from content type."""
        extensions = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp'
        }
        return extensions.get(content_type, 'jpg')
    
    def ensure_bucket_exists(self):
        """Create S3 bucket if it doesn't exist and configure public access."""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"S3 bucket {self.bucket_name} exists")
            
            # Ensure public access is configured even if bucket exists
            try:
                self._disable_block_public_access()
                self._set_public_read_policy()
                logger.info(f"Updated public access settings for bucket {self.bucket_name}")
            except Exception as e:
                logger.warning(f"Could not update bucket settings: {e}")
                
        except ClientError:
            try:
                region = os.getenv('AWS_REGION', 'us-east-1')
                logger.info(f"Creating S3 bucket {self.bucket_name} in region {region}")
                
                if region == 'us-east-1':
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                else:
                    self.s3_client.create_bucket(
                        Bucket=self.bucket_name,
                        CreateBucketConfiguration={'LocationConstraint': region}
                    )
                
                # Disable block public access
                self._disable_block_public_access()
                
                # Set bucket policy for public read
                self._set_public_read_policy()
                
                logger.info(f"Created S3 bucket: {self.bucket_name}")
            except Exception as e:
                logger.error(f"Error creating bucket: {e}")
                raise
    
    def _disable_block_public_access(self):
        """Disable block public access settings on the bucket."""
        try:
            self.s3_client.put_public_access_block(
                Bucket=self.bucket_name,
                PublicAccessBlockConfiguration={
                    'BlockPublicAcls': False,
                    'IgnorePublicAcls': False,
                    'BlockPublicPolicy': False,
                    'RestrictPublicBuckets': False
                }
            )
            logger.info(f"Disabled block public access for bucket {self.bucket_name}")
        except Exception as e:
            logger.error(f"Error disabling block public access: {e}")
            raise
    
    def _set_public_read_policy(self):
        """Set bucket policy to allow public read access."""
        import json
        
        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{self.bucket_name}/profiles/*"
                }
            ]
        }
        
        self.s3_client.put_bucket_policy(
            Bucket=self.bucket_name,
            Policy=json.dumps(policy)
        )
