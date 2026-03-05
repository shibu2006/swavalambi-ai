# Multi-Agent Vector Search Architecture

This directory contains the multi-agent architecture for intelligent matching of schemes, jobs, and upskilling opportunities using vector search.

## Architecture Overview

```
agents/
├── base_agent.py           # Base agent with common search logic
├── scheme/                 # Government schemes agent
│   ├── scheme_agent.py
│   └── scheme_tool.py
├── jobs/                   # Jobs matching agent
│   ├── jobs_agent.py
│   └── jobs_tool.py
└── upskill/                # Training/upskilling agent
    ├── upskill_agent.py
    └── upskill_tool.py

common/
├── providers/              # Embedding providers (Azure OpenAI)
│   ├── embedding_provider.py
│   └── embedding_providers.py
└── stores/                 # Vector stores (PostgreSQL pgvector)
    ├── vector_store.py
    └── vector_stores.py
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Azure OpenAI (for embeddings)
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=text-embedding-3-small
AZURE_OPENAI_API_VERSION=2024-02-01

# PostgreSQL with pgvector
POSTGRES_CONNECTION_STRING=postgresql://user:password@host:port/database
```

### 3. Setup PostgreSQL Database

You need PostgreSQL with the pgvector extension. If you don't have the data loaded yet, you'll need:

1. Raw JSON files in `backend/common/data/`:
   - `myscheme_all_schemes.json`
   - `ncs_job_listings.json`
   - `skill_india_training_centers.json`

2. Run setup scripts (to be created):
   ```bash
   # Filter data
   python backend/common/scripts/parse_and_filter_data.py
   
   # Create tables
   python backend/common/scripts/setup_postgres_tables.py
   
   # Load data with embeddings
   python backend/common/scripts/load_filtered_data_to_postgres.py
   ```

### 4. Test the Setup

```bash
cd backend
python agents/test_agents_simple.py
```

## Usage

### Direct Tool Usage

```python
from agents.scheme.scheme_tool import search_schemes_tool
from agents.jobs.jobs_tool import search_jobs_tool
from agents.upskill.upskill_tool import search_upskill_tool

# Search schemes
schemes = search_schemes_tool(
    skill="tailor",
    intent="loan",
    skill_level=3,
    state="Maharashtra"
)

# Search jobs
jobs = search_jobs_tool(
    skill="carpenter",
    skill_level=4,
    state="Karnataka"
)

# Search training
courses = search_upskill_tool(
    skill="weaver",
    skill_level=2,
    state="Tamil Nadu"
)
```

### Integration with Routes

Update `backend/api/routes_recommendations.py`:

```python
from agents.scheme.scheme_tool import search_schemes_tool
from agents.jobs.jobs_tool import search_jobs_tool
from agents.upskill.upskill_tool import search_upskill_tool

@router.post("/fetch", response_model=RecommendationResponse)
async def get_recommendations(req: RecommendationRequest):
    skill = req.profession_skill.strip().lower()
    intent = req.intent.strip().lower()
    state = req.state or "All India"
    
    jobs_data = []
    schemes_data = []
    centers_data = []
    
    # Use vector search instead of live APIs
    if intent in ("job", "loan"):
        jobs_data = search_jobs_tool(
            skill=skill,
            skill_level=req.skill_rating,
            state=state
        )
    
    schemes_data = search_schemes_tool(
        skill=skill,
        intent=intent,
        skill_level=req.skill_rating,
        state=state
    )
    
    if intent == "upskill":
        centers_data = search_upskill_tool(
            skill=skill,
            skill_level=req.skill_rating,
            state=state
        )
    
    # Build response...
```

## How It Works

### 1. Vector Search
- User query is converted to embedding using Azure OpenAI
- PostgreSQL pgvector finds similar documents using cosine similarity
- Returns top 50 candidates

### 2. Eligibility Scoring
Each agent implements custom scoring logic:
- **Scheme Agent**: Matches skill, intent keywords, level, and state
- **Jobs Agent**: Matches skill in title/skills, level, and location
- **Upskill Agent**: Matches skill in courses, prioritizes beginners, location

### 3. Final Ranking
- Vector score (60%) + Eligibility score (40%)
- Returns top 5-10 results

## Data Structure

### Schemes Table
- 140 filtered government schemes
- Fields: name, ministry, description, categories, tags, state, url
- URL format: `https://www.myscheme.gov.in/schemes/{slug}`

### Jobs Table
- 1,750 filtered job listings
- Fields: title, description, company, skills, location, salary
- URL format: `https://www.ncs.gov.in/job-details/{id}`

### Upskill Table
- 157 training centers
- Fields: name, description, provider, skills, location, contact, email
- Contact: `tel:` and `mailto:` links

## Benefits

1. **Fast**: No external API calls, all data local
2. **Intelligent**: Semantic search + custom scoring
3. **Scalable**: Easy to add more data
4. **Reliable**: No dependency on external API availability
5. **Consistent**: Same response format as before

## Next Steps

1. Run the test script to verify setup
2. Create the data processing scripts if needed
3. Update routes_recommendations.py to use agents
4. Test end-to-end with frontend
