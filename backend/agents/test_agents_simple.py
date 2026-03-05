"""
test_agents_simple.py — Simple test to verify agent setup
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

print("="*80)
print("TESTING AGENT SETUP")
print("="*80)

# Test 1: Check environment variables
print("\n1. Checking environment variables...")
required_vars = [
    "AZURE_OPENAI_API_KEY",
    "AZURE_OPENAI_ENDPOINT", 
    "AZURE_OPENAI_DEPLOYMENT",
    "POSTGRES_CONNECTION_STRING"
]

missing = []
for var in required_vars:
    if not os.getenv(var):
        missing.append(var)
        print(f"   ❌ {var} - MISSING")
    else:
        print(f"   ✅ {var} - Found")

if missing:
    print(f"\n⚠️  Missing environment variables: {', '.join(missing)}")
    print("Please add them to your .env file")
    sys.exit(1)

# Test 2: Try importing agents
print("\n2. Testing imports...")
try:
    from agents.scheme.scheme_tool import search_schemes_tool
    print("   ✅ Scheme agent imported")
except Exception as e:
    print(f"   ❌ Scheme agent import failed: {e}")

try:
    from agents.jobs.jobs_tool import search_jobs_tool
    print("   ✅ Jobs agent imported")
except Exception as e:
    print(f"   ❌ Jobs agent import failed: {e}")

try:
    from agents.upskill.upskill_tool import search_upskill_tool
    print("   ✅ Upskill agent imported")
except Exception as e:
    print(f"   ❌ Upskill agent import failed: {e}")

# Test 3: Test database connection
print("\n3. Testing PostgreSQL connection...")
try:
    import psycopg2
    conn = psycopg2.connect(os.getenv("POSTGRES_CONNECTION_STRING"))
    cur = conn.cursor()
    cur.execute("SELECT version()")
    version = cur.fetchone()[0]
    print(f"   ✅ Connected to PostgreSQL")
    print(f"   Version: {version[:50]}...")
    
    # Check if tables exist
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name IN ('schemes', 'jobs', 'upskill')
    """)
    tables = [row[0] for row in cur.fetchall()]
    
    if tables:
        print(f"   ✅ Found tables: {', '.join(tables)}")
    else:
        print("   ⚠️  No tables found. You need to run setup scripts:")
        print("      1. python backend/common/scripts/setup_postgres_tables.py")
        print("      2. python backend/common/scripts/load_filtered_data_to_postgres.py")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"   ❌ Database connection failed: {e}")

print("\n" + "="*80)
print("SETUP CHECK COMPLETE")
print("="*80)
