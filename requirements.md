# Swavalambi - Requirements Document
## "Skills to Self-Reliance"

**Project:** Swavalambi - AI-Powered Skills Marketplace  
**Track:** AWS AI for Bharat Hackathon - Professional Track  
**Date:** January 23, 2025  
**Version:** 2.0

---

## 1. Executive Summary

**The Problem Others Miss:**

90M+ skilled workers in India's informal sector can't prove their abilities (no certificates) and fear scams from unverified businesses. Existing platforms focus on job listings but ignore the fundamental trust problem: workers can't prove skills, businesses don't trust self-reports, and both sides fear fraud.

**Our Insight:**

We're not asking "How do we list more jobs?" We're asking "How can workers prove skills AND access opportunities safely?" This reframing led us to a novel solution: a two-way verified marketplace where workers are assessed by AI and businesses are verified by government APIs.

**The Solution:**

Swavalambi is a multi-agent AI platform that empowers 90M+ skilled workers through:
1. **AI-Powered Skill Assessment:** Objective evaluation from work samples (no certificates needed)
2. **Verified Marketplace:** Business verification (API Setu preferred, alternatives available) - no scams
3. **Complete Ecosystem:** Jobs + Schemes + Training + Networks in one platform
4. **Regional Language Access:** Voice-first interface in 5+ languages

**Core Value Proposition:** Upload photo → AI skill assessment → Get verified opportunities + upskilling path

**Key Innovation:** First standardized AI-powered skill assessment for informal sector workers, combined with two-way verified marketplace to prevent scams.

**Impact:** 40% average income increase, 30% scheme adoption, <5% scam rate, serving 90M+ workers nationally.

---

## 2. Problem Statement

### 2.1 Asking a Better Question

While existing platforms focus on job listings or skill training separately, **we're asking a different question**: 

*"How can 90M+ skilled workers prove their abilities and access opportunities when they lack certificates, awareness, and connections - while ensuring trust and preventing scams?"*

This question uncovers overlooked aspects that others typically ignore:
- **Skill verification without certificates** (workers can't prove abilities)
- **Two-way trust problem** (workers fear scams, businesses don't trust self-reports)
- **Isolation from networks** (8.5L+ cooperatives exist but workers don't know about them)

### 2.2 Target Audience (Clear Beneficiaries)

**Primary Beneficiaries: 90M+ Skilled Workers in Informal Sector**

**Data Source:** India Employment Report 2024 (ILO) - 643M total workforce, 82% informal = 527M, with 90M+ in skilled trades (manufacturing, construction, services excluding agriculture)

**Specific Focus:**
- **12M+ tailors** (Data for India, 2024) - Initial pilot focus
- Mechanics, beauticians, carpenters, electricians, artisans
- Primarily Tier 2/3 cities
- Earning ₹5-10K/month with no growth path
- Age: 18-45 years
- Limited formal education, no skill certificates
- Regional language speakers (Hindi, Gujarati, Tamil, etc.)

**Secondary Beneficiaries:**
- **Businesses:** MSMEs struggling to find qualified workers
- **Government:** Increase scheme adoption (PM Vishwakarma, MUDRA)
- **Training Centers:** Connect with motivated learners

### 2.3 Core Pain Points

1. **No Skill Verification Without Certificates** ⭐ *Overlooked Problem*
   - Workers can't prove skills objectively
   - Employers don't trust self-reported abilities
   - No standardized assessment exists for informal sector
   - **Our Solution:** AI-powered objective assessment from work samples

2. **Two-Way Trust Problem** ⭐ *Overlooked Problem*
   - Workers fear scams from unverified businesses
   - Businesses don't trust worker claims
   - Existing platforms have no verification
   - **Our Solution:** API Setu verification + AI assessment = mutual trust

3. **No Visibility of Better Markets**
   - Don't know where demand exists
   - Limited to local, low-paying opportunities
   - No access to verified buyers

4. **Unaware of Government Schemes**
   - 400+ schemes exist but no personalized matching
   - Don't know eligibility criteria
   - Complex application processes

5. **Isolated from Networks**
   - Don't know about 8.5L+ cooperatives (NCDC database)
   - Missing bulk order opportunities
   - No peer support or learning

6. **Cold Calling & Scams** ⭐ *Overlooked Problem*
   - Existing platforms lead to spam calls
   - Unverified businesses exploit workers
   - No safety mechanisms
   - **Our Solution:** Verified marketplace + warm introductions only

### 2.4 Problem Evidence & Market Signals

**Industry Data (Publicly Available):**
- **India Employment Report 2024 (ILO):** 643M total workforce, 82% informal = 527M workers, with 90M+ in skilled trades (manufacturing, construction, services excluding agriculture)
- **NSDC Reports:** 68% of informal workers lack skill certificates, creating barrier to better opportunities
- **Government Data:** PM Vishwakarma scheme (launched 2023) has <20% awareness in target segment despite ₹13,000 Cr allocation
- **News Reports:** Multiple documented cases of job scams targeting informal workers through unverified platforms
- **Data for India (2024):** 12M+ tailors in India, earning average ₹5-10K/month

**Market Signals:**
- **Existing Platform Issues:** Apna, WorkIndia show demand (millions of users) but face spam/scam complaints due to lack of verification
- **Government Recognition:** PM Vishwakarma launch (2023) validates problem - government investing ₹13,000 Cr to support traditional artisans
- **UrbanClap Success:** ₹1,000+ Cr valuation proves willingness to pay for verified service providers (but focuses on formal sector)
- **LinkedIn Model:** $15B+ market cap proves skill verification creates massive marketplace value (but only for white-collar)

**Observable Problem Patterns:**
- **Skill Verification Gap:** Workers can't prove skills without certificates → stuck in low-paying jobs
- **Trust Deficit:** Businesses don't trust self-reported abilities → high recruitment costs (₹5K+ per hire)
- **Scam Prevalence:** Unverified platforms lead to spam calls and fraud → workers fear online platforms
- **Scheme Underutilization:** 400+ government schemes exist but <20% awareness → benefits don't reach intended beneficiaries
- **Network Isolation:** 8.5L+ cooperatives exist (NCDC data) but workers don't know about them → miss bulk order opportunities

**Why This Problem Matters:**
- **Scale:** 90M+ workers affected (15% of total workforce)
- **Impact:** ₹5-10K/month current income → 40%+ increase potential with better opportunities
- **Urgency:** Workers face daily scams, businesses struggle to hire, government schemes underutilized
- **Market Inefficiency:** Trust gap prevents skilled workers from accessing better opportunities despite demand

**Problem Validation Approach:**
Once selected, we will validate through:
- Interviews with 20+ tailors in Surat textile district
- Surveys with boutique owners about recruitment challenges
- Testing Vision AI accuracy with 50+ work samples
- Partnership with 1-2 textile associations for pilot
- Analysis of complaint data from existing platforms

---

## 3. Solution Overview

### 3.1 What Makes This Novel

**Novel Approach Combining Existing Ideas in New Ways:**

1. **Standardized AI-Powered Skill Assessment**
   - First objective assessment system for informal sector
   - Vision AI analyzes actual work samples (not self-reports)
   - Standardized 1-5 skill level framework
   - Multi-modal validation (vision + voice)

2. **Two-Way Verified Marketplace**
   - Workers verified via AI assessment
   - Businesses verified via API Setu (Udyam, GST, eCourts)
   - Mutual trust = warm introductions, not cold calls

3. **Complete Ecosystem (Not Single-Purpose)**
   - Jobs + Schemes + Training + Network in one platform
   - 6 specialized AI agents working together
   - Hybrid data strategy (DB + real-time web search)

4. **Multi-Modal Regional Language Interface**
   - Vision (photo/video) + Voice (conversation)
   - 5+ regional languages
   - Accessible to low-literacy users

### 3.2 How It's Different

| Aspect | Existing Solutions | Swavalambi |
|--------|-------------------|------------|
| **Skill Verification** | Self-reported or none | AI-powered objective assessment |
| **Trust Mechanism** | No verification | Two-way: AI assessment + API Setu |
| **Scam Prevention** | None | Verified businesses only |
| **Approach** | Single-purpose | Complete ecosystem |
| **Assessment** | No standardization | Standardized 1-5 skill levels |
| **Language** | English/Hindi text | Voice in 5+ regional languages |
| **Data** | Static databases | Hybrid: DB + real-time web search |
| **Output** | Generic listings | Personalized plan with real contacts |

**vs Competitors:**
- **Skill India:** Static portal → Swavalambi: AI personalization + verification
- **UrbanClap:** Unverified marketplace → Swavalambi: Two-way verification + assessment
- **NEEM:** Generic scheme list → Swavalambi: Eligibility matching + documents
- **Job Portals:** Cold calls, spam → Swavalambi: Verified warm introductions

### 3.3 Competitive Advantage & Defensibility

**Why Can't Existing Players Do This?**

| Player | Why They Won't Compete |
|--------|----------------------|
| **UrbanClap/Urban Company** | Focused on formal service providers (plumbers, electricians with certifications). Informal sector workers (no certificates) don't fit their model. Building trust with 90M+ certificate-less workers requires different approach. |
| **LinkedIn/Naukri** | Target white-collar jobs. No skill assessment for blue-collar trades. No regional language support. No scam prevention for informal sector. |
| **Skill India Portal** | Government portal focused on training, not marketplace. No business verification. No personalized matching. Static, not AI-powered. |
| **Apna/WorkIndia** | Job listings only, no skill verification. No two-way trust mechanism. Cold calling model (spam problem). No upskilling or scheme matching. |

**Our Defensible Advantages:**

1. **Network Effects:** Two-sided marketplace with verified workers + verified businesses
   - More workers → More businesses → More workers (flywheel)
   - Trust takes 2-3 years to build - hard to replicate

2. **Data Moat:** 
   - Skill assessment data (portfolio building over time)
   - Skill-income correlation data (proprietary)
   - Verification history (fraud patterns)

3. **Focus:** 
   - Laser-focused on informal sector (90M+ workers)
   - Incumbents chase formal sector (higher margins, easier)
   - We own the underserved segment

4. **First-Mover Advantage:**
   - First standardized AI skill assessment for informal sector
   - Building trust with cooperatives, NGOs, textile associations
   - Relationships take time to build

**Why We'll Win:**
- We're solving a problem others ignore (trust + skill verification)
- We're building for users others overlook (certificate-less workers)
- We're creating a complete ecosystem, not just a feature

### 3.4 Core Solution Components

**6 Specialized AI Agents** (Multi-agent requirement ✅)

1. **Vision Agent:** AI-powered skill assessment from work samples
2. **Profiling Agent:** Smart Q&A in regional languages
3. **Market Agent:** Matches to verified opportunities
4. **Upskilling Agent:** Identifies skill gaps and training
5. **Scheme Agent:** Matches 400+ government schemes
6. **Network Agent:** Connects to cooperatives and peers

**Two-Sided Verified Marketplace:**
- **Supply Side:** Workers with AI-assessed skills
- **Demand Side:** API Setu verified businesses
- **Result:** Mutual trust → warm introductions, not cold calls

---

## 4. Standardized Skill Assessment Framework

### 4.1 The Assessment Mechanism We're Proposing

**YES - We are creating the first standardized AI-powered skill assessment for informal sector workers**

### 4.2 How It Works

**Step 1: Vision-Based Quality Assessment**
- **Input:** Photo/video of work sample
- **AI Analysis:** 
  - Quality of finish
  - Technique proficiency
  - Attention to detail
  - Complexity handled
  - Comparison with market standards
- **Output:** Objective quality score

**Step 2: Standardized Skill Level (1-5 Scale)**

| Level | Description | Capability | Market Value |
|-------|-------------|------------|--------------|
| **1 - Beginner** | Basic tasks, needs supervision | Simple repairs, basic stitching | ₹5-8K/month |
| **2 - Developing** | Routine tasks, minimal supervision | Standard work, good quality | ₹8-12K/month |
| **3 - Competent** | Independent work, consistent quality | Complex tasks, reliable | ₹12-18K/month |
| **4 - Proficient** | High quality, can train others | Advanced techniques, mentorship | ₹18-25K/month |
| **5 - Expert** | Master craftsman, innovation | Custom work, business owner | ₹25K+/month |

**Accuracy Target & Validation Plan:**
- **Target:** 70-80% accuracy vs expert assessment (industry benchmark for zero-shot vision models)
- **Validation Approach:**
  1. Collect 100 work samples from tailors with known skill levels
  2. Get expert assessments (3 master tailors rate each sample)
  3. Compare AI assessment vs expert consensus
  4. Iterate on prompts to improve accuracy
- **Fallback:** If accuracy <70%, implement "AI-assisted assessment" (AI suggests, human verifies)
- **Continuous Improvement:** Collect feedback from employers post-hire to refine model

**Step 3: Skill-Specific Rubrics**
- **Tailoring:** Stitching quality, pattern matching, finishing, embroidery
- **Carpentry:** Joint quality, finish, precision, design
- **Mechanics:** Diagnostic ability, repair quality, efficiency, knowledge

**Step 4: Multi-Modal Validation**
- Voice conversation validates experience
- Consistency checks across data points
- Historical portfolio building

### 4.3 How Employers Will Trust This

**Not Self-Reported - Objective AI Assessment:**
1. **Actual Work Samples:** Analysis of real output, not claims
2. **Standardized Framework:** Consistent 1-5 scale across all workers
3. **Two-Way Verification:** We verify businesses too (API Setu)
4. **Rating System:** Post-hire feedback improves accuracy
5. **Portfolio Building:** Track record over time

**Trust Mechanism:**
- Workers trust us because we verify businesses (no scams)
- Businesses trust us because we assess workers objectively (not self-reports)
- **Mutual verification = marketplace trust**

---

## 5. Scam Prevention & Trust Building

### 5.1 How We Address Cold Calling & Scams

**Problem:** Existing platforms have unverified businesses leading to spam/scams

**Our Solution: Verified Two-Sided Marketplace**

### 5.2 Business Verification (Prevents Scams)

**Verification Options:**

**Primary: API Setu Integration (Government APIs)**
- **Udyam Registration:** Verify MSME status
- **GST Validation:** Confirm active business
- **eCourts Check:** Legal status verification
- **Why API Setu:** Government-verified = instant trust, free/low-cost access, competitive advantage

**Alternatives (if API Setu unavailable):**
- **Private Services:** Karza, IDfy (faster approval, higher cost)
- **Manual Verification:** Partner with CAs for GST/Udyam checks
- **Community Verification:** Cooperative vouching + rating system
- **Hybrid Approach:** Combine multiple verification methods

**Verification Display:**
- **Verification Badge:** Displayed to workers
- **Annual Renewal:** Ongoing verification
- **Trust Score:** Based on verification level + user ratings

**Only verified businesses can:**
- Post opportunities
- Contact workers
- Access worker profiles

### 5.3 Warm Introductions (Not Cold Calls)

**How It's Different:**

| Cold Calling (Existing) | Warm Introduction (Swavalambi) |
|------------------------|--------------------------------|
| Random calls to workers | Pre-matched based on skills |
| Unverified businesses | API Setu verified only |
| No context | Full job details + business info |
| Spam/scams common | Scams filtered out |
| Worker has no info | Worker sees verification badge |

**Process:**
1. Business posts verified opportunity
2. AI matches relevant workers
3. Worker sees: Job details + Verification badge + Business info
4. Worker expresses interest
5. Contact details shared (mutual consent)
6. **Result:** Warm introduction with context, not cold call

### 5.4 Quality Control

- Business verification renewal (annual)
- User ratings and reviews (both sides)
- Complaint tracking and resolution
- Blacklist for bad actors
- Success rate monitoring

---

## 6. User Stories

### 6.1 Primary User: Skilled Worker

**User Story 1: Objective Skill Assessment**
```
As a tailor without certificates,
I want to prove my skills through my work samples,
So that employers can trust my abilities objectively.
```

**Acceptance Criteria:**
- User uploads photo/video of work
- AI provides objective skill level (1-5 scale)
- Assessment includes quality score and techniques
- Results stored as verified portfolio
- **Success Metric:** 70-80% accuracy vs expert assessment (industry benchmark)
- **Trust Metric:** Employers accept AI assessment as credible

**User Story 2: Verified Opportunity Discovery**
```
As a skilled worker earning ₹8K/month,
I want to find API Setu verified businesses,
So that I can earn better income without fear of scams.
```

**Acceptance Criteria:**
- System shows only verified businesses (API Setu)
- Verification badge clearly displayed
- Real contacts provided (name, phone, address)
- Ranked by relevance (location, skill, salary)
- **Success Metric:** 60% take action, <5% scam reports
- **Trust Metric:** 4.5+ user rating for safety

**User Story 3: Personalized Scheme Matching**
```
As a worker unaware of government schemes,
I want AI to match me to eligible schemes,
So that I can access loans and training.
```

**Acceptance Criteria:**
- AI matches user to eligible schemes
- Provides document checklist
- Explains in regional language
- Tracks application status
- **Success Metric:** 30% apply for schemes

**User Story 4: Skill Gap Analysis**
```
As a worker wanting to increase income,
I want to know which skills to learn for better pay,
So that I can make informed training decisions.
```

**Acceptance Criteria:**
- AI identifies skill gaps vs market demand
- Calculates income potential per skill
- Finds nearby training (DB + web search)
- Provides learning roadmap with ROI
- **Success Metric:** 20% complete training

**User Story 5: Network Discovery**
```
As an isolated worker,
I want to find nearby cooperatives,
So that I can access bulk orders and peer support.
```

**Acceptance Criteria:**
- System searches 8.5L+ cooperatives (NCDC)
- Provides membership process
- Connects to peer groups
- **Success Metric:** 15% join cooperatives

### 6.2 Secondary User: Business Owner

**User Story 6: Pre-Assessed Worker Discovery**
```
As an MSME owner,
I want to find AI-assessed, verified workers,
So that I can reduce recruitment costs and hire quality talent.
```

**Acceptance Criteria:**
- Business verified via API Setu
- Receives matched workers with skill levels
- Can see AI assessment details
- Direct contact after mutual interest
- **Success Metric:** ₹500 per lead (vs ₹5K traditional)

### 6.3 User Journey: Meet Rajesh

**Background:**
- Rajesh Patel, 32, tailor in Surat
- 10 years experience, earns ₹8,000/month
- No formal certificate, works in small shop
- Wants to earn more but doesn't know how

**Current Pain Points:**
- Can't prove his skills to better-paying boutiques
- Receives spam calls from fake job postings
- Unaware he's eligible for PM Vishwakarma scheme
- Doesn't know about Surat Tailors Cooperative (2km away)

**Journey with Swavalambi:**

**Day 1: Discovery**
- Rajesh hears about Swavalambi from a friend
- Downloads the app, sees it's in Gujarati (his language)
- Reads about verified opportunities (no scams)

**Day 2: Complete Assessment**
- Uploads photo of his best work (embroidered kurta)
- AI analyzes: "Level 3 - Competent, specialization in machine stitching"
- Voice conversation in Gujarati: Goals, preferences, constraints
- Rajesh is surprised - first time someone objectively assessed his skills

**Day 3: Personalized Plan**
- Receives complete personalized plan:
  - **5 verified opportunities** in Surat (₹15K-20K/month)
  - **PM Vishwakarma scheme** (₹15K grant + ₹1L loan)
  - **Upskilling path:** Learn embroidery → Earn ₹22K/month
  - **Surat Tailors Cooperative** (2.5km away) - bulk orders, peer support
- Meera Boutique catches his eye: ₹18,000/month, verified badge, 2.3km away

**Day 4: Applies to Opportunities**
- Applies to Meera Boutique with one click (no cold calling)
- Meera sees his AI assessment + work sample
- Also applies to PM Vishwakarma scheme (document checklist provided)

**Day 7: Interview & Job Offer**
- Meera calls Rajesh for interview (warm introduction)
- Shows his work sample, discusses experience
- Hired on the spot - ₹18,000/month (125% increase from ₹8K)
- Starts work immediately

**Week 2: Settles into New Job**
- Working at Meera Boutique
- Earning ₹18,000/month (more than double previous income)
- Realizes he wants to grow further

**Week 3: Upskilling Decision**
- Revisits Swavalambi's upskilling recommendation
- "Learn embroidery → Earn ₹22,000/month"
- Enrolls in nearby training center: ₹2,000 for 3-month weekend course
- Can learn while working (weekends only)

**Month 2: PM Vishwakarma Grant Approved**
- Receives ₹15,000 toolkit grant
- Uses it to buy advanced sewing machine and embroidery tools
- Approved for ₹1L loan @ 5% interest (for future business expansion)

**Month 3: Joins Cooperative**
- Completes embroidery training
- Joins Surat Tailors Cooperative (₹1,000 one-time + ₹100/month)
- Access to bulk orders, shared workspace
- Meets other tailors, learns new techniques
- Gets freelance embroidery projects through cooperative

**Month 6: Career Transformation**
- **Primary job:** Meera Boutique - ₹18,000/month
- **Freelance embroidery:** Through cooperative - ₹4,000/month
- **Total income:** ₹22,000/month (175% increase from ₹8K)
- Has advanced tools (PM Vishwakarma grant)
- Part of professional network (cooperative)
- Clear path to start own business (₹1L loan available)

**Rajesh's Testimonial:**
> "For 10 years, I couldn't prove my skills. Swavalambi gave me a certificate that employers trust. Now I earn 3x more, have advanced tools, and am part of a cooperative. Next year, I'll start my own boutique with the loan."

---

## 7. Functional Requirements

### 7.1 User Interface

**FR-1: Photo/Video Upload**
- Support: JPG, PNG (max 10MB), MP4, MOV (max 50MB)
- Mobile-optimized interface
- Progress indicator
- Preview before submission

**FR-2: Voice Interaction**
- Support 5+ regional languages
- Real-time transcription (AWS Transcribe)
- Translation (AWS Translate)
- Voice output (AWS Polly)
- Text fallback option

**FR-3: Results Display**
- Skill assessment with 1-5 level
- Personalized career plan:
  - Verified opportunities (with badges)
  - Eligible schemes (with documents)
  - Training recommendations (with ROI)
  - Nearby cooperatives (with membership info)
- 60-day action plan
- Success stories

### 7.2 AI Agent Capabilities

**FR-4: Vision Agent (Skill Assessment)**
- Analyze work quality from photos/videos
- Identify skill type automatically
- Assign standardized 1-5 skill level
- Detect techniques used
- Compare against market benchmarks
- Generate structured skill profile
- Build portfolio over time

**FR-5: Profiling Agent**
- Conversational Q&A in regional languages
- Understand goals and preferences
- Build comprehensive user profile
- Cross-validate with vision assessment
- Store context in DynamoDB

**FR-6: Market Agent**
- Search verified businesses (RDS)
- Vector similarity search (OpenSearch)
- Web search fallback (real-time)
- Rank by relevance
- Display verification badges
- Provide complete contact details

**FR-7: Upskilling Agent**
- Analyze skill gaps
- Query skill-income correlation (RDS)
- Find training centers (NSDC + web search)
- Calculate ROI for each skill
- Generate learning roadmap

**FR-8: Scheme Agent**
- Match to 400+ government schemes
- Check eligibility criteria
- Provide document checklist
- Explain application process
- Vector search (OpenSearch)

**FR-9: Network Agent**
- Search 8.5L+ cooperatives (NCDC/DynamoDB)
- Find business associations (web search)
- Provide membership details
- Connect to peer groups

### 7.3 Business Verification System

**FR-10: Business Verification System**
- **Primary: API Setu Integration**
  - Udyam Verification: Real-time MSME check
  - GST Validation: Active business status
  - eCourts Check: Legal status verification
  - Sandbox for testing, production for deployment
- **Alternatives:** Private verification services (Karza, IDfy), manual verification, community ratings
- **Verification Badge:** Visual indicator with trust score
- **Annual Renewal:** Automated reminders

**FR-11: Verification Display**
- Badge on business listings
- Verification date shown
- Details on hover/click
- Trust score calculation

### 7.4 Data Management

**FR-12: Storage Architecture**
- **S3:** Images, videos, audio recordings
- **DynamoDB:** User profiles, cooperatives (NCDC data), conversation history
- **RDS:** Verified businesses, skill mappings, training centers (NSDC data)
- **OpenSearch:** Vector embeddings for schemes and opportunities

**FR-13: Data Sources**
- **Real Public Data:**
  - data.gov.in datasets
  - NSDC training centers
  - NCDC cooperative database
  - Government scheme websites
- **API Integration:**
  - API Setu (sandbox for demo, production for deployment)
  - Web search for real-time data
- **Curated Examples:**
  - 20-30 verified Surat businesses for pilot
  - Sample data clearly labeled

**FR-14: Security**
- AWS Cognito authentication
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Bedrock Guardrails for content filtering
- AWS Secrets Manager for API keys
- WAF for application security
- GDPR compliance

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Response time: < 2 seconds for agent responses
- Upload time: < 5 seconds for 10MB image
- Concurrent users: 1000+ simultaneous
- Availability: 99.5% uptime

### 8.2 Scalability
- Phase 1 (Demo): 100 users
- Phase 2 (MVP): 1K users
- Phase 3 (Pilot): 10K users (Surat)
- Phase 4 (Scale): 90M+ workers (national)

### 8.3 Security & Privacy
- GDPR and IT Act 2000 compliance
- User consent for data usage
- Right to deletion
- Data minimization
- Secure API communication

### 8.4 Usability
- Mobile-first design
- Voice-first interaction
- Regional language support
- Accessibility (WCAG 2.1)
- Offline capability for basic features

### 8.5 Reliability
- Multi-AZ deployment (RDS)
- DynamoDB Global Tables
- S3 cross-region replication
- Automated backups
- Disaster recovery plan

---

## 9. Success Metrics (Measurable Impact)

### 9.1 Adoption Metrics (6-month pilot)
- **10K users** in Surat (tailors)
- **500 verified businesses** active
- **60% user engagement** (return within 7 days)

### 9.2 Impact Metrics
- **40% average income increase** (₹8K → ₹22K)
- **30% apply for schemes**
- **20% complete upskilling**
- **15% join cooperatives**

### 9.3 Trust & Safety Metrics
- **4.5+ user rating** (trust & satisfaction)
- **80% business verification rate** via API Setu
- **<5% scam reports** (quality control)
- **Zero unverified businesses** on platform

### 9.4 Assessment Accuracy
- **70-80% skill assessment accuracy** vs expert review (industry benchmark for zero-shot models)
- **Employer acceptance rate** of AI assessments
- **Consistency score** across assessments

### 9.5 Business Metrics
- **₹500 cost per qualified lead** (vs ₹5K traditional)
- **LTV:CAC ratio 12:1**
- **3-month payback period**

---

## 10. Constraints & Mitigation

### 10.1 Data Constraints

**Constraint:** Need current business data
**Mitigation:**
- Use latest data from data.gov.in
- API Setu real-time verification
- Web search for current opportunities
- Curated examples from current online listings (20-30 Surat businesses)

**Constraint:** Cooperative database access
**Mitigation:**
- Use latest NCDC data available online
- State cooperative directories (current listings)
- Web search for local associations

### 10.2 Technical Constraints

**Constraint:** 15-day implementation timeline
**Mitigation:**
- AWS managed services (no infrastructure setup)
- API Setu sandbox for demo
- Real public data from data.gov.in, NSDC
- Phased feature rollout
- Focus on core user journey

**Constraint:** Multi-agent complexity
**Mitigation:**
- AWS Bedrock Agent Core (built for this)
- Sequential pipeline (simpler)
- Shared services reduce duplication
- Comprehensive testing

### 10.3 User Constraints

**Constraint:** Low smartphone penetration
**Mitigation:**
- Partner with local kiosks/NGOs
- Assisted onboarding
- SMS notifications
- Progressive web app

**Constraint:** Digital literacy
**Mitigation:**
- Voice-first interface
- Regional languages
- Visual instructions
- Community ambassadors

### 10.4 Business Constraints

**Constraint:** Initial business onboarding
**Mitigation:**
- Manual curation for pilot (50 businesses)
- Partner with Surat textile associations
- Incentivize early sign-ups
- Web search as fallback

**Constraint:** Trust building
**Mitigation:**
- API Setu verification mandatory
- Rating and review system
- Success stories
- Money-back guarantee for premium

---

## 11. Out of Scope (for Hackathon)

- Payment processing
- Mobile native apps (web only)
- Advanced analytics dashboard
- Multi-language content moderation
- Blockchain certificates
- International expansion

---

## 12. Assumptions

1. Latest public data accessible from data.gov.in, NSDC, NCDC (online sources)
2. API Setu sandbox available for demo
3. Users have basic smartphones with camera
4. Internet connectivity (3G minimum)
5. Government scheme data publicly available
6. Curated business examples from current online listings acceptable for pilot demo

---

## 13. Dependencies

### External Dependencies
- AWS Services availability
- API Setu sandbox access
- data.gov.in datasets
- NSDC training center data
- Internet connectivity

---

## 14. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Vision model accuracy | High | Medium | Start with tailoring, improve with data |
| API Setu access | Medium | Low | Use sandbox for demo, apply for production |
| User adoption | High | Medium | Partner with NGOs, community ambassadors |
| Trust building | High | Medium | Two-way verification, ratings, success stories |
| Data privacy | High | Low | GDPR compliance, encryption, clear policy |

---

## 15. Compliance & Legal

- Data Privacy: GDPR, IT Act 2000
- User Consent: Explicit consent required
- API Setu: Terms of service compliance
- Content Moderation: Bedrock Guardrails
- Accessibility: WCAG 2.1 Level AA
