# Swavalambi - Technical Design Document
## "Skills to Self-Reliance"

**Project:** Swavalambi - AI-Powered Skills Marketplace  
**Track:** AWS AI for Bharat Hackathon - Professional Track  
**Date:** January 23, 2025  
**Version:** 1.0

---

## 1. Executive Summary

**The Problem We're Solving:**

90M+ skilled workers in India's informal sector face a fundamental trust problem: they can't prove their skills (no certificates) and fear scams from unverified businesses. Existing platforms focus on job listings but ignore the core issue - mutual trust.

**Our Insight:**

We're not asking "How do we list more jobs?" We're asking "How can workers prove skills AND access opportunities safely?" This reframing led us to a novel solution: a two-way verified marketplace where workers are assessed by AI and businesses are verified by government APIs.

**Technical Solution:**

Swavalambi is a multi-agent AI platform that empowers 90M+ skilled workers through:
- **AI-Powered Skill Assessment:** Objective evaluation from work samples (no certificates needed)
- **Verified Marketplace:** Business verification (API Setu preferred) - no scams
- **Complete Ecosystem:** Jobs + Schemes + Training + Networks in one platform
- **Regional Language Access:** Voice-first interface in 5+ languages

**Core Technical Innovation:**
- 6 specialized AI agents orchestrated via AWS Bedrock Agent Core
- Hybrid data strategy (structured DB + real-time web search)
- Two-way verification system (AI assessment + API Setu)
- Multi-modal interface (vision + voice) in regional languages

**Key Design Principles:**
1. **Smart Technology Choices:** AWS managed services for rapid development
2. **Constraint Awareness:** Designed around data, time, and cost limitations
3. **Scalability:** Start focused (Surat tailors), scale gradually
4. **Security First:** Two-way verification, encryption, content filtering

**Impact:** 40% average income increase, 30% scheme adoption, <5% scam rate, serving 90M+ workers nationally.

## 1.1 Why This Architecture Is Feasible

**Complete Feature Set:**
- ✅ All 6 specialized AI agents working together
- ✅ Vision-based skill assessment (multi-modal: photo + video)
- ✅ Voice conversation in 5+ regional languages
- ✅ Verified marketplace with business verification
- ✅ Government scheme matching (400+ schemes)
- ✅ Upskilling recommendations with ROI calculation
- ✅ Cooperative network discovery (8.5L+ cooperatives)
- ✅ Mobile-first design (responsive web + PWA)

**Why This Is Achievable:**

**1. AWS Managed Services (No Infrastructure Overhead)**
- **Bedrock Agent Core:** Built specifically for multi-agent orchestration (Strands/MCP protocol)
- **Bedrock Vision:** Zero-shot image analysis (no model training needed)
- **Bedrock Voice:** Integrated Transcribe, Translate, Polly (multi-language ready)
- **RDS, DynamoDB, OpenSearch:** Fully managed databases (auto-scaling, no ops)
- **Lambda:** Serverless compute (scales automatically)
- **Result:** Focus on business logic, not infrastructure

**2. Real Public Data Available**
- **data.gov.in:** Latest MSME, cooperative, training center data
- **NSDC API:** Current training center listings
- **NCDC Database:** 8.5L+ registered cooperatives
- **Government Websites:** 400+ scheme details (PM Vishwakarma, MUDRA, etc.)
- **API Setu:** Business verification APIs (Udyam, GST, eCourts)
- **Result:** No need to create synthetic data

**3. Hybrid Data Strategy**
- **Structured DB:** Verified businesses, schemes, training centers (curated, reliable)
- **Real-time Web Search:** Current opportunities, online courses (fresh, comprehensive)
- **Result:** Best of both worlds - reliability + freshness

**4. Smart Technology Choices**
- **Multi-Agent Architecture:** Each agent has single responsibility (easier to build/test)
- **Sequential Pipeline:** Simpler than parallel orchestration
- **Shared Services:** Web search, verification services reused across agents
- **Vector Search:** OpenSearch Serverless for semantic matching (no cluster management)
- **Result:** Reduced complexity, faster development

**5. Starting Focus**
- **One Skill First:** Tailoring (12M+ workers, large market)
- **One City First:** Surat (textile hub, high concentration)
- **Rationale:** Validate accuracy, build trust, iterate based on feedback
- **Then Scale:** Expand to other skills and cities with proven model
- **Result:** Prove concept before scaling

**Technical Feasibility Summary:**
- AWS provides all building blocks (Bedrock, databases, APIs)
- Real public data available (no data creation needed)
- Multi-agent architecture reduces complexity (separation of concerns)
- Starting with tailoring in Surat validates approach
- Complete platform is achievable with smart architecture

---

## 2. System Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  Mobile Web App (PWA) - Photo Upload + Voice Interaction        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION LAYER                        │
│                        AWS Cognito                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│                    Amazon API Gateway                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AGENT ORCHESTRATION LAYER                      │
│              AWS Bedrock Agent Core Runtime                      │
│                  (Strands/MCP Protocol)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Vision     │  Profiling   │   Market     │  Upskilling  │   Scheme     │   Network    │
│    Agent     │    Agent     │    Agent     │    Agent     │    Agent     │    Agent     │
│              │              │              │              │              │              │
│  Bedrock     │  Bedrock     │  Bedrock     │  Bedrock     │  Bedrock     │  Bedrock     │
│  Vision      │  + Voice     │  + Search    │  + RDS       │  + Vector    │  + DynamoDB  │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
       ↓              ↓              ↓              ↓              ↓              ↓
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              SHARED SERVICES LAYER                                       │
│  • Web Search Service (Lambda) - Real-time opportunity discovery                        │
│  • Business Verification Service (Lambda + API Setu) - Udyam/GST/eCourts               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
       ↓              ↓              ↓              ↓              ↓              ↓
┌──────────────┬──────────────┬──────────────┬──────────────────────────────────────────┐
│   Amazon     │   DynamoDB   │   Amazon     │   OpenSearch Serverless                  │
│     S3       │              │     RDS      │                                          │
│              │              │              │                                          │
│  Images/     │  User        │  Businesses  │  Vector Embeddings                       │
│  Videos/     │  Profiles    │  Skills      │  (Schemes, Opportunities)                │
│  Audio       │  Context     │  Training    │                                          │
│              │  Cooperatives│              │                                          │
└──────────────┴──────────────┴──────────────┴──────────────────────────────────────────┘
```

### 2.2 Architecture Rationale

**Why Multi-Agent Architecture?**
- **Separation of Concerns:** Each agent has distinct responsibility and data source
- **Scalability:** Agents can be scaled independently based on load
- **Maintainability:** Easier to update/improve individual agents
- **Hackathon Requirement:** Multi-agent system is core requirement

**Why AWS Bedrock Agent Core?**
- **Built for Multi-Agent:** Native orchestration and communication
- **Strands (MCP) Protocol:** Standardized agent communication
- **Managed Service:** No infrastructure setup, faster development
- **Cost-Effective:** Pay-per-use, no idle costs

**Why Hybrid Data Strategy?**
- **Approach:** Combine structured DB (verified, curated data) + real-time web search
- **Benefit:** Verified businesses in DB + current opportunities via web search
- **Rationale:** Best of both worlds - reliability from curated data + freshness from web

---

## 3. Agent Architecture Details

### 3.1 Vision Agent - AI-Powered Skill Assessment

**Purpose:** Objective skill assessment from work samples (photos/videos)

**Technology Stack:**
- **AI Model:** AWS Bedrock (Claude 4.5 Sonnet with vision capabilities)
- **Storage:** Amazon S3 (images, videos)
- **Processing:** AWS Lambda (image preprocessing)

**Input:**
- Photo/video of work sample (JPG, PNG, MP4, MOV)
- Max size: 10MB (images), 50MB (videos)
- Metadata: User ID, skill type (if known), timestamp

**Processing Flow:**
1. **Upload & Storage:**
   - User uploads via mobile web app
   - API Gateway → Lambda → S3
   - Generate presigned URL for secure upload
   - Store metadata in DynamoDB

2. **Vision Analysis:**
   - Lambda triggers Bedrock Vision API
   - Prompt: "Analyze this work sample. Identify: skill type, quality level (1-5), techniques used, attention to detail, market standard comparison"
   - Model analyzes: stitching quality, pattern matching, finishing, complexity
   - Returns structured JSON

3. **Skill Level Assignment:**
   - Map quality scores to standardized 1-5 scale:
     - **Level 1 (Beginner):** Basic quality, simple tasks, needs supervision
     - **Level 2 (Developing):** Routine tasks, minimal supervision, good quality
     - **Level 3 (Competent):** Independent work, consistent quality, complex tasks
     - **Level 4 (Proficient):** High quality, advanced techniques, can train others
     - **Level 5 (Expert):** Master craftsman, innovation, custom work
   - Store assessment in DynamoDB

**Output Structure:**
```json
{
  "user_id": "user123",
  "skill_type": "tailoring",
  "skill_level": 3,
  "quality_score": 7.5,
  "techniques_identified": ["machine_stitching", "basic_embroidery"],
  "strengths": ["consistent_stitching", "good_finishing"],
  "areas_for_improvement": ["pattern_matching", "advanced_embroidery"],
  "market_comparison": "above_average_for_basic_tailoring",
  "confidence": 0.85,
  "timestamp": "2025-01-23T10:30:00Z"
}
```

**Accuracy Target & Validation Plan:**
- **Target:** 70-80% accuracy vs expert assessment (industry benchmark for zero-shot vision models)
- **Validation Approach:**
  1. Collect 100 work samples from tailors with known skill levels
  2. Get expert assessments (3 master tailors rate each sample)
  3. Compare AI assessment vs expert consensus
  4. Iterate on prompts to improve accuracy
- **Fallback Strategy:** If accuracy <70%, implement "AI-assisted assessment" (AI suggests, human verifies)
- **Cross-Validation:** Check consistency with voice conversation (Profiling Agent)
- **Continuous Improvement:** Collect employer feedback post-hire to refine model
- **Portfolio Building:** Track multiple assessments over time to improve accuracy

**Constraints Addressed:**
- **Data Constraint:** No training data needed (zero-shot with Bedrock Vision)
- **Time Constraint:** Managed service, no model training required
- **Cost Constraint:** Pay-per-API-call, no GPU infrastructure

---

### 3.2 Profiling Agent - Conversational Context Building

**Purpose:** Build comprehensive user profile through voice conversation in regional languages

**Technology Stack:**
- **AI Model:** AWS Bedrock (Claude 4.5 Sonnet)
- **Speech-to-Text:** AWS Transcribe (real-time)
- **Translation:** AWS Translate (regional languages)
- **Text-to-Speech:** AWS Polly (voice output)
- **Storage:** DynamoDB (user profiles, conversation history)

**Supported Languages:**
- Hindi, Gujarati, Tamil, Telugu, Marathi (Phase 1)
- Expand to 10+ languages in Phase 2

**Conversation Flow:**
1. **Initialization:**
   - Receive Vision Agent output (skill type, level)
   - Start conversation in user's preferred language
   - Example: "નમસ્તે રાજેશ, તમે શું શોધી રહ્યા છો?" (Hello Rajesh, what are you looking for?)

2. **Smart Q&A:**
   - Ask contextual questions based on skill level:
     - Goals: "Better income? New skills? Loans? Network?"
     - Preferences: "Willing to travel? Preferred work type?"
     - Constraints: "Family commitments? Time availability?"
   - Bedrock processes responses, extracts structured data
   - Translate responses to English for processing

3. **Cross-Validation:**
   - Validate Vision Agent assessment
   - Example: "How many years of experience?" → Check consistency with skill level
   - Flag discrepancies for review

4. **Profile Building:**
   - Store comprehensive profile in DynamoDB
   - Update conversation history for context

**User Profile Schema:**
```json
{
  "user_id": "user123",
  "name": "Rajesh Patel",
  "phone": "+91-9876543210",
  "location": {
    "city": "Surat",
    "area": "Varachha",
    "coordinates": [21.1702, 72.8311]
  },
  "skill": {
    "type": "tailoring",
    "level": 3,
    "experience_years": 5,
    "specializations": ["machine_stitching", "basic_embroidery"]
  },
  "goals": ["increase_income", "learn_new_skills"],
  "preferences": {
    "willing_to_travel": "within_5km",
    "work_type": "full_time",
    "preferred_language": "gujarati"
  },
  "constraints": {
    "family_commitments": "moderate",
    "time_availability": "weekdays_9to6"
  },
  "current_income": 8000,
  "target_income": 15000,
  "created_at": "2025-01-23T10:30:00Z",
  "updated_at": "2025-01-23T10:35:00Z"
}
```

**Conversation History Schema:**
```json
{
  "user_id": "user123",
  "session_id": "session456",
  "messages": [
    {
      "role": "assistant",
      "content": "નમસ્તે રાજેશ, તમે શું શોધી રહ્યા છો?",
      "content_english": "Hello Rajesh, what are you looking for?",
      "timestamp": "2025-01-23T10:30:00Z"
    },
    {
      "role": "user",
      "content": "મારે વધુ પૈસા કમાવા છે",
      "content_english": "I want to earn more money",
      "timestamp": "2025-01-23T10:30:15Z"
    }
  ]
}
```

**Technical Implementation:**
- **Real-time Processing:** WebSocket connection for voice streaming
- **Latency Optimization:** < 2 seconds response time
- **Fallback:** Text input if voice fails
- **Context Management:** Store last 10 messages for continuity

---

### 3.3 Market Agent - Verified Opportunity Matching

**Purpose:** Match workers to verified business opportunities

**Technology Stack:**
- **AI Model:** AWS Bedrock (Claude 4.5 Sonnet)
- **Vector Search:** OpenSearch Serverless
- **Storage:** Amazon RDS (verified businesses)
- **Web Search:** Bedrock web search (fallback)

**Data Sources:**
1. **Primary:** Verified businesses in RDS (curated from latest online sources + API Setu verified)
2. **Fallback:** Real-time web search for current opportunities

**Processing Flow:**
1. **Read User Profile:**
   - Fetch from DynamoDB: skill, level, location, preferences
   - Example: {skill: "tailoring", level: 3, location: "Surat", radius: 5km}

2. **Query Verified Businesses:**
   - SQL query to RDS:
     ```sql
     SELECT * FROM businesses 
     WHERE skill_required = 'tailoring' 
     AND location_city = 'Surat'
     AND verification_status = 'verified'
     AND skill_level_min <= 3
     ORDER BY distance_km ASC, salary DESC
     LIMIT 10
     ```

3. **Vector Similarity Search:**
   - Generate embedding for user profile
   - Search OpenSearch for semantic matches
   - Combine with SQL results

4. **Web Search Fallback:**
   - If < 3 verified results, trigger Bedrock web search
   - Query: "tailoring jobs in Surat hiring now"
   - Parse results, extract: business name, contact, salary
   - Mark as "unverified" in output

5. **Ranking & Filtering:**
   - Rank by: verification status > distance > salary > relevance
   - Filter: Remove duplicates, expired listings
   - Limit: Top 5 opportunities

**Output Structure:**
```json
{
  "user_id": "user123",
  "opportunities": [
    {
      "business_id": "biz789",
      "business_name": "Meera Boutique",
      "verification_status": "verified",
      "verification_date": "2025-01-15",
      "verification_badges": ["udyam", "gst"],
      "contact": {
        "name": "Meera Shah",
        "phone": "+91-9876543210",
        "address": "Ring Road, Varachha, Surat - 395006"
      },
      "opportunity": {
        "role": "Tailor",
        "skill_level_required": "2-4",
        "salary": "₹18,000/month",
        "work_type": "full_time",
        "requirements": "Machine stitching, basic embroidery"
      },
      "distance_km": 2.3,
      "relevance_score": 0.92,
      "source": "verified_database"
    },
    {
      "business_name": "Shree Exports",
      "verification_status": "unverified",
      "contact": {
        "address": "GIDC Estate, Surat"
      },
      "opportunity": {
        "role": "Tailor",
        "salary": "₹15,000-20,000/month",
        "note": "Walk-in interview next Tuesday"
      },
      "distance_km": 5.1,
      "relevance_score": 0.78,
      "source": "web_search"
    }
  ],
  "total_verified": 1,
  "total_unverified": 1,
  "generated_at": "2025-01-23T10:35:00Z"
}
```

**Verification Badge System:**
- **Udyam:** MSME registration verified
- **GST:** Active GST status
- **eCourts:** No legal issues
- **Rating:** User ratings (post-hire feedback)

**Constraints Addressed:**
- **Data Constraint:** Hybrid approach (DB + web search) addresses limited verified data
- **Cold Start:** Manual curation for pilot (50 businesses in Surat)
- **Scam Prevention:** Verification badges clearly displayed

---

### 3.4 Upskilling Agent - Skill Gap Analysis & Training

**Purpose:** Identify skill gaps and recommend high-ROI training paths

**Technology Stack:**
- **AI Model:** AWS Bedrock (Claude 4.5 Sonnet)
- **Storage:** Amazon RDS (skill-income mapping, training centers)
- **Web Search:** Bedrock web search (online courses)

**Data Sources:**
1. **Skill-Income Mapping:** RDS table with market research data
2. **Training Centers:** NSDC database + curated list
3. **Online Courses:** Web search for YouTube, Udemy, etc.

**Processing Flow:**
1. **Current Skill Analysis:**
   - Read Vision Agent output: skill type, level, techniques
   - Example: {skill: "tailoring", level: 3, techniques: ["machine_stitching"]}

2. **Market Demand Analysis:**
   - Query RDS for skill-income correlation:
     ```sql
     SELECT skill_name, avg_income, demand_level 
     FROM skill_market_data 
     WHERE base_skill = 'tailoring' 
     AND avg_income > (SELECT avg_income FROM skill_market_data WHERE skill_name = 'basic_tailoring')
     ORDER BY avg_income DESC
     ```
   - Result: Embroidery (₹22K), Pattern Making (₹20K), Designer Stitching (₹25K)

3. **Gap Identification:**
   - Compare current skills vs high-income skills
   - Identify missing techniques
   - Calculate income potential: Current (₹8K) → With Embroidery (₹22K) = +175%

4. **Training Recommendations:**
   - Query RDS for nearby training centers:
     ```sql
     SELECT * FROM training_centers 
     WHERE skill_taught = 'embroidery' 
     AND location_city = 'Surat'
     AND distance_km <= 10
     ORDER BY rating DESC, cost ASC
     ```
   - Web search for online alternatives: "embroidery course online free"

5. **ROI Calculation:**
   - Training cost: ₹2,000
   - Time: 3 months
   - Income increase: ₹14,000/month
   - Payback period: 0.14 months (instant ROI)
   - 12-month ROI: ₹168,000 - ₹2,000 = ₹166,000

**Output Structure:**
```json
{
  "user_id": "user123",
  "current_skill": {
    "type": "tailoring",
    "level": 3,
    "avg_income": "₹8,000/month"
  },
  "skill_gaps": [
    {
      "skill_name": "embroidery",
      "income_potential": "₹22,000/month",
      "income_increase": "+175%",
      "demand_level": "high",
      "difficulty": "moderate",
      "time_to_learn": "3 months"
    },
    {
      "skill_name": "pattern_making",
      "income_potential": "₹20,000/month",
      "income_increase": "+150%",
      "demand_level": "medium",
      "difficulty": "high",
      "time_to_learn": "6 months"
    }
  ],
  "training_recommendations": [
    {
      "skill": "embroidery",
      "provider": "Surat Skill Development Center",
      "type": "in_person",
      "location": "Varachha, Surat (2km)",
      "cost": "₹2,000",
      "duration": "3 months",
      "schedule": "Weekends, 10am-2pm",
      "rating": 4.5,
      "contact": "+91-9876543211",
      "roi": {
        "investment": "₹2,000",
        "monthly_income_increase": "₹14,000",
        "payback_period": "0.14 months",
        "12_month_return": "₹166,000"
      }
    },
    {
      "skill": "embroidery",
      "provider": "YouTube - Embroidery Basics",
      "type": "online",
      "cost": "Free",
      "duration": "Self-paced",
      "link": "https://youtube.com/playlist/...",
      "rating": 4.2
    }
  ],
  "learning_roadmap": {
    "month_1": "Complete online basics (YouTube)",
    "month_2": "Enroll in Surat Skill Center",
    "month_3": "Practice projects, build portfolio",
    "month_4": "Apply to boutiques requiring embroidery"
  },
  "generated_at": "2025-01-23T10:35:00Z"
}
```

**Skill-Income Mapping Table (RDS):**
```sql
CREATE TABLE skill_market_data (
  skill_id INT PRIMARY KEY,
  base_skill VARCHAR(50),
  skill_name VARCHAR(100),
  avg_income DECIMAL(10,2),
  demand_level ENUM('low', 'medium', 'high'),
  difficulty ENUM('easy', 'moderate', 'high'),
  time_to_learn_months INT,
  data_source VARCHAR(100),
  last_updated DATE
);
```

**Data Sources for Skill-Income Mapping:**
- NSDC salary reports (latest available online)
- Job portal data (Indeed, Naukri - current postings)
- Industry research reports (2024-2025)
- User feedback (post-hire income)

---

### 3.5 Scheme Agent - Government Scheme Matching

**Purpose:** Match workers to eligible government schemes

**Technology Stack:**
- **AI Model:** AWS Bedrock (Claude 4.5 Sonnet)
- **Vector Search:** OpenSearch Serverless
- **Storage:** DynamoDB (scheme database)

**Data Sources:**
- 400+ government schemes from various ministries
- PM Vishwakarma, MUDRA, Stand-Up India, PM SVANidhi, PMEGP, etc.
- Scraped from official government websites

**Processing Flow:**
1. **Read User Profile:**
   - Fetch: skill, income, location, age, gender, business status
   - Example: {skill: "tailoring", income: 8000, location: "Surat", age: 28, business: false}

2. **Generate Profile Embedding:**
   - Create text representation: "28-year-old tailor in Surat earning ₹8K/month, no business"
   - Generate embedding using Bedrock

3. **Vector Search in OpenSearch:**
   - Query scheme embeddings for semantic similarity
   - Filter by: location (state/national), skill type, income bracket
   - Return top 5 matches

4. **Eligibility Check:**
   - Bedrock analyzes user profile vs scheme criteria
   - Checks: age, income, skill, location, business status, caste (if applicable)
   - Calculates eligibility score (0-1)

5. **Document Checklist:**
   - For each eligible scheme, list required documents
   - Check user profile for existing documents
   - Highlight missing documents

**Output Structure:**
```json
{
  "user_id": "user123",
  "matched_schemes": [
    {
      "scheme_id": "scheme001",
      "scheme_name": "PM Vishwakarma",
      "ministry": "Ministry of MSME",
      "eligibility_score": 0.95,
      "benefits": {
        "toolkit_grant": "₹15,000",
        "training": "Free 5-day basic + 15-day advanced",
        "loan": "₹1L (1st tranche) + ₹2L (2nd tranche) @ 5% interest",
        "marketing_support": "National portal listing"
      },
      "eligibility_criteria": {
        "age": "18+ years ✓",
        "skill": "Traditional artisan (tailor) ✓",
        "income": "< ₹3L/year ✓",
        "business": "Self-employed or micro-enterprise ✓"
      },
      "required_documents": [
        {"name": "Aadhaar Card", "status": "available"},
        {"name": "Bank Account", "status": "available"},
        {"name": "Skill Certificate", "status": "missing", "alternative": "AI assessment report accepted"},
        {"name": "Passport Photo", "status": "missing"}
      ],
      "application_process": {
        "step_1": "Visit PM Vishwakarma portal: https://pmvishwakarma.gov.in/",
        "step_2": "Register with Aadhaar",
        "step_3": "Upload documents",
        "step_4": "Attend verification interview at District Industries Center",
        "step_5": "Receive toolkit grant within 30 days"
      },
      "application_deadline": "Rolling (no deadline)",
      "estimated_time": "30-45 days",
      "contact": {
        "helpline": "1800-123-4567",
        "local_office": "District Industries Center, Surat",
        "address": "GIDC Estate, Surat - 395008"
      }
    },
    {
      "scheme_id": "scheme002",
      "scheme_name": "MUDRA Loan (Shishu)",
      "ministry": "Ministry of Finance",
      "eligibility_score": 0.88,
      "benefits": {
        "loan_amount": "Up to ₹50,000",
        "interest_rate": "8-10% (bank-dependent)",
        "collateral": "Not required"
      },
      "eligibility_criteria": {
        "business": "Micro-enterprise or self-employed ✓",
        "income": "< ₹10L/year ✓",
        "credit_history": "No defaults ?"
      },
      "required_documents": [
        {"name": "Aadhaar Card", "status": "available"},
        {"name": "PAN Card", "status": "unknown"},
        {"name": "Bank Statements (6 months)", "status": "unknown"},
        {"name": "Business Plan", "status": "missing", "help": "We can help you create one"}
      ],
      "application_process": {
        "step_1": "Visit nearest bank branch",
        "step_2": "Fill MUDRA loan application",
        "step_3": "Submit documents",
        "step_4": "Bank verification",
        "step_5": "Loan disbursed within 15 days"
      },
      "estimated_time": "15-30 days"
    }
  ],
  "total_matched": 2,
  "total_eligible": 2,
  "generated_at": "2025-01-23T10:35:00Z"
}
```

**Scheme Database Schema (DynamoDB):**
```json
{
  "scheme_id": "scheme001",
  "scheme_name": "PM Vishwakarma",
  "ministry": "Ministry of MSME",
  "description": "Financial support and skill training for traditional artisans",
  "benefits": {...},
  "eligibility_criteria": {...},
  "required_documents": [...],
  "application_process": {...},
  "target_audience": ["tailors", "carpenters", "blacksmiths", ...],
  "location_scope": "national",
  "embedding": [0.123, 0.456, ...],  // 1536-dim vector
  "last_updated": "2025-01-15"
}
```

**OpenSearch Index Configuration:**
```json
{
  "mappings": {
    "properties": {
      "scheme_id": {"type": "keyword"},
      "scheme_name": {"type": "text"},
      "description": {"type": "text"},
      "target_audience": {"type": "keyword"},
      "location_scope": {"type": "keyword"},
      "embedding": {
        "type": "knn_vector",
        "dimension": 1536,
        "method": {
          "name": "hnsw",
          "engine": "nmslib"
        }
      }
    }
  }
}
```

---

### 3.6 Network Agent - Cooperative & Peer Discovery

**Purpose:** Connect workers to cooperatives and peer networks

**Technology Stack:**
- **AI Model:** AWS Bedrock (Claude 4.5 Sonnet)
- **Storage:** DynamoDB (cooperative database)
- **Web Search:** Bedrock web search (business associations)

**Data Sources:**
1. **Primary:** NCDC cooperative database (8.5L+ cooperatives)
2. **Secondary:** Web search for local associations

**Processing Flow:**
1. **Read User Profile:**
   - Fetch: skill, location
   - Example: {skill: "tailoring", location: "Surat"}

2. **Query Cooperative Database:**
   - DynamoDB query:
     ```javascript
     {
       "TableName": "cooperatives",
       "IndexName": "skill-location-index",
       "KeyConditionExpression": "skill = :skill AND begins_with(location, :city)",
       "FilterExpression": "distance_km <= :radius",
       "ExpressionAttributeValues": {
         ":skill": "tailoring",
         ":city": "Surat",
         ":radius": 10
       }
     }
     ```

3. **Web Search Fallback:**
   - If < 2 results, trigger web search
   - Query: "tailoring cooperative in Surat" OR "tailor association Surat"
   - Parse results, extract contact details

4. **Membership Benefits:**
   - Bedrock analyzes cooperative details
   - Highlights: bulk orders, shared workspace, training, peer support

**Output Structure:**
```json
{
  "user_id": "user123",
  "cooperatives": [
    {
      "cooperative_id": "coop123",
      "name": "Surat Tailors Cooperative Society",
      "type": "producer_cooperative",
      "skill": "tailoring",
      "location": {
        "address": "Varachha Main Road, Surat - 395006",
        "distance_km": 2.5
      },
      "members": {
        "total": 500,
        "active": 350
      },
      "benefits": [
        "Bulk orders from textile exporters",
        "Shared workspace (₹500/month)",
        "Free skill training (quarterly)",
        "Group insurance",
        "Raw material at wholesale rates"
      ],
      "membership": {
        "fee": "₹1,000 (one-time) + ₹100/month",
        "requirements": ["Aadhaar", "Skill proof", "2 passport photos"],
        "process": "Visit office, fill form, pay fee, get membership card"
      },
      "contact": {
        "president": "Ramesh Patel",
        "phone": "+91-9876543211",
        "email": "surattailors@coop.in",
        "office_hours": "Mon-Sat, 10am-5pm"
      },
      "established": "2010",
      "registration": "NCDC-GJ-2010-12345",
      "source": "ncdc_database"
    },
    {
      "name": "Gujarat Garment Workers Association",
      "type": "trade_association",
      "location": {
        "address": "GIDC Estate, Surat",
        "distance_km": 5.2
      },
      "benefits": [
        "Job placement assistance",
        "Legal support for workers",
        "Skill certification programs"
      ],
      "contact": {
        "phone": "+91-9876543212"
      },
      "source": "web_search"
    }
  ],
  "total_found": 2,
  "generated_at": "2025-01-23T10:35:00Z"
}
```

**Cooperative Database Schema (DynamoDB):**
```json
{
  "cooperative_id": "coop123",
  "name": "Surat Tailors Cooperative Society",
  "type": "producer_cooperative",
  "skill": "tailoring",
  "location_city": "Surat",
  "location_state": "Gujarat",
  "location_coordinates": [21.1702, 72.8311],
  "members_total": 500,
  "members_active": 350,
  "benefits": [...],
  "membership_fee": 1000,
  "monthly_fee": 100,
  "contact": {...},
  "established_year": 2010,
  "ncdc_registration": "NCDC-GJ-2010-12345",
  "last_updated": "2025-01-15"
}
```

**Data Source:**
- NCDC database (latest available data)
- State cooperative directories (online sources)
- Manual curation for pilot (20-30 cooperatives in Surat from current listings)

---

## 4. Shared Services Architecture

### 4.1 Web Search Service

**Purpose:** Real-time opportunity and information discovery

**Technology:**
- AWS Lambda (Python)
- AWS Bedrock web search capability

**Usage:**
- Market Agent: Find current job opportunities
- Upskilling Agent: Discover online courses
- Network Agent: Find local associations

**Implementation:**
```python
import boto3

bedrock = boto3.client('bedrock-runtime')

def web_search(query, max_results=5):
    response = bedrock.invoke_model(
        modelId='anthropic.claude-sonnet-4-5-20250929-v1:0',
        body={
            'anthropic_version': 'bedrock-2023-05-31',
            'messages': [{
                'role': 'user',
                'content': f'Search the web for: {query}. Return top {max_results} results with title, URL, snippet.'
            }],
            'max_tokens': 2000,
            'temperature': 0.3
        }
    )
    return parse_search_results(response)
```

**Rate Limiting:**
- Max 10 searches per user per day
- Cache results for 24 hours
- Fallback to cached data if limit exceeded

---

### 4.2 Business Verification Service

**Purpose:** Verify businesses via API Setu

**Technology:**
- AWS Lambda (Python)
- API Setu APIs (Udyam, GST, eCourts)
- Amazon RDS (store verification results)

**Verification Flow:**
1. **Business Registration:**
   - Business submits: Udyam number, GST number, PAN
   - Lambda function triggered

2. **API Setu Verification:**
   - **Udyam API:** Verify MSME registration
   - **GST API:** Check active status
   - **eCourts API:** Check legal cases
   - Parallel execution for speed

3. **Verification Score:**
   - Udyam verified: +40 points
   - GST active: +30 points
   - No legal issues: +30 points
   - Total: 100 points (threshold: 70 for "verified" badge)

4. **Store Results:**
   - Save to RDS with timestamp
   - Annual renewal required

**Implementation:**
```python
import requests
import boto3

def verify_business(udyam_number, gst_number):
    results = {
        'udyam': verify_udyam(udyam_number),
        'gst': verify_gst(gst_number),
        'ecourts': check_ecourts(gst_number)
    }
    
    score = calculate_verification_score(results)
    status = 'verified' if score >= 70 else 'unverified'
    
    # Store in RDS
    save_verification_result(results, score, status)
    
    return {
        'status': status,
        'score': score,
        'badges': get_badges(results)
    }
```

**API Setu Integration:**
- **Demo:** Use sandbox environment (test data)
- **Production:** Apply for production API access
- **Cost:** ~₹1-5 per verification (estimated)

---

## 5. Data Architecture

### 5.1 Storage Strategy

**Amazon S3 - Object Storage**
- **Purpose:** Images, videos, audio files
- **Structure:**
  ```
  swavalambi-media/
    ├── images/
    │   ├── user123/
    │   │   ├── work_sample_1.jpg
    │   │   └── work_sample_2.jpg
    ├── videos/
    │   └── user123/
    │       └── demo_video.mp4
    └── audio/
        └── user123/
            └── conversation_session456.mp3
  ```
- **Lifecycle:** Move to Glacier after 90 days
- **Access:** Presigned URLs (24-hour expiry)

**DynamoDB - NoSQL Database**
- **Purpose:** User profiles, conversation history, cooperatives
- **Tables:**
  1. **users:** User profiles and context
  2. **conversations:** Chat history
  3. **cooperatives:** NCDC database (8.5L+ entries)
  4. **schemes:** Government schemes (400+)

**Amazon RDS (PostgreSQL) - Relational Database**
- **Purpose:** Structured data with relationships
- **Tables:**
  1. **businesses:** Verified business details
  2. **skill_market_data:** Skill-income mapping
  3. **training_centers:** NSDC + curated list
  4. **verification_logs:** API Setu verification history

**OpenSearch Serverless - Vector Search**
- **Purpose:** Semantic search for schemes and opportunities
- **Indexes:**
  1. **schemes_index:** Government scheme embeddings
  2. **opportunities_index:** Business opportunity embeddings
  3. **skills_index:** Skill description embeddings

### 5.2 Database Schemas

**RDS Schema (PostgreSQL):**
```sql
-- Businesses table
CREATE TABLE businesses (
  business_id SERIAL PRIMARY KEY,
  business_name VARCHAR(200) NOT NULL,
  udyam_number VARCHAR(50),
  gst_number VARCHAR(15),
  verification_status VARCHAR(20),
  verification_score INT,
  verification_date DATE,
  contact_name VARCHAR(100),
  contact_phone VARCHAR(15),
  contact_email VARCHAR(100),
  address TEXT,
  location_city VARCHAR(50),
  location_state VARCHAR(50),
  location_coordinates POINT,
  skill_required VARCHAR(50),
  skill_level_min INT,
  skill_level_max INT,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  work_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill market data table
CREATE TABLE skill_market_data (
  skill_id SERIAL PRIMARY KEY,
  base_skill VARCHAR(50),
  skill_name VARCHAR(100),
  avg_income DECIMAL(10,2),
  demand_level VARCHAR(20),
  difficulty VARCHAR(20),
  time_to_learn_months INT,
  data_source VARCHAR(100),
  last_updated DATE
);

-- Training centers table
CREATE TABLE training_centers (
  center_id SERIAL PRIMARY KEY,
  center_name VARCHAR(200),
  skill_taught VARCHAR(50),
  location_city VARCHAR(50),
  location_state VARCHAR(50),
  location_coordinates POINT,
  distance_km DECIMAL(5,2),
  cost DECIMAL(10,2),
  duration_months INT,
  schedule VARCHAR(100),
  rating DECIMAL(3,2),
  contact_phone VARCHAR(15),
  data_source VARCHAR(50),
  last_updated DATE
);

-- Verification logs table
CREATE TABLE verification_logs (
  log_id SERIAL PRIMARY KEY,
  business_id INT REFERENCES businesses(business_id),
  verification_type VARCHAR(20),
  api_response JSON,
  verification_status VARCHAR(20),
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 Data Sources & Acquisition

**Real Public Data Sources:**

1. **data.gov.in - Open Government Data Platform**
   - MSME registration data (latest datasets)
   - Skill training center locations
   - Access: Free, no API key for many datasets

2. **API Setu (apisetu.gov.in)**
   - Udyam verification API
   - GST verification API
   - DigiLocker for certificates
   - Access: Sandbox for demo, production API for deployment

3. **NSDC (National Skill Development Corporation)**
   - Training center database (current listings)
   - Skill certification data
   - API: https://apis.guru/apis/apisetu.gov.in/nsdcindia
   - Access: Publicly accessible

4. **NCDC (National Cooperative Database)**
   - 8.5L+ registered cooperatives (latest available data)
   - Available online and on request

5. **Government Scheme Websites:**
   - PM Vishwakarma: https://pmvishwakarma.gov.in/
   - MUDRA: https://www.mudra.org.in/
   - Stand-Up India: https://www.standupmitra.in/
   - Access: Public information, current data

**For Hackathon Demo:**
- ✅ Use latest public data from data.gov.in
- ✅ API Setu sandbox for verification demo
- ✅ NSDC training center data (current)
- ✅ Cooperative data from online sources
- ✅ Current scheme data from government websites
- ✅ Curated business examples for pilot (from current online listings)

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

**AWS Cognito:**
- User pools for worker authentication
- Separate user pool for business authentication
- MFA optional (SMS-based)
- Social login: Google, Facebook (Phase 2)

**Authorization Levels:**
- **Worker:** Access own profile, opportunities, schemes
- **Business:** Access worker profiles (with consent), post opportunities
- **Admin:** Full access, verification management

### 6.2 Data Security

**Encryption:**
- **At Rest:** AES-256 (S3, RDS, DynamoDB)
- **In Transit:** TLS 1.3 (all API calls)
- **Secrets:** AWS Secrets Manager (API keys, DB credentials)

**Content Filtering:**
- **AWS Bedrock Guardrails:** Filter inappropriate content
- **Moderation:** Flag suspicious images/text for review

**Privacy:**
- **GDPR Compliance:** Right to access, delete, portability
- **Data Minimization:** Collect only necessary data
- **Consent Management:** Explicit consent for data usage
- **Anonymization:** Remove PII for analytics

### 6.3 API Security

**AWS WAF (Web Application Firewall):**
- Rate limiting: 100 requests/minute per IP
- SQL injection protection
- XSS protection
- Geo-blocking (if needed)

**API Gateway:**
- API keys for external integrations
- Request validation
- Throttling: 1000 requests/second
- CORS configuration

---

## 7. Scalability & Performance

### 7.1 Scalability Strategy

**Phase 1: Demo (100 users)**
- Single-region deployment (ap-south-1 Mumbai)
- RDS: db.t3.micro (1 vCPU, 1GB RAM)
- DynamoDB: On-demand pricing
- Lambda: 128MB memory, 30s timeout

**Phase 2: MVP (1K users)**
- RDS: db.t3.small (2 vCPU, 2GB RAM)
- DynamoDB: Provisioned capacity (10 RCU, 10 WCU)
- Lambda: 256MB memory
- CloudFront CDN for static assets

**Phase 3: Pilot (10K users)**
- RDS: db.t3.medium (2 vCPU, 4GB RAM), Multi-AZ
- DynamoDB: Auto-scaling (10-100 RCU/WCU)
- Lambda: 512MB memory, concurrency limits
- ElastiCache for caching (Redis)

**Phase 4: Scale (100K+ users)**
- RDS: db.r5.large (2 vCPU, 16GB RAM), Multi-AZ, Read replicas
- DynamoDB: Global Tables (multi-region)
- Lambda: Provisioned concurrency
- Multi-region deployment (Mumbai, Singapore)

### 7.2 Performance Optimization

**Caching Strategy:**
- **CloudFront:** Static assets (images, CSS, JS)
- **ElastiCache:** Frequently accessed data (schemes, training centers)
- **DynamoDB DAX:** User profiles, conversation history
- **TTL:** 24 hours for web search results

**Database Optimization:**
- **Indexes:** Create indexes on frequently queried columns
- **Connection Pooling:** RDS Proxy for connection management
- **Query Optimization:** Use EXPLAIN ANALYZE, optimize slow queries

**Lambda Optimization:**
- **Cold Start Reduction:** Provisioned concurrency for critical functions
- **Memory Tuning:** Right-size memory based on profiling
- **Async Processing:** Use SQS for non-critical tasks

**Target Performance:**
- API response time: < 2 seconds (p95)
- Image upload: < 5 seconds (10MB)
- Vision analysis: < 10 seconds
- Voice response: < 2 seconds

---

## 8. Monitoring & Observability

### 8.1 Monitoring Stack

**AWS CloudWatch:**
- **Metrics:** Lambda invocations, API Gateway requests, RDS CPU/memory
- **Logs:** Centralized logging for all services
- **Alarms:** Alert on errors, high latency, resource exhaustion

**Custom Metrics:**
- User journey completion rate
- Agent response time (per agent)
- Verification success rate
- Scheme match accuracy

### 8.2 Logging Strategy

**Log Levels:**
- **ERROR:** System failures, API errors
- **WARN:** Degraded performance, fallback usage
- **INFO:** User actions, agent invocations
- **DEBUG:** Detailed execution flow (dev only)

**Log Aggregation:**
- CloudWatch Logs Insights for querying
- Retention: 30 days (production), 7 days (dev)

### 8.3 Alerting

**Critical Alerts (PagerDuty):**
- API Gateway 5xx errors > 1%
- RDS CPU > 80%
- Lambda errors > 5%
- Verification service down

**Warning Alerts (Email):**
- API latency > 3 seconds
- DynamoDB throttling
- S3 upload failures

---

## 9. Testing Strategy

### 9.1 Unit Testing

**Coverage Target:** 80%+

**Test Frameworks:**
- Python: pytest
- JavaScript: Jest

**Test Cases:**
- Vision Agent: Mock Bedrock responses, test skill level assignment
- Profiling Agent: Test conversation flow, language translation
- Market Agent: Test ranking algorithm, verification badge logic
- Upskilling Agent: Test ROI calculation, training recommendations
- Scheme Agent: Test eligibility matching, document checklist
- Network Agent: Test cooperative search, distance calculation

### 9.2 Integration Testing

**Test Scenarios:**
- End-to-end user journey (upload → conversation → personalized plan)
- API Setu integration (sandbox environment)
- Database operations (CRUD operations)
- S3 upload/download
- OpenSearch vector search

### 9.3 Load Testing

**Tools:** Apache JMeter, AWS Load Testing

**Test Scenarios:**
- 100 concurrent users (MVP)
- 1000 concurrent users (Pilot)
- Spike test: 0 → 500 users in 1 minute

**Metrics:**
- Response time (p50, p95, p99)
- Error rate
- Throughput (requests/second)

### 9.4 User Acceptance Testing (UAT)

**Beta Testing:**
- 20 tailors in Surat
- 5 businesses
- Collect feedback on:
  - Ease of use
  - Accuracy of recommendations
  - Trust in verification system
  - Regional language quality

---

## 10. Deployment Architecture

### 10.1 Infrastructure as Code

**AWS CDK (Cloud Development Kit):**
- Define infrastructure in Python
- Version control with Git
- Automated deployment via CI/CD

**Stack Structure:**
```
swavalambi-cdk/
├── lib/
│   ├── auth-stack.ts          # Cognito
│   ├── api-stack.ts           # API Gateway, Lambda
│   ├── storage-stack.ts       # S3, DynamoDB, RDS
│   ├── ai-stack.ts            # Bedrock, OpenSearch
│   └── monitoring-stack.ts    # CloudWatch
├── bin/
│   └── swavalambi.ts          # Entry point
└── package.json
```

### 10.2 CI/CD Pipeline

**GitHub Actions:**
1. **Build:** Install dependencies, run tests
2. **Test:** Unit tests, integration tests
3. **Deploy to Dev:** Automatic on push to `dev` branch
4. **Deploy to Staging:** Automatic on push to `main` branch
5. **Deploy to Production:** Manual approval required

**Environments:**
- **Dev:** For development and testing
- **Staging:** Pre-production environment
- **Production:** Live environment

### 10.3 Rollback Strategy

**Blue-Green Deployment:**
- Maintain two identical environments (blue, green)
- Deploy to inactive environment
- Switch traffic after validation
- Instant rollback if issues detected

**Database Migrations:**
- Backward-compatible migrations
- Test on staging before production
- Automated backups before migration

---

## 11. Cost Estimation

### 11.1 Hackathon Demo (15 days, 100 users)

| Service | Usage | Cost |
|---------|-------|------|
| AWS Bedrock | 1000 API calls | $20 |
| OpenSearch Serverless | 1GB data, 1000 queries | $10 |
| S3 | 10GB storage, 1000 uploads | $1 |
| DynamoDB | 1M reads, 100K writes | $2 |
| RDS | db.t3.micro, 20GB | $15 |
| Lambda | 10K invocations | $1 |
| API Gateway | 10K requests | $1 |
| **Total** | | **$50** |

### 11.2 MVP (2 months, 1K users)

| Service | Usage | Cost/Month |
|---------|-------|------------|
| AWS Bedrock | 10K API calls | $200 |
| OpenSearch Serverless | 10GB data, 10K queries | $100 |
| S3 | 100GB storage, 10K uploads | $5 |
| DynamoDB | 10M reads, 1M writes | $20 |
| RDS | db.t3.small, 100GB, Multi-AZ | $100 |
| Lambda | 100K invocations | $5 |
| API Gateway | 100K requests | $5 |
| API Setu | 1K verifications | $100 |
| CloudWatch | Logs, metrics | $15 |
| **Total** | | **$550/month** |

### 11.3 Pilot (6 months, 10K users)

| Service | Usage | Cost/Month |
|---------|-------|------------|
| AWS Bedrock | 100K API calls | $2,000 |
| OpenSearch Serverless | 100GB data, 100K queries | $800 |
| S3 | 1TB storage, 100K uploads | $30 |
| DynamoDB | 100M reads, 10M writes | $200 |
| RDS | db.t3.medium, 500GB, Multi-AZ | $300 |
| Lambda | 1M invocations | $20 |
| API Gateway | 1M requests | $20 |
| API Setu | 10K verifications | $1,000 |
| CloudWatch | Logs, metrics, alarms | $100 |
| ElastiCache | cache.t3.micro | $30 |
| **Total** | | **$4,500/month** |

**Cost Optimization:**
- Use Savings Plans for Bedrock (20% discount)
- Reserved Instances for RDS (40% discount)
- S3 Intelligent-Tiering for storage
- Lambda Provisioned Concurrency only for critical functions

---

## 12. Constraints & Mitigation Strategies

### 12.1 Time Constraints

**Constraint:** Building complete platform with 6 agents and full feature set

**Why This Is Achievable:**
- ✅ **AWS Managed Services:** Bedrock Agent Core, RDS, DynamoDB, OpenSearch (no infrastructure setup)
- ✅ **Zero-Shot Models:** Bedrock Vision requires no training data
- ✅ **Real Public Data:** data.gov.in, NSDC, NCDC available now
- ✅ **Multi-Agent Framework:** Bedrock Agent Core built specifically for this
- ✅ **Parallel Development:** Frontend + backend + agents can be built simultaneously
- ✅ **Team Capabilities:** AI tools available for rapid development
- ✅ **Smart Focus:** Start with tailoring in Surat, validate, then scale

**Complete Feature Set:**
- ✅ All 6 agents operational
- ✅ Vision assessment (tailoring initially, expandable to other skills)
- ✅ Voice conversation (Hindi, Gujarati initially, expandable to 5+ languages)
- ✅ Verified marketplace (API Setu or alternative verification)
- ✅ Complete ecosystem (Jobs + Schemes + Training + Networks)
- ✅ Mobile-responsive web app (PWA)

### 12.2 Data Constraints

**Constraint:** Need current, verified business data

**Mitigation:**
- ✅ Use latest data from data.gov.in
- ✅ API Setu real-time verification
- ✅ Web search for current opportunities
- ✅ Curated examples from current online listings (20-30 Surat businesses)

**Constraint:** Cooperative database access

**Mitigation:**
- ✅ Use latest NCDC data available online
- ✅ State cooperative directories (current listings)
- ✅ Web search for local associations
- ✅ Manual curation for pilot (20-30 cooperatives from current sources)

### 12.3 Technical Constraints

**Constraint:** Vision model accuracy for diverse work types

**Mitigation:**
- ✅ Start with one skill (tailoring) for pilot
- ✅ Collect feedback, improve prompts
- ✅ Build training dataset from user uploads
- ✅ Expand to other skills gradually

**Constraint:** Regional language quality (Transcribe/Translate)

**Mitigation:**
- ✅ Focus on 5 major languages initially
- ✅ Test with native speakers
- ✅ Provide text fallback option
- ✅ Improve with user feedback

**Constraint:** Multi-agent complexity

**Mitigation:**
- ✅ AWS Bedrock Agent Core (built for this)
- ✅ Sequential pipeline (simpler than parallel)
- ✅ Shared services reduce duplication
- ✅ Comprehensive testing strategy

### 12.4 User Constraints

**Constraint:** Low smartphone penetration in target segment

**Mitigation:**
- ✅ Partner with local kiosks/NGOs for assisted onboarding
- ✅ SMS notifications for updates
- ✅ Progressive web app (works on basic smartphones)
- ✅ Offline capability for basic features (Phase 2)

**Constraint:** Digital literacy

**Mitigation:**
- ✅ Voice-first interface (minimal typing)
- ✅ Regional languages
- ✅ Visual instructions with icons
- ✅ Community ambassadors for onboarding
- ✅ Video tutorials in local languages

### 12.5 Business Constraints

**Constraint:** Cold start problem (no businesses initially)

**Mitigation:**
- ✅ Manual curation for pilot (50 businesses)
- ✅ Partner with Surat textile associations
- ✅ Incentivize early sign-ups (free for 3 months)
- ✅ Web search as fallback
- ✅ Focus on verified quality over quantity

**Constraint:** Trust building (scam concerns)

**Mitigation:**
- ✅ API Setu verification mandatory
- ✅ Two-way verification (workers + businesses)
- ✅ Rating and review system
- ✅ Success stories and testimonials
- ✅ Money-back guarantee for premium (Phase 2)

---

## 13. Future Enhancements (Post-Hackathon)

### Phase 2 (3-6 months)
- Mobile native apps (iOS, Android)
- 5 skills (tailoring, mechanics, beauticians, carpenters, electricians)
- 5 cities (Surat, Jaipur, Ludhiana, Coimbatore, Kanpur)
- Payment processing (scheme application fees)
- Advanced analytics dashboard
- Offline capability

### Phase 3 (6-12 months)
- 10+ skills
- 20+ cities
- Blockchain-based skill certificates
- AI-powered resume builder
- Video interview platform
- Employer dashboard

### Phase 4 (12-24 months)
- National expansion (90M+ workers)
- International markets (Bangladesh, Sri Lanka, Nepal)
- B2B SaaS for recruitment agencies
- Government partnerships (MSME, Skill India)
- Series A fundraising

---

## 14. Technical Risks & Mitigation

### 14.1 Critical Risks

| Risk | Impact | Probability | Mitigation Strategy | Contingency Plan |
|------|--------|-------------|---------------------|------------------|
| **Vision model accuracy below 70%** | High | Medium | • Start with tailoring only (simpler patterns)<br>• Collect 100 samples for validation<br>• Iterate on prompts with expert feedback<br>• Use multi-modal validation (vision + voice) | • Implement AI-assisted assessment (AI suggests, human verifies)<br>• Partner with master tailors for verification<br>• Reduce to 3-level scale (beginner/intermediate/expert) |
| **API Setu access delays** | Medium | Low | • Use sandbox for demo immediately<br>• Apply for production access early (Day 1)<br>• Document all API requirements<br>• Have backup contact at API Setu | • Use mock verification for demo<br>• Manual verification for pilot<br>• Partner with CA firms for GST verification<br>• Delay business verification to Phase 2 |
| **Cold start problem (no businesses)** | High | Medium | • Curate 50 businesses from current online sources<br>• Partner with Surat textile associations<br>• Offer free listing for 3 months<br>• Web search as fallback | • Focus on scheme matching first (no businesses needed)<br>• Partner with NGOs for job placement<br>• Use government employment exchanges<br>• Pivot to training-first model |
| **User trust (scam concerns)** | High | Medium | • API Setu verification mandatory<br>• Display verification badges prominently<br>• Rating and review system<br>• Success stories and testimonials | • Money-back guarantee for premium<br>• Insurance partnership for fraud protection<br>• Community ambassadors for trust building<br>• Escrow service for payments (Phase 2) |
| **Data privacy breach** | High | Low | • GDPR compliance from Day 1<br>• Encryption at rest and in transit<br>• Regular security audits<br>• AWS WAF for protection | • Incident response plan ready<br>• Cyber insurance<br>• Legal team on retainer<br>• Transparent communication with users |

### 14.2 Medium Risks

| Risk | Impact | Probability | Mitigation Strategy | Contingency Plan |
|------|--------|-------------|---------------------|------------------|
| **Regional language quality issues** | Medium | Medium | • Focus on 5 major languages initially<br>• Test with native speakers<br>• Provide text fallback option<br>• Collect user feedback | • English/Hindi only for demo<br>• Partner with translation services<br>• Community volunteers for translation<br>• Voice-to-text only (no translation) |
| **OpenSearch cost overrun** | Medium | Medium | • Use Serverless (pay-per-use)<br>• Optimize queries and indexes<br>• Implement caching (24-hour TTL)<br>• Monitor costs daily | • Switch to DynamoDB for vector search<br>• Use PostgreSQL pgvector extension<br>• Reduce embedding dimensions<br>• Limit search to top 10 results |
| **Low smartphone penetration** | Medium | High | • Partner with local kiosks/NGOs<br>• SMS notifications for updates<br>• Progressive web app (works on basic phones)<br>• Assisted onboarding | • USSD interface (*123# codes)<br>• WhatsApp bot integration<br>• Voice call-based interface<br>• Physical centers in each area |
| **Multi-agent complexity** | Medium | Low | • Use Bedrock Agent Core (built for this)<br>• Sequential pipeline (simpler)<br>• Comprehensive testing<br>• Shared services reduce duplication | • Simplify to 3 agents (Vision, Market, Scheme)<br>• Monolithic architecture for demo<br>• Manual orchestration<br>• Defer complex features to Phase 2 |
| **Scalability bottlenecks** | Medium | Low | • Managed services with auto-scaling<br>• Load testing before launch<br>• Multi-AZ deployment<br>• Caching strategy | • Horizontal scaling with load balancers<br>• Database read replicas<br>• Queue-based processing (SQS)<br>• Rate limiting per user |

### 14.3 Low Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| **AWS service outages** | High | Very Low | • Multi-AZ deployment<br>• Regular backups<br>• Disaster recovery plan<br>• Status page monitoring |
| **Bedrock API rate limits** | Low | Low | • Request limit increase early<br>• Implement exponential backoff<br>• Queue requests during peak<br>• Cache responses |
| **Cooperative data outdated** | Low | Medium | • Use latest NCDC data<br>• Web search for current info<br>• Manual verification for pilot<br>• User-reported updates |
| **Training center data stale** | Low | Medium | • Use NSDC API for current data<br>• Web search fallback<br>• User feedback on accuracy<br>• Quarterly data refresh |

### 14.4 Risk Monitoring & Response

**Weekly Risk Review:**
- Track risk probability and impact changes
- Update mitigation strategies based on progress
- Escalate critical risks to stakeholders
- Document lessons learned

**Risk Indicators:**
- Vision accuracy: Test weekly with 10 new samples
- API Setu status: Check sandbox daily
- Business onboarding: Track weekly sign-ups
- User trust: Monitor ratings and reviews
- Cost: Daily AWS cost monitoring

**Escalation Path:**
- Low risk: Team handles internally
- Medium risk: Project lead informed, weekly review
- High risk: Stakeholders informed immediately, daily review
- Critical risk: Emergency meeting, contingency plan activated

---

## 15. Success Criteria (Technical)

### 15.1 Functional Requirements
- ✅ All 6 agents operational
- ✅ Vision assessment accuracy: 70-80% (industry benchmark)
- ✅ Voice conversation in 5 languages
- ✅ API Setu integration working (sandbox)
- ✅ Personalized plan generation < 30 seconds
- ✅ Mobile-responsive web app

### 15.2 Non-Functional Requirements
- ✅ API response time: < 2 seconds (p95)
- ✅ System availability: 99.5%+
- ✅ Concurrent users: 1000+
- ✅ Data encryption (at rest + in transit)
- ✅ GDPR compliance

### 15.3 Business Metrics
- ✅ 10K users in 6-month pilot
- ✅ 500 verified businesses
- ✅ 60% user engagement (return within 7 days)
- ✅ 30% apply for schemes
- ✅ 40% average income increase
- ✅ 4.5+ user rating

---

## 16. Conclusion

Swavalambi's technical design demonstrates:

1. **Smart Technology Choices:**
   - AWS Bedrock Agent Core for multi-agent orchestration
   - Hybrid data strategy (DB + web search) addresses data constraints
   - Managed services enable rapid development

2. **Constraint Awareness:**
   - Time: 15-day timeline → AWS managed services, phased rollout
   - Data: Outdated census → API Setu + web search + manual curation
   - Cost: Limited budget → Pay-per-use, optimization strategies
   - User: Low literacy → Voice-first, regional languages

3. **Scalability & Maintainability:**
   - Start focused (Surat tailors), scale gradually
   - Separation of concerns (6 specialized agents)
   - Infrastructure as Code (AWS CDK)
   - Comprehensive testing strategy

4. **Security & Trust:**
   - Two-way verification (AI assessment + API Setu)
   - Encryption, content filtering, GDPR compliance
   - Verified marketplace prevents scams
