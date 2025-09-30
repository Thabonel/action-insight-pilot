# AI Agents System Documentation

## Overview

The AI Marketing Hub employs a sophisticated **multi-agent architecture** where specialized AI agents handle specific marketing tasks autonomously. Each agent is purpose-built for its domain and leverages OpenAI's GPT models for intelligent decision-making and content generation.

## Agent Architecture

### Base Agent System

All agents inherit from `BaseAgentCore` which provides:

```python
class BaseAgentCore(ABC):
    - agent_id: Unique identifier
    - supabase: Database client
    - config: Agent configuration
    - logger: Logging instance
    - status: Current agent status (IDLE, RUNNING, ERROR)
    - agent_logger: Centralized logging utility
    - agent_utils: Common utility functions
```

**Core Methods:**
- `execute_task()` - Main task execution (abstract, implemented by each agent)
- `get_supported_tasks()` - Returns list of supported task types
- `run_task()` - Wrapper with logging, error handling, and status management
- `update_agent_status()` - Updates agent state in database

### Agent Registry

The `AgentRegistry` manages all agent instances:

```python
# Location: backend/agents/agent_registry.py

agent_registry = AgentRegistry()

# Usage:
campaign_agent = agent_registry.get_agent("campaign", supabase_client)
await campaign_agent.execute_task("optimize_campaign", data)
```

### Agent Status & Task Status

**Agent Status Enum:**
- `IDLE` - Agent is ready and waiting
- `RUNNING` - Currently executing a task
- `ERROR` - Agent encountered an error

**Task Status Enum:**
- `PENDING` - Task queued for execution
- `IN_PROGRESS` - Task currently being processed
- `COMPLETED` - Task finished successfully
- `FAILED` - Task encountered an error

## Available Agents

### 1. Campaign Agent

**File:** `backend/agents/campaign_agent.py`

**Purpose:** Campaign strategy, optimization, and performance analysis

**Supported Tasks:**
```python
[
    "optimize_campaign",      # Optimize campaign parameters
    "analyze_performance",    # Analyze campaign metrics
    "generate_ab_tests",      # Generate A/B test variations
    "schedule_campaigns",     # Intelligent campaign scheduling
    "create_campaign_copy",   # Generate campaign messaging
    "monitor_campaigns"       # Real-time campaign monitoring
]
```

**Key Features:**
- Campaign performance analysis
- Budget optimization recommendations
- A/B testing strategy generation
- Multi-channel campaign coordination
- ROI prediction and forecasting

**Example Usage:**
```python
campaign_agent = CampaignAgent(agent_id=1, supabase_client=supabase)
result = await campaign_agent.execute_task(
    "optimize_campaign",
    {
        "campaign_id": 123,
        "goals": ["increase_conversions", "reduce_cpa"],
        "constraints": {"max_budget": 5000}
    }
)
```

### 2. Content Agent

**File:** `backend/agents/content_agent.py`

**Purpose:** AI-powered content creation and optimization

**Supported Tasks:**
```python
[
    "create_email_content",    # Generate email copy
    "create_social_content",   # Social media posts
    "create_blog_content",     # Blog articles
    "optimize_content",        # Content improvement
    "generate_headlines"       # Headline generation
]
```

**Content Services:**
- **EmailContentService** - Email subject lines, body copy, CTAs
- **SocialContentService** - Platform-specific social posts
- **BlogContentService** - Long-form blog articles
- **ContentOptimizationService** - SEO and readability optimization
- **HeadlinesService** - A/B test headline variations

**Example Usage:**
```python
content_agent = ContentAgent(agent_id=2, supabase_client=supabase)
result = await content_agent.execute_task(
    "create_blog_content",
    {
        "topic": "Marketing Automation Best Practices",
        "keywords": ["marketing", "automation", "AI"],
        "tone": "professional",
        "length": 1500
    }
)
```

### 3. Email Automation Agent

**File:** `backend/agents/email_automation_agent.py`

**Purpose:** Automated email campaign management and optimization

**Supported Tasks:**
```python
[
    "create_email_sequence",    # Build drip campaigns
    "personalize_emails",       # Dynamic personalization
    "optimize_send_times",      # Send time optimization
    "segment_audience",         # Audience segmentation
    "analyze_email_performance" # Performance analytics
]
```

**Email Services:**
- **EnhancedEmailService** - Advanced email features
- **MetricsService** - Email performance tracking
- **PersonalizationService** - Dynamic content personalization
- **TemplateVersioningService** - Template management
- **WebhookService** - Email event processing

**Key Features:**
- Automated drip sequences
- Behavior-triggered emails
- Dynamic content personalization
- Send time optimization
- A/B testing for subject lines and content

### 4. Social Media Agent

**File:** `backend/agents/social_media_agent.py`

**Purpose:** Multi-platform social media management

**Supported Tasks:**
```python
[
    "create_social_post",       # Generate social content
    "schedule_posts",           # Optimize posting schedule
    "analyze_engagement",       # Engagement analytics
    "suggest_hashtags",         # Hashtag recommendations
    "monitor_mentions"          # Brand monitoring
]
```

**Social Services:**
- **ABTestingService** - Social post A/B testing
- **ImageGenerationService** - AI-generated visuals
- **MultiModelService** - Multi-model AI orchestration
- **PlatformExtensionsService** - Platform-specific features
- **RealTimeMetricsService** - Live engagement tracking
- **TrendMonitoringService** - Trend identification

**Supported Platforms:**
- Facebook/Instagram
- Twitter/X
- LinkedIn
- TikTok
- Pinterest

### 5. Enhanced Social Media Agent

**File:** `backend/agents/enhanced_social_media_agent.py`

**Purpose:** Advanced social media features and analytics

**Additional Features:**
- Competitive analysis
- Influencer identification
- Sentiment analysis
- Viral content prediction
- Crisis detection and alerts

### 6. Analytics Agent

**File:** `backend/agents/analytics_agent.py`

**Purpose:** Data analysis, insights, and predictive analytics

**Supported Tasks:**
```python
[
    "analyze_campaign_performance",  # Campaign analytics
    "generate_insights",             # AI-powered insights
    "predict_trends",                # Trend forecasting
    "create_reports",                # Automated reporting
    "calculate_roi"                  # ROI analysis
]
```

**Key Features:**
- Multi-channel attribution
- Predictive analytics
- Custom dashboard generation
- Automated report creation
- Anomaly detection

### 7. Lead Generation Agent

**File:** `backend/agents/lead_generation_agent.py`

**Purpose:** Lead management, scoring, and nurturing

**Lead Services:**
- **LeadScoringService** - Intelligent lead scoring
- **LeadQualificationService** - Automated qualification
- **LeadEnrichmentService** - Data enrichment
- **LeadOutreachService** - Automated outreach
- **LeadAnalyticsService** - Lead funnel analytics

**Supported Tasks:**
```python
[
    "score_leads",              # Lead scoring
    "qualify_leads",            # Lead qualification
    "enrich_lead_data",         # Data enrichment
    "generate_outreach",        # Personalized outreach
    "analyze_lead_funnel"       # Funnel analysis
]
```

### 8. Internal Publishing Agent

**File:** `backend/agents/internal_publishing_agent.py`

**Purpose:** Blog and content publishing automation

**Features:**
- WordPress integration
- Medium publishing
- Content formatting
- SEO optimization
- Scheduling and automation

### 9. Proposal Generator Agent

**File:** `backend/agents/proposal_generator.py`

**Purpose:** Automated proposal and pitch deck creation

**Features:**
- Customized proposal templates
- Data-driven recommendations
- Pricing optimization
- Competitive analysis
- PDF generation

### 10. MCP Agent

**File:** `backend/agents/mcp_agent.py`

**Purpose:** Model Context Protocol (MCP) integration

**Features:**
- Multi-model orchestration
- Context management
- Model switching
- Cost optimization

### 11. SEO Keyword Research Agent

**File:** `backend/agents/seo/keyword_research_agent.py`

**Purpose:** SEO keyword research and optimization

**Features:**
- Keyword discovery
- Search volume analysis
- Competitor keyword analysis
- Content gap identification
- SERP analysis

## AI Service Integration

### AI Service Class

**File:** `backend/agents/ai_service.py`

All agents use the centralized `AIService` for OpenAI API calls:

```python
class AIService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    async def generate_text(self, prompt: str, model: str = "gpt-4") -> str:
        # GPT text generation

    async def generate_embeddings(self, text: str) -> List[float]:
        # Text embeddings for semantic search

    async def analyze_sentiment(self, text: str) -> Dict:
        # Sentiment analysis
```

### Enhanced User AI Service

**File:** `backend/agents/enhanced_user_ai_service.py`

Provides user-context-aware AI capabilities:
- User preference learning
- Personalized recommendations
- Contextual content generation
- Behavior-based optimization

## Social Connectors

The platform integrates with social media management tools via connectors:

**File:** `backend/social_connectors/`

### Supported Platforms:
1. **Buffer** (`buffer_connector.py`)
   - Post scheduling
   - Analytics retrieval
   - Multi-account management

2. **Hootsuite** (`hootsuite_connector.py`)
   - Enterprise features
   - Team collaboration
   - Advanced analytics

3. **Later** (`later_connector.py`)
   - Visual planning
   - Instagram-first features
   - Link in bio management

4. **Sprout Social** (`sprout_connector.py`)
   - Social listening
   - Customer care
   - Reporting

**Base Connector:**
```python
class BaseConnector(ABC):
    @abstractmethod
    async def authenticate(self, credentials: Dict) -> bool:
        pass

    @abstractmethod
    async def post_content(self, content: Dict, platforms: List[str]) -> Dict:
        pass

    @abstractmethod
    async def get_analytics(self, post_id: str) -> Dict:
        pass
```

## Agent Communication & Workflows

### Workflow System

**File:** `backend/workflows/`

Agents can be orchestrated into workflows:

```python
# Example: AI Video Creator Workflow
workflow = AIVideoCreatorWorkflow()
steps = [
    {"agent": "content_agent", "task": "create_script"},
    {"agent": "social_media_agent", "task": "create_thumbnails"},
    {"agent": "publishing_agent", "task": "publish_video"}
]
await workflow.execute(steps, input_data)
```

### Inter-Agent Communication

Agents can trigger other agents:

```python
# Campaign agent triggers content agent
campaign_result = await campaign_agent.execute_task("optimize_campaign", data)
if campaign_result["needs_new_content"]:
    content_result = await content_agent.execute_task(
        "create_campaign_copy",
        campaign_result["content_requirements"]
    )
```

## Error Handling & Logging

### Agent Logger

**File:** `backend/agents/agent_logging.py`

Centralized logging for all agent operations:

```python
class AgentLogger:
    async def log_task_start(self, task_id, task_type, input_data)
    async def log_task_completion(self, task_id, output_data, execution_time)
    async def log_task_failure(self, task_id, error_message, execution_time)
    async def update_agent_status(self, status: AgentStatus)
```

### Error Recovery

Agents implement automatic error recovery:
1. Retry logic with exponential backoff
2. Fallback to alternative models
3. Graceful degradation
4. User notification on critical failures

## Performance & Monitoring

### Metrics Tracked

- Task execution time
- Success/failure rates
- API call costs
- Agent utilization
- Queue depth
- Response quality scores

### Optimization Strategies

1. **Caching** - Cache frequent AI responses
2. **Batching** - Batch similar requests
3. **Model Selection** - Use appropriate models for tasks
4. **Parallel Execution** - Run independent tasks concurrently
5. **Rate Limiting** - Respect API limits

## Security & Privacy

### API Key Management

- Keys stored in Supabase secrets
- Per-user API key encryption
- Automatic key rotation support
- Audit logging for key access

### Data Privacy

- User data isolation
- GDPR compliance
- PII detection and handling
- Data retention policies

## Development Guide

### Creating a New Agent

1. **Create agent file:**
```python
# backend/agents/my_agent.py
from .base_agent import BaseAgent

class MyAgent(BaseAgent):
    def get_supported_tasks(self) -> List[str]:
        return ["my_task_type"]

    async def execute_task(self, task_type: str, input_data: Dict) -> Dict:
        # Implementation
        pass
```

2. **Register agent:**
```python
# backend/agents/agent_registry.py
agent_registry.register("my_agent", MyAgent)
```

3. **Create API route:**
```python
# backend/routes/my_agent.py
@router.post("/api/my-agent/{task_type}")
async def execute_my_agent_task(task_type: str, data: Dict):
    agent = agent_registry.get_agent("my_agent", supabase)
    result = await agent.execute_task(task_type, data)
    return result
```

### Testing Agents

```python
# backend/tests/test_my_agent.py
import pytest

@pytest.mark.asyncio
async def test_my_agent():
    agent = MyAgent(agent_id=1, supabase_client=mock_supabase)
    result = await agent.execute_task("my_task_type", {"param": "value"})
    assert result["success"] == True
```

## Best Practices

1. **Single Responsibility** - Each agent handles one domain
2. **Async Operations** - Use async/await for all I/O
3. **Error Handling** - Comprehensive try/except blocks
4. **Logging** - Log all operations for debugging
5. **Input Validation** - Validate all input data
6. **Idempotency** - Tasks should be safely retryable
7. **Testing** - Unit tests for all agent methods
8. **Documentation** - Document supported tasks and parameters

## Troubleshooting

### Common Issues

**Agent won't initialize:**
- Check OpenAI API key in Supabase secrets
- Verify database connection
- Check agent_id exists

**Task execution fails:**
- Check task type is supported
- Validate input data structure
- Review agent logs
- Check API rate limits

**Performance issues:**
- Enable caching
- Use appropriate model sizes
- Implement batching
- Monitor queue depth

## Future Enhancements

- **Multi-modal AI** - Image and video understanding
- **Real-time Collaboration** - Multiple agents working together
- **Learning System** - Agents learn from user feedback
- **Custom Agents** - User-defined agent types
- **Agent Marketplace** - Share and download agents