from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ----------------- Base & Health -----------------
class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    ai_configured: bool = False
    ai_provider: str = "demo"
    database_connected: bool = True
    mode: str = "demo"
    timestamp: str

# ----------------- Safety Analysis -----------------
class SafetyObservation(BaseModel):
    title: str
    description: str
    severity: str  # low, medium, high, critical
    location_hint: Optional[str] = "Site Area"

class SafetyAnalyzeResponse(BaseModel):
    id: str
    success: bool = True
    mode: str = "demo"  # "real" or "demo"
    analysis_type: str = "safety"
    project_name: str
    site_location: str
    category: str
    risk_level: str  # low, medium, high, critical
    image_url: Optional[str] = None
    observations: List[SafetyObservation]
    hazards: List[str]
    recommendations: List[str]
    ppe_required: List[str]
    inspector_notes: Optional[str] = None
    disclaimer: str = (
        "Preliminary AI observation for safety assistance. "
        "Must be verified on-site by a certified OSHA / site safety officer."
    )
    timestamp: str

# ----------------- Structural Analysis -----------------
class StructuralObservation(BaseModel):
    title: str
    description: str
    severity: str  # minor, moderate, severe, critical

class StructuralAnalyzeResponse(BaseModel):
    id: str
    success: bool = True
    mode: str = "demo"  # "real" or "demo"
    analysis_type: str = "structural"
    project_name: str
    structure_type: str
    location_element: str
    severity: str  # minor, moderate, severe, critical
    crack_type: str
    estimated_width_mm: float
    image_url: Optional[str] = None
    observations: List[StructuralObservation]
    suggested_next_steps: List[str]
    inspector_notes: Optional[str] = None
    disclaimer: str = (
        "Preliminary visual AI analysis. Cannot establish structural integrity "
        "or certify structural safety. Detailed assessment by a licensed Structural Engineer is mandatory."
    )
    timestamp: str

# ----------------- Valuation -----------------
class ValuationRequest(BaseModel):
    location: str = Field(..., example="Downtown Metro")
    property_type: str = Field(..., example="Residential Apartment")
    built_up_area_sqft: float = Field(..., gt=0, example=2400)
    bedrooms: int = Field(default=3, ge=0)
    age_years: float = Field(default=2.0, ge=0)
    floors: int = Field(default=1, ge=1)
    construction_quality: str = Field(default="Premium", example="Premium")
    amenities: List[str] = Field(default_factory=list)

class InfluencingFactor(BaseModel):
    factor: str
    impact: str  # positive, neutral, negative
    weight_pct: int
    description: str

class ValuationResponse(BaseModel):
    id: str
    success: bool = True
    mode: str = "demo"  # "real" or "demo"
    location: str
    property_type: str
    built_up_area_sqft: float
    estimated_min_price: float
    estimated_max_price: float
    estimated_avg_price: float
    price_per_sqft: float
    currency: str = "USD"
    property_summary: str
    influencing_factors: List[InfluencingFactor]
    assumptions: List[str]
    disclaimer: str = (
        "Illustrative valuation model calculation. This estimate does not represent "
        "a certified commercial appraisal or guarantee market transaction pricing."
    )
    timestamp: str

# ----------------- Project Planning -----------------
class TaskItem(BaseModel):
    id: Optional[str] = None
    project_id: Optional[str] = None
    title: str
    phase: str
    priority: str = "medium"  # low, medium, high, critical
    duration_days: int = 7
    progress_pct: int = 0
    start_offset_days: int = 0
    dependencies: List[str] = Field(default_factory=list)
    assigned_trade: str = "General Contracting"
    status: str = "pending"  # pending, in_progress, completed, delayed

class ProjectCreate(BaseModel):
    name: str
    location: str
    budget: float
    spent: float = 0
    start_date: str
    target_completion_date: str
    status: str = "in_progress"
    progress_pct: int = 0
    notes: Optional[str] = ""

class ProjectResponse(BaseModel):
    id: str
    name: str
    location: str
    budget: float
    spent: float
    start_date: str
    target_completion_date: str
    status: str
    progress_pct: int
    notes: Optional[str]
    created_at: str
    tasks: Optional[List[TaskItem]] = []

class PlanningGenerateRequest(BaseModel):
    project_name: str
    project_type: str  # Commercial, Residential, Industrial, Infrastructure
    location: str
    budget: float
    duration_months: int = 12
    floors: int = 3
    start_date: str

class PlanningPhase(BaseModel):
    name: str
    duration_weeks: int
    tasks: List[TaskItem]

class PlanningGenerateResponse(BaseModel):
    success: bool = True
    mode: str = "demo"
    project_name: str
    project_summary: str
    total_estimated_days: int
    phases: List[PlanningPhase]
    potential_conflicts: List[str]
    risk_mitigation: List[str]
    disclaimer: str = "AI-generated baseline schedule. Actual sequencing must be confirmed by project superintendent."

# ----------------- Daily Site Assistant -----------------
class ChatMessage(BaseModel):
    role: str  # user, assistant
    content: str
    timestamp: Optional[str] = None

class AssistantChatRequest(BaseModel):
    message: str
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    context_project: Optional[str] = None

class AssistantChatResponse(BaseModel):
    reply: str
    mode: str = "demo"
    suggested_actions: List[str] = Field(default_factory=list)
    disclaimer: str = (
        "AI assistant guidance is for workflow advisory only. "
        "Do not use as legally certified engineering advice."
    )
    timestamp: str

# ----------------- Weather Advisory -----------------
class WeatherActivityAdvisory(BaseModel):
    activity: str  # Concrete Pouring, Exterior Painting, Roofing, Crane Operations, Excavation
    suitability: str  # Favorable, Moderate Caution, High Risk / Not Advised
    badge_variant: str  # success, warning, danger
    guidelines: str

class WeatherResponse(BaseModel):
    location: str
    temperature_c: float
    feels_like_c: float
    humidity_pct: int
    wind_speed_kmh: float
    rain_probability_pct: int
    weather_condition: str  # Sunny, Partly Cloudy, Rain, Thunderstorm, High Wind
    mode: str = "demo"
    risk_alerts: List[str]
    advisories: List[WeatherActivityAdvisory]
    forecast_days: List[Dict[str, Any]]
    disclaimer: str = "Illustrative weather guidance. Verify live hyper-local site anemometer and radar before critical lifts or pours."

# ----------------- Knowledge Base -----------------
class KnowledgeItem(BaseModel):
    id: str
    category: str
    title: str
    summary: str
    content: str
    tags: List[str]

# ----------------- Reports -----------------
class UnifiedReportItem(BaseModel):
    id: str
    type: str  # safety, structural, valuation, planning
    title: str
    subtitle: str
    risk_or_status: str
    mode: str
    created_at: str
    data: Dict[str, Any]
