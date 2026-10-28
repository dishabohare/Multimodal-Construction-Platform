import os
import json
import base64
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
import httpx

from app.core.config import settings
from app.schemas.schemas import (
    SafetyAnalyzeResponse,
    SafetyObservation,
    StructuralAnalyzeResponse,
    StructuralObservation,
    ValuationRequest,
    ValuationResponse,
    InfluencingFactor,
    PlanningGenerateRequest,
    PlanningGenerateResponse,
    PlanningPhase,
    TaskItem,
    AssistantChatRequest,
    AssistantChatResponse,
    WeatherResponse,
    WeatherActivityAdvisory
)

class AIService:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
    
    @property
    def is_ai_configured(self) -> bool:
        return bool(self.gemini_key or self.openai_key)
    
    @property
    def provider(self) -> str:
        if self.gemini_key:
            return "Google Gemini"
        if self.openai_key:
            return "OpenAI"
        return "Demo / Simulated Engine"

    # -------------------------------------------------------------
    # 1. MULTIMODAL SAFETY MONITORING
    # -------------------------------------------------------------
    async def analyze_safety(
        self,
        project_name: str,
        site_location: str,
        category: str,
        image_bytes: Optional[bytes] = None,
        image_url: Optional[str] = None,
        inspector_notes: Optional[str] = ""
    ) -> SafetyAnalyzeResponse:
        report_id = f"SAF-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # If real Gemini API key is configured and image provided
        if self.gemini_key and image_bytes:
            try:
                real_result = await self._call_gemini_vision_safety(
                    image_bytes=image_bytes,
                    category=category,
                    project_name=project_name,
                    site_location=site_location,
                    inspector_notes=inspector_notes
                )
                if real_result:
                    real_result.id = report_id
                    real_result.timestamp = timestamp
                    real_result.image_url = image_url
                    return real_result
            except Exception as e:
                # Log error and fall back gracefully to clearly labeled demo
                print(f"[AIService] Real AI invocation error: {e}. Falling back to demo mode.")

        # DEMO MODE: Realistic, categorized, clearly labeled simulated output
        category_lower = category.lower() if category else "general"
        
        if "scaffold" in category_lower or "height" in category_lower:
            risk_level = "high"
            observations = [
                SafetyObservation(
                    title="Missing Mid-Rail on Upper Working Deck",
                    description="Simulated finding: The secondary scaffold platform lacks standardized mid-rail fall arrest guard rails above 2.4 meters elevation.",
                    severity="high",
                    location_hint="Scaffold Bay 3, Elevation +6.0m"
                ),
                SafetyObservation(
                    title="Base Plate Settlement Check Required",
                    description="Simulated finding: Sole board contact on compacted soil shows signs of moisture runoff; ensure load redistribution plates are anchored.",
                    severity="medium",
                    location_hint="Ground Level Footing"
                ),
                SafetyObservation(
                    title="Worker Tie-Off Anchor Proximity",
                    description="Simulated finding: Harness lanyard anchorage points should be positioned overhead rather than at foot level to minimize free-fall distance.",
                    severity="high",
                    location_hint="Upper Platform Deck"
                )
            ]
            hazards = [
                "Unprotected edge fall hazard (>6 feet / 1.8m height rule OSHA 1926.501)",
                "Scaffold destabilization risk due to unpinned joints",
                "Dropped tool / falling object hazard to ground crew"
            ]
            recommendations = [
                "Install complete 42-inch top-rail, 21-inch mid-rail, and 3.5-inch toe-boards immediately.",
                "Tag scaffold with 'DO NOT USE - RED TAG' until certified scaffolding supervisor inspects joints.",
                "Enforce dual-point 100% tie-off with self-retracting lifelines (SRL)."
            ]
            ppe_required = ["Class E Hard Hat", "Full Body Harness (ANSI Z359.11)", "Steel-Toe Boots", "High-Visibility Vest"]

        elif "excavation" in category_lower or "trench" in category_lower:
            risk_level = "critical"
            observations = [
                SafetyObservation(
                    title="Inadequate Trench Shoring or Benching",
                    description="Simulated finding: Trench depth exceeds 1.5m (5ft) without observable hydraulic shoring or protective trench box shield.",
                    severity="critical",
                    location_hint="Utility Pipeline Trench Section B"
                ),
                SafetyObservation(
                    title="Spoil Pile Placed Within 0.6m of Trench Edge",
                    description="Simulated finding: Excavated spoil pile is stacked dangerously close to edge, increasing surcharge collapse pressure.",
                    severity="high",
                    location_hint="East Trench Bank"
                )
            ]
            hazards = [
                "Cave-in / structural soil collapse risk on utility crew",
                "Lack of designated egress ladder within 25ft travel distance"
            ]
            recommendations = [
                "Evacuate trench immediately until aluminum hydraulic shoring or trench box is placed.",
                "Pull back all spoil piles and heavy vibratory equipment at least 2 feet (0.6m) from excavation lip.",
                "Designate Competent Person to inspect soil classification (Type A/B/C) every morning."
            ]
            ppe_required = ["Safety Helmet", "Reflective Vest", "Metatarsal Guard Boots", "Atmospheric Air Monitor"]

        elif "ppe" in category_lower:
            risk_level = "medium"
            observations = [
                SafetyObservation(
                    title="Incomplete Eye Protection During Chipping",
                    description="Simulated finding: Operatives observed breaking concrete without ANSI Z87.1 impact-rated safety goggles or face shield.",
                    severity="medium",
                    location_hint="Ground Floor Slab"
                ),
                SafetyObservation(
                    title="High-Vis Vest Visibility in Traffic Corridor",
                    description="Simulated finding: High visibility garments worn by site guides are faded and not visible from heavy vehicle reversing mirrors.",
                    severity="medium",
                    location_hint="Main Gate Logistics Zone"
                )
            ]
            hazards = [
                "High-velocity particle eye injury during mechanical grinding",
                "Struck-by vehicle hazard in active mixer truck corridor"
            ]
            recommendations = [
                "Distribute sealed anti-fog safety spectacles and mesh face shields to chipping crew.",
                "Enforce mandatory Class 3 hi-vis vests for all ground personnel operating near mobile plant."
            ]
            ppe_required = ["Hard Hat", "ANSI Z87.1 Goggles", "Ear Plugs (28 dB NRR)", "Cut-Resistant Gloves (Level 4)"]

        else:
            risk_level = "medium"
            observations = [
                SafetyObservation(
                    title="Temporary Electrical Cabling Across Walkway",
                    description="Simulated finding: 110V/240V heavy-duty power cords routed across main personnel pathway without protective yellow cable ramps.",
                    severity="medium",
                    location_hint="Staircase Access Route"
                ),
                SafetyObservation(
                    title="Housekeeping & Trip Hazard Accumulation",
                    description="Simulated finding: Discarded timber offcuts with protruding nails and rebar wire ties in active passageway.",
                    severity="low",
                    location_hint="Core Area Walkway"
                )
            ]
            hazards = [
                "Trip and fall injury along egress corridor",
                "Cable insulation abrasion leading to ground fault / electrical shock"
            ]
            recommendations = [
                "Elevate electrical distribution cables with non-conductive hooks or bridge with heavy-duty ramps.",
                "Implement end-of-shift 30-minute 5S housekeeping clean down.",
                "Verify residual current devices (GFCI / RCD) are tested weekly."
            ]
            ppe_required = ["Hard Hat", "Steel Toe Cap Footwear", "High-Vis Vest", "Protective Gloves"]

        return SafetyAnalyzeResponse(
            id=report_id,
            success=True,
            mode="demo",
            analysis_type="safety",
            project_name=project_name or "Demo Project Site",
            site_location=site_location or "Sector 4B Construction Yard",
            category=category or "General Site Safety",
            risk_level=risk_level,
            image_url=image_url,
            observations=observations,
            hazards=hazards,
            recommendations=recommendations,
            ppe_required=ppe_required,
            inspector_notes=inspector_notes,
            disclaimer=(
                "SIMULATED DEMO RESULT: This report was generated using standard construction safety rule heuristics "
                "for educational and preview purposes. It is NOT a verified computer vision detection. "
                "All site hazards must be verified on-site by a qualified OSHA safety inspector."
            ),
            timestamp=timestamp
        )

    # -------------------------------------------------------------
    # 2. STRUCTURAL CRACK INSPECTION
    # -------------------------------------------------------------
    async def analyze_structural(
        self,
        project_name: str,
        structure_type: str,
        location_element: str,
        image_bytes: Optional[bytes] = None,
        image_url: Optional[str] = None,
        inspector_notes: Optional[str] = ""
    ) -> StructuralAnalyzeResponse:
        report_id = f"STR-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().isoformat() + "Z"

        if self.gemini_key and image_bytes:
            try:
                real_result = await self._call_gemini_vision_structural(
                    image_bytes=image_bytes,
                    structure_type=structure_type,
                    location_element=location_element,
                    project_name=project_name,
                    inspector_notes=inspector_notes
                )
                if real_result:
                    real_result.id = report_id
                    real_result.timestamp = timestamp
                    real_result.image_url = image_url
                    return real_result
            except Exception as e:
                print(f"[AIService] Real structural AI invocation error: {e}. Falling back to demo mode.")

        # DEMO MODE: Realistic engineering analysis
        struct_lower = (structure_type or "").lower()
        if "beam" in struct_lower:
            severity = "moderate"
            crack_type = "Diagonal Shear Crack (45-degree)"
            estimated_width = 0.65
            observations = [
                StructuralObservation(
                    title="Diagonal Shear Pattern Near Support",
                    description="Simulated finding: Inclined cracking detected near beam support column juncture, indicative of principal tensile stress exceeding concrete tensile capacity.",
                    severity="moderate"
                ),
                StructuralObservation(
                    title="Absence of Active Spalling",
                    description="Simulated finding: Concrete cover remains bonded without evident delamination or exposed steel rebar at current stage.",
                    severity="minor"
                )
            ]
            next_steps = [
                "Install crack width monitoring gauge (tell-tale caliper) to measure dynamic displacement over 14 days.",
                "Conduct ultrasonic pulse velocity (UPV) or rebound hammer test across the support shear span.",
                "Commission a licensed PE Structural Engineer to evaluate live load limits and consider carbon fiber (CFRP) wrap strengthening."
            ]
        elif "column" in struct_lower:
            severity = "severe"
            crack_type = "Vertical Axial / Buckling Spall"
            estimated_width = 1.2
            observations = [
                StructuralObservation(
                    title="Vertical Longitudinal Fissure",
                    description="Simulated finding: Sub-vertical continuous crack along main vertical reinforcement line, signaling potential cover bursting under compression load.",
                    severity="severe"
                ),
                StructuralObservation(
                    title="Possible Rust Staining Trace",
                    description="Simulated finding: Faint oxide staining along fissure suggest early-stage internal bar corrosion expansion.",
                    severity="moderate"
                )
            ]
            next_steps = [
                "Erect temporary adjustable steel acrow props immediately around the bay perimeter to relieve column load.",
                "Chipping and non-destructive cover depth scanning (profometer) to examine transverse tie hoop integrity.",
                "Immediate structural engineering consultation before resuming overhead construction operations."
            ]
        elif "retaining" in struct_lower or "wall" in struct_lower:
            severity = "moderate"
            crack_type = "Horizontal Flexural & Efflorescence Crack"
            estimated_width = 0.8
            observations = [
                StructuralObservation(
                    title="Horizontal Flexural Crack with Hydrostatic Seepage",
                    description="Simulated finding: Horizontal fissure on lower third of retaining stem showing calcium efflorescence marks from trapped ground water.",
                    severity="moderate"
                )
            ]
            next_steps = [
                "Inspect weep holes and subsoil perforated drainage pipes for blockage or silt buildup.",
                "Pressure-inject low-viscosity hydrophobic epoxy resin after pressure washing fissure.",
                "Monitor earth surcharge pressure behind the wall."
            ]
        else:
            severity = "minor"
            crack_type = "Plastic Shrinkage & Crazing Crack"
            estimated_width = 0.25
            observations = [
                StructuralObservation(
                    title="Superficial Map Crazing Network",
                    description="Simulated finding: Random shallow hairline crack pattern across surface, typical of rapid moisture evaporation during initial concrete curing.",
                    severity="minor"
                )
            ]
            next_steps = [
                "Apply elastomeric waterproofing sealer or silane-siloxane penetrating primer.",
                "Re-check in 30 days to confirm non-progressive behavior.",
                "Maintain standard building inspection log."
            ]

        return StructuralAnalyzeResponse(
            id=report_id,
            success=True,
            mode="demo",
            analysis_type="structural",
            project_name=project_name or "Demo Inspection",
            structure_type=structure_type or "Reinforced Concrete Element",
            location_element=location_element or "First Floor Support Grid",
            severity=severity,
            crack_type=crack_type,
            estimated_width_mm=estimated_width,
            image_url=image_url,
            observations=observations,
            suggested_next_steps=next_steps,
            inspector_notes=inspector_notes,
            disclaimer=(
                "SIMULATED DEMO RESULT: Visual imagery alone CANNOT verify internal rebar health, load path capacity, "
                "or structural stability. This simulated result is for UI/UX demonstration. A licensed professional structural engineer "
                "must conduct formal non-destructive physical testing on site."
            ),
            timestamp=timestamp
        )

    # -------------------------------------------------------------
    # 3. REAL ESTATE VALUATION ESTIMATION
    # -------------------------------------------------------------
    async def estimate_valuation(self, req: ValuationRequest) -> ValuationResponse:
        report_id = f"VAL-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().isoformat() + "Z"

        # Baseline price per sqft according to location archetype
        loc_clean = req.location.lower()
        if any(w in loc_clean for w in ["downtown", "metro", "central", "city", "waterfront"]):
            base_sqft = 380.0
        elif any(w in loc_clean for w in ["suburb", "valley", "green", "park"]):
            base_sqft = 260.0
        elif any(w in loc_clean for w in ["industrial", "outskirt", "rural"]):
            base_sqft = 180.0
        else:
            base_sqft = 295.0

        # Adjust for construction quality
        quality_factors = {
            "luxury": 1.35,
            "premium": 1.18,
            "standard": 1.0,
            "economy": 0.82
        }
        q_mult = quality_factors.get(req.construction_quality.lower(), 1.0)

        # Age depreciation (1.2% per year up to max 35%)
        depreciation = min(req.age_years * 0.012, 0.35)
        age_mult = max(1.0 - depreciation, 0.65)

        # Floor premium/penalty
        floor_mult = 1.0 + min((req.floors - 1) * 0.02, 0.15)

        # Amenities bonus
        amenity_bonus_pct = min(len(req.amenities) * 0.025, 0.18)
        amenity_mult = 1.0 + amenity_bonus_pct

        # Bedroom configuration adjustment
        br_mult = 1.0 + (0.04 if req.bedrooms >= 4 else 0.0)

        final_sqft_price = round(base_sqft * q_mult * age_mult * floor_mult * amenity_mult * br_mult, 2)
        base_valuation = round(final_sqft_price * req.built_up_area_sqft, 2)

        # Confidence spread (+/- 7%)
        min_price = round(base_valuation * 0.93, 2)
        max_price = round(base_valuation * 1.07, 2)

        influencing_factors = [
            InfluencingFactor(
                factor="Location Index",
                impact="positive" if base_sqft >= 280 else "neutral",
                weight_pct=35,
                description=f"Regional economic hub baseline calculated at ${base_sqft:.0f}/sq.ft."
            ),
            InfluencingFactor(
                factor=f"Construction Quality ({req.construction_quality})",
                impact="positive" if q_mult > 1.0 else ("neutral" if q_mult == 1.0 else "negative"),
                weight_pct=25,
                description=f"Quality multiplier of {q_mult:.2f}x applied to structural & finishes specifications."
            ),
            InfluencingFactor(
                factor=f"Asset Depreciation ({req.age_years:.1f} yrs)",
                impact="negative" if req.age_years > 3 else "neutral",
                weight_pct=15,
                description=f"Physical age adjustment resulted in a {depreciation*100:.1f}% depreciation factor."
            ),
            InfluencingFactor(
                factor=f"Amenities & Features ({len(req.amenities)} included)",
                impact="positive" if amenity_bonus_pct > 0 else "neutral",
                weight_pct=15,
                description=f"Added premium value of +{amenity_bonus_pct*100:.1f}% from selected amenities."
            ),
            InfluencingFactor(
                factor=f"Spatial Layout ({req.bedrooms} BHK on {req.floors} floors)",
                impact="positive",
                weight_pct=10,
                description=f"Standard residential configuration optimized for high market liquidity."
            )
        ]

        assumptions = [
            "Clear freehold title with non-encumbered municipal zoning compliance.",
            "Normal market liquidity condition without forced distress liquidation.",
            "Structure adheres to National Building Code (NBC) seismic and fire regulations.",
            "Utility connections (3-phase electric, municipal water, sewer) fully operational."
        ]

        summary = (
            f"Estimated fair valuation for {req.built_up_area_sqft:,.0f} sq.ft {req.property_type} in {req.location}. "
            f"Modeled average price point sits at ${base_valuation:,.0f} (${final_sqft_price:,.2f}/sq.ft) "
            f"within a 90% confidence corridor of ${min_price:,.0f} - ${max_price:,.0f}."
        )

        return ValuationResponse(
            id=report_id,
            success=True,
            mode="demo",
            location=req.location,
            property_type=req.property_type,
            built_up_area_sqft=req.built_up_area_sqft,
            estimated_min_price=min_price,
            estimated_max_price=max_price,
            estimated_avg_price=base_valuation,
            price_per_sqft=final_sqft_price,
            currency="USD",
            property_summary=summary,
            influencing_factors=influencing_factors,
            assumptions=assumptions,
            disclaimer=(
                "ILLUSTRATIVE VALUATION ESTIMATE: Built using transparent parametric regression formulas. "
                "This report does NOT constitute a certified appraisal under USPAP / RICS standards and cannot be used "
                "as a definitive loan underwriting document without a physical appraiser inspection."
            ),
            timestamp=timestamp
        )

    # -------------------------------------------------------------
    # 4. CONSTRUCTION PROJECT PLANNING & WBS GENERATOR
    # -------------------------------------------------------------
    async def generate_project_plan(self, req: PlanningGenerateRequest) -> PlanningGenerateResponse:
        total_days = req.duration_months * 30
        
        phases = [
            PlanningPhase(
                name="Phase 1: Pre-Construction & Permitting",
                duration_weeks=max(2, req.duration_months // 4 * 2),
                tasks=[
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Geotechnical Soil Boring & Topographic Survey",
                        phase="Pre-Construction",
                        priority="high",
                        duration_days=10,
                        progress_pct=100,
                        start_offset_days=0,
                        assigned_trade="Geotechnical Engineering",
                        status="completed"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Municipal Building Permit & Utility Clearances",
                        phase="Pre-Construction",
                        priority="critical",
                        duration_days=21,
                        progress_pct=80,
                        start_offset_days=5,
                        assigned_trade="Legal & Compliance",
                        status="in_progress"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Site Mobilization, Perimeter Hoarding & Power Setup",
                        phase="Pre-Construction",
                        priority="medium",
                        duration_days=14,
                        progress_pct=40,
                        start_offset_days=15,
                        assigned_trade="General Site Ops",
                        status="in_progress"
                    )
                ]
            ),
            PlanningPhase(
                name="Phase 2: Substructure & Foundation",
                duration_weeks=max(4, req.duration_months // 3 * 3),
                tasks=[
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Bulk Earthwork Excavation & Shoring",
                        phase="Substructure",
                        priority="high",
                        duration_days=18,
                        progress_pct=0,
                        start_offset_days=30,
                        dependencies=["Municipal Building Permit"],
                        assigned_trade="Excavation & Earthmoving",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Pile Driving / Raft Foundation Rebar & Pour",
                        phase="Substructure",
                        priority="critical",
                        duration_days=25,
                        progress_pct=0,
                        start_offset_days=45,
                        dependencies=["Bulk Earthwork Excavation"],
                        assigned_trade="Concrete & Formwork",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Sub-slab Waterproofing Membrane & Backfill",
                        phase="Substructure",
                        priority="medium",
                        duration_days=12,
                        progress_pct=0,
                        start_offset_days=68,
                        dependencies=["Raft Foundation Rebar & Pour"],
                        assigned_trade="Waterproofing Specialist",
                        status="pending"
                    )
                ]
            ),
            PlanningPhase(
                name="Phase 3: Superstructure Framework",
                duration_weeks=max(6, req.floors * 3),
                tasks=[
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title=f"Columns & Suspended Slabs (Floors 1 to {req.floors})",
                        phase="Superstructure",
                        priority="critical",
                        duration_days=req.floors * 14,
                        progress_pct=0,
                        start_offset_days=82,
                        dependencies=["Sub-slab Waterproofing Membrane"],
                        assigned_trade="Structural Concrete",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Structural Steel Roof Framing / Trusses",
                        phase="Superstructure",
                        priority="high",
                        duration_days=16,
                        progress_pct=0,
                        start_offset_days=82 + (req.floors * 12),
                        assigned_trade="Steel Erectors",
                        status="pending"
                    )
                ]
            ),
            PlanningPhase(
                name="Phase 4: Building Envelope & MEP Rough-Ins",
                duration_weeks=max(4, req.duration_months // 4 * 3),
                tasks=[
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Facade Curtain Wall & Glazing Installation",
                        phase="Envelope & MEP",
                        priority="high",
                        duration_days=30,
                        progress_pct=0,
                        start_offset_days=120,
                        assigned_trade="Facade Specialists",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="HVAC Ductwork, Plumbing Risers & Fire Suppression",
                        phase="Envelope & MEP",
                        priority="high",
                        duration_days=35,
                        progress_pct=0,
                        start_offset_days=130,
                        assigned_trade="MEP Mechanical",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Electrical Conduit Racks & Main Switchboard Panels",
                        phase="Envelope & MEP",
                        priority="medium",
                        duration_days=25,
                        progress_pct=0,
                        start_offset_days=140,
                        assigned_trade="Electrical Contractors",
                        status="pending"
                    )
                ]
            ),
            PlanningPhase(
                name="Phase 5: Interior Fit-out & Handover",
                duration_weeks=max(4, req.duration_months // 4 * 2),
                tasks=[
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Drywall Partitions, Ceiling Grid & Floor Tiling",
                        phase="Finishes & Handover",
                        priority="medium",
                        duration_days=28,
                        progress_pct=0,
                        start_offset_days=180,
                        assigned_trade="Drywall & Finishes",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Integrated Building Automation & Life-Safety Testing",
                        phase="Finishes & Handover",
                        priority="critical",
                        duration_days=15,
                        progress_pct=0,
                        start_offset_days=210,
                        assigned_trade="Commissioning Agent",
                        status="pending"
                    ),
                    TaskItem(
                        id=f"TSK-{uuid.uuid4().hex[:6]}",
                        title="Final Occupancy Inspection (CO) & Punch List Clearance",
                        phase="Finishes & Handover",
                        priority="critical",
                        duration_days=10,
                        progress_pct=0,
                        start_offset_days=225,
                        assigned_trade="Project Superintendent",
                        status="pending"
                    )
                ]
            )
        ]

        conflicts = [
            f"MEP rough-ins begin at Day 130 overlapping with facade enclosure; ensure temporary waterproof tarps protect riser shafts.",
            f"Tower crane demobilization will restrict site ingress during Phase 4 exterior cladding; schedule heavy equipment deliveries off-hours.",
            f"Concrete pour cycles on upper floor {req.floors} require minimum 7-day wet cure prior to shoring strip to avoid micro-cracking."
        ]

        mitigations = [
            "Implement rolling 3-week lookahead schedule meetings every Monday morning.",
            "Pre-order long-lead electrical switchgear and chillers 16 weeks ahead of required installation date.",
            "Establish dual crane offload zones to prevent truck queues on municipal access streets."
        ]

        summary = (
            f"AI-Generated master schedule for {req.project_name} ({req.project_type}, {req.floors} floors, ${req.budget:,.0f} budget). "
            f"Structured into 5 phases covering {total_days} target days with clear critical path and trade segregation."
        )

        return PlanningGenerateResponse(
            success=True,
            mode="demo",
            project_name=req.project_name,
            project_summary=summary,
            total_estimated_days=total_days,
            phases=phases,
            potential_conflicts=conflicts,
            risk_mitigation=mitigations
        )

    # -------------------------------------------------------------
    # 5. DAILY SITE ASSISTANT
    # -------------------------------------------------------------
    async def chat_assistant(self, req: AssistantChatRequest) -> AssistantChatResponse:
        timestamp = datetime.utcnow().isoformat() + "Z"
        msg = req.message.lower().strip()
        
        # If Gemini key is available, attempt real conversational response
        if self.gemini_key:
            try:
                reply = await self._call_gemini_chat(req.message, req.conversation_history)
                if reply:
                    return AssistantChatResponse(
                        reply=reply,
                        mode="real",
                        suggested_actions=["Review Checklist", "Export Site Log", "Request Material Delivery"],
                        timestamp=timestamp
                    )
            except Exception as e:
                print(f"[AIService] Real Gemini Chat error: {e}. Falling back to demo mode.")

        # Rich deterministic construction supervisor responses
        if any(w in msg for w in ["pour", "concrete", "curing", "slump", "cube"]):
            reply = (
                "**Concrete Operations Protocol:**\n\n"
                "1. **Slump Test:** Verify on-site slump satisfies slump cone tolerances (typically 100mm ± 25mm for pumped mixes) prior to discharge.\n"
                "2. **Placement Window:** Ensure transit mixer discharges within 90 minutes or 300 drum revolutions from initial batching plant water addition (ASTM C94).\n"
                "3. **Curing Standard:** Begin water ponding or apply ASTM C309 curing compound as soon as bleed water sheen vanishes. Maintain moist curing for minimum 7 days (14 days for fly-ash / slag mixes).\n"
                "4. **Test Cylinders:** Cast standard 150mm x 300mm test cylinders (or 150mm cubes): 2 for 7-day breaks, 2 for 28-day compliance verification, and 1 reserve."
            )
            actions = ["Inspect Batch Tickets", "Verify Slump Test", "Check Ambient Temperature"]

        elif any(w in msg for w in ["safety", "hazard", "ppe", "osha", "accident"]):
            reply = (
                "**Safety & Compliance Briefing:**\n\n"
                "• **Focus 4 Hazards:** The top site risks are Falls (33%), Struck-by (11%), Caught-in/between, and Electrocution.\n"
                "• **Toolbox Talk Topic:** Review 100% harness hookup compliance on scaffolding above 6 feet (1.8m) today.\n"
                "• **Excavation Rule:** Any trench deeper than 5 feet (1.5m) requires an engineered trench box or proper 1:1.5 slope benching.\n"
                "• **Action Item:** Ensure all portable power tools have tested GFCI / RCD protection before work kicks off."
            )
            actions = ["Generate Safety Checklist", "Schedule Toolbox Talk", "Log Near-Miss Incident"]

        elif any(w in msg for w in ["material", "steel", "rebar", "cement", "order", "inventory"]):
            reply = (
                "**Material Planning Advisory:**\n\n"
                "• **Rebar Inventory:** Verify standard laps (typically 40x to 50x bar diameter) and ensure bar chairs maintain minimum 50mm clear cover on raft and exterior columns.\n"
                "• **Cement Storage:** Stack bagged Portland cement on raised wooden pallets (minimum 150mm off floor) in moisture-sealed sheds, max 10 bags high.\n"
                "• **Lead-Time Alert:** Structural steel sections and curtain wall extrusions currently have 6-8 week supply chains; place purchase orders early."
            )
            actions = ["Calculate Rebar Laps", "Check Cement Stock", "Request Vendor Quotes"]

        elif any(w in msg for w in ["delay", "schedule", "progress", "weather", "rain"]):
            reply = (
                "**Site Schedule & Weather Contingency:**\n\n"
                "• When adverse weather hits, prioritize indoor activities: internal partition stud framing, conduit pulling, duct insulation, and MEP testing.\n"
                "• Stop all tower crane lifts when sustained wind exceeds 38 mph (61 km/h) or gusts breach local crane manufacturer safety limits.\n"
                "• Record daily site diary entries with high/low temperature, rain start/stop times, and trades impacted to support contractual Extension of Time (EOT) documentation."
            )
            actions = ["View Weather Advisory", "Adjust Task Priorities", "Download Daily Log"]

        else:
            reply = (
                f"**Daily Site Assistant Online**\n\n"
                f"I received your inquiry: *'{req.message}'*\n\n"
                "Here are immediate construction management recommendations:\n"
                "1. **Daily Log Verification:** Ensure morning attendance, active subcontractors, and plant equipment hours are registered in the daily site log.\n"
                "2. **Subcontractor Coordination:** Run a 10-minute stand-up with the concrete, MEP, and steel trades to prevent workspace spatial overlap.\n"
                "3. **Quality Hold Points:** Confirm third-party inspection sign-off before pouring any concrete or closing drywall partitions.\n\n"
                "How else can I assist with your site operations today?"
            )
            actions = ["Draft Daily Report", "Review Material Orders", "Safety Checklist"]

        return AssistantChatResponse(
            reply=reply,
            mode="demo",
            suggested_actions=actions,
            disclaimer=(
                "SIMULATED DEMO ASSISTANT: Predefined construction engineering heuristics. "
                "Guidance must be verified against your project contract specifications, local codes, and PE instructions."
            ),
            timestamp=timestamp
        )

    # -------------------------------------------------------------
    # 6. WEATHER-AWARE ADVISORY
    # -------------------------------------------------------------
    async def get_weather_advisory(self, location: str) -> WeatherResponse:
        # Realistic sample weather model parameterized by location
        loc_clean = (location or "Default Metro").title()
        
        # Deterministic variation based on location name hash for consistent demo
        seed = sum(ord(c) for c in loc_clean) % 5
        
        scenarios = [
            {
                "temp": 24.5, "feels": 25.0, "hum": 55, "wind": 14.0, "rain": 10,
                "cond": "Partly Cloudy - Optimal Working Conditions",
                "alerts": ["No hazardous weather advisories currently in effect."],
                "concrete": ("Favorable", "success", "Optimal temperature and humidity for placement; apply curing compound after finishing."),
                "paint": ("Favorable", "success", "Relative humidity is below 80%; excellent surface drying conditions."),
                "roof": ("Favorable", "success", "Wind speed is gentle at 14 km/h; membrane heat welding can proceed safely."),
                "crane": ("Favorable", "success", "Winds well below 38 km/h safe operating threshold; normal crane lifting permitted."),
                "excavation": ("Favorable", "success", "Dry trench walls; standard shoring precautions apply.")
            },
            {
                "temp": 34.0, "feels": 38.5, "hum": 70, "wind": 22.0, "rain": 25,
                "cond": "High Heat & Humidity Warning",
                "alerts": [
                    "Heat Stress Advisory: Wet-Bulb Globe Temperature (WBGT) exceeds threshold.",
                    "Concrete flash-set risk: batch water cooling / ice addition advised."
                ],
                "concrete": ("Moderate Caution", "warning", "High evaporation rate (>1.0 kg/m²/hr). Use chilled water and erect sun shades to prevent plastic shrinkage."),
                "paint": ("Moderate Caution", "warning", "Direct sunlight exposure may cause rapid solvent evaporation and blistering."),
                "roof": ("Moderate Caution", "warning", "Surface temperatures on roof deck can exceed 55°C; provide hydration stations."),
                "crane": ("Favorable", "success", "Winds acceptable; watch for thermal updrafts near tall structures."),
                "excavation": ("Favorable", "success", "Stable dry conditions, maintain dust suppression spraying.")
            },
            {
                "temp": 16.0, "feels": 14.0, "hum": 88, "wind": 32.0, "rain": 65,
                "cond": "Overcast with Approaching Rain Front",
                "alerts": [
                    "High probability of localized precipitation (65%) within next 3 hours.",
                    "Sustained wind gusts reaching 45 km/h."
                ],
                "concrete": ("High Risk / Not Advised", "danger", "Rainwater dilution will destroy surface water-cement ratio and cause dusting. Postpone exterior slab pours."),
                "paint": ("High Risk / Not Advised", "danger", "Exterior coating will wash out or fail to cure. Halt all exterior painting."),
                "roof": ("High Risk / Not Advised", "danger", "Slippery wet roof membranes and wind gusts create critical fall risk."),
                "crane": ("Moderate Caution", "warning", "Wind gusts approaching crane shutdown limit (38 km/h); suspend large sail-area panel lifts."),
                "excavation": ("Moderate Caution", "warning", "Cover open trenches with tarps to prevent soil washouts and surcharge destabilization.")
            },
            {
                "temp": 11.0, "feels": 8.0, "hum": 60, "wind": 44.0, "rain": 20,
                "cond": "High Wind Advisory",
                "alerts": [
                    "High Wind Alert: Sustained winds 44 km/h with gusts exceeding 55 km/h.",
                    "Crane operations must be suspended."
                ],
                "concrete": ("Moderate Caution", "warning", "High wind accelerates surface moisture loss; apply immediate curing compound."),
                "paint": ("High Risk / Not Advised", "danger", "Wind-blown debris will contaminate wet paint film."),
                "roof": ("High Risk / Not Advised", "danger", "High wind hazard for lightweight roofing insulation boards and workers."),
                "crane": ("High Risk / Not Advised", "danger", "MANDATORY SUSPENSION: Wind exceeds 38 km/h crane operating limit."),
                "excavation": ("Favorable", "success", "Trench work safe; secure perimeter fencing and light loose materials.")
            },
            {
                "temp": 28.0, "feels": 29.0, "hum": 45, "wind": 10.0, "rain": 5,
                "cond": "Clear Skies - Peak Construction Window",
                "alerts": ["Clear weather throughout the shift. Ideal milestone acceleration opportunity."],
                "concrete": ("Favorable", "success", "Excellent curing conditions. Keep moist burlap on slabs."),
                "paint": ("Favorable", "success", "Ideal temperature and low humidity for exterior coatings."),
                "roof": ("Favorable", "success", "Full accessibility for roofing membrane installation."),
                "crane": ("Favorable", "success", "Calm wind conditions allow critical heavy transformer / HVAC picks."),
                "excavation": ("Favorable", "success", "Optimal soil compaction moisture levels.")
            }
        ]

        sc = scenarios[seed]

        advisories = [
            WeatherActivityAdvisory(
                activity="Structural Concrete Pouring",
                suitability=sc["concrete"][0],
                badge_variant=sc["concrete"][1],
                guidelines=sc["concrete"][2]
            ),
            WeatherActivityAdvisory(
                activity="Exterior Wall Painting & Coatings",
                suitability=sc["paint"][0],
                badge_variant=sc["paint"][1],
                guidelines=sc["paint"][2]
            ),
            WeatherActivityAdvisory(
                activity="Roofing & Waterproofing Membranes",
                suitability=sc["roof"][0],
                badge_variant=sc["roof"][1],
                guidelines=sc["roof"][2]
            ),
            WeatherActivityAdvisory(
                activity="Tower Crane Heavy Rigging & Lifts",
                suitability=sc["crane"][0],
                badge_variant=sc["crane"][1],
                guidelines=sc["crane"][2]
            ),
            WeatherActivityAdvisory(
                activity="Deep Trenching & Earth Excavation",
                suitability=sc["excavation"][0],
                badge_variant=sc["excavation"][1],
                guidelines=sc["excavation"][2]
            )
        ]

        # 5-day forecast
        days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        forecast = [
            {"day": days[i], "temp_high": round(sc["temp"] + (i*1.2 - 2), 1), "temp_low": round(sc["temp"] - 6 + (i*0.5), 1), "rain_pct": max(5, min(90, sc["rain"] + (i*8 - 15))), "condition": "Fair" if i % 2 == 0 else "Partly Cloudy"}
            for i in range(5)
        ]

        return WeatherResponse(
            location=loc_clean,
            temperature_c=sc["temp"],
            feels_like_c=sc["feels"],
            humidity_pct=sc["hum"],
            wind_speed_kmh=sc["wind"],
            rain_probability_pct=sc["rain"],
            weather_condition=sc["cond"],
            mode="demo",
            risk_alerts=sc["alerts"],
            advisories=advisories,
            forecast_days=forecast
        )

    # -------------------------------------------------------------
    # INTERNAL REAL AI LLM CALLERS (Optional Gemini Integration)
    # -------------------------------------------------------------
    async def _call_gemini_vision_safety(
        self,
        image_bytes: bytes,
        category: str,
        project_name: str,
        site_location: str,
        inspector_notes: str
    ) -> Optional[SafetyAnalyzeResponse]:
        """Calls Google Gemini Vision model if API key is supplied"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        prompt = (
            f"You are a Senior Construction Safety Inspector. Analyze this construction site image.\n"
            f"Project: {project_name}, Location: {site_location}, Category: {category}.\n"
            f"Inspector Notes: {inspector_notes}\n"
            "Return a strictly valid JSON object (no markdown, no extra commentary) matching this schema:\n"
            "{\n"
            '  "risk_level": "low" | "medium" | "high" | "critical",\n'
            '  "observations": [{"title": "string", "description": "string", "severity": "low"|"medium"|"high"|"critical", "location_hint": "string"}],\n'
            '  "hazards": ["string"],\n'
            '  "recommendations": ["string"],\n'
            '  "ppe_required": ["string"]\n'
            "}"
        )
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                
                return SafetyAnalyzeResponse(
                    id=f"SAF-{uuid.uuid4().hex[:8].upper()}",
                    success=True,
                    mode="real",
                    analysis_type="safety",
                    project_name=project_name,
                    site_location=site_location,
                    category=category,
                    risk_level=parsed.get("risk_level", "medium"),
                    observations=[SafetyObservation(**o) for o in parsed.get("observations", [])],
                    hazards=parsed.get("hazards", []),
                    recommendations=parsed.get("recommendations", []),
                    ppe_required=parsed.get("ppe_required", []),
                    inspector_notes=inspector_notes,
                    disclaimer="AI-analyzed vision assessment. Must be formally verified on-site by a qualified safety officer.",
                    timestamp=datetime.utcnow().isoformat() + "Z"
                )
        return None

    async def _call_gemini_vision_structural(
        self,
        image_bytes: bytes,
        structure_type: str,
        location_element: str,
        project_name: str,
        inspector_notes: str
    ) -> Optional[StructuralAnalyzeResponse]:
        """Calls Google Gemini Vision for structural cracking if key is supplied"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        prompt = (
            f"You are a Senior Structural Forensic Engineer. Inspect this structure image.\n"
            f"Project: {project_name}, Structure: {structure_type}, Element: {location_element}.\n"
            f"Notes: {inspector_notes}\n"
            "Return a strictly valid JSON object (no markdown, no extra commentary):\n"
            "{\n"
            '  "severity": "minor" | "moderate" | "severe" | "critical",\n'
            '  "crack_type": "string",\n'
            '  "estimated_width_mm": float,\n'
            '  "observations": [{"title": "string", "description": "string", "severity": "string"}],\n'
            '  "suggested_next_steps": ["string"]\n'
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": "image/jpeg",
                                "data": b64_image
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {"temperature": 0.2, "response_mime_type": "application/json"}
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(raw_text)
                
                return StructuralAnalyzeResponse(
                    id=f"STR-{uuid.uuid4().hex[:8].upper()}",
                    success=True,
                    mode="real",
                    analysis_type="structural",
                    project_name=project_name,
                    structure_type=structure_type,
                    location_element=location_element,
                    severity=parsed.get("severity", "moderate"),
                    crack_type=parsed.get("crack_type", "Surface Crack"),
                    estimated_width_mm=float(parsed.get("estimated_width_mm", 0.5)),
                    observations=[StructuralObservation(**o) for o in parsed.get("observations", [])],
                    suggested_next_steps=parsed.get("suggested_next_steps", []),
                    inspector_notes=inspector_notes,
                    disclaimer="Preliminary multimodal AI observation. Professional structural engineering evaluation is mandatory.",
                    timestamp=datetime.utcnow().isoformat() + "Z"
                )
        return None

    async def _call_gemini_chat(self, message: str, history: List[Any]) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        system_instruction = (
            "You are BuildMind's expert Construction Site Assistant. Provide precise, authoritative, "
            "and practical guidance on site safety, materials, OSHA regulations, scheduling, and concrete works."
        )
        
        contents = []
        for h in history[-6:]:
            role = "user" if h.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.content}]})
        contents.append({"role": "user", "parts": [{"text": message}]})

        payload = {
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.4}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        return None

ai_service = AIService()
