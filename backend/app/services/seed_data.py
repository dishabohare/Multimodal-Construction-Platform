import json
from datetime import datetime, timedelta
from app.core.database import get_db

KNOWLEDGE_BASE = [
    {
        "id": "kb-1",
        "category": "Concrete & Curing",
        "title": "Standard Curing Periods and Methods (ACI 308R)",
        "summary": "Guidelines for wet curing vs membrane curing for structural concrete.",
        "content": (
            "Concrete must maintain moisture and adequate temperature for hydration to continue. "
            "Under ACI 308R guidelines, Type I Portland cement elements should be cured continuously for a minimum of 7 days "
            "(or until 70% compressive strength is achieved). For blended cements (Type IP/IS with slag or fly ash), cure for at least 14 days. "
            "Methods include continuous ponding/spraying, saturated wet burlap covers under polyethylene sheeting, "
            "or ASTM C309 compliant liquid membrane-forming curing compounds applied immediately after final finishing."
        ),
        "tags": ["Concrete", "ACI 308R", "Curing", "Hydration", "Compressive Strength"]
    },
    {
        "id": "kb-2",
        "category": "Concrete & Curing",
        "title": "Concrete Slump Test Tolerances and Field Procedures (ASTM C143)",
        "summary": "How to execute slump cone measurement and evaluate workability on site.",
        "content": (
            "The slump test assesses consistency before pouring. Using an inverted cone (100mm top, 200mm base, 300mm height), "
            "fill in three layers of equal volume, tamping each layer 25 times with a 16mm round-ended rod. "
            "Lift the mold vertically in 5±2 seconds. Measure subsidence to nearest 5mm. "
            "Typical slump targets: Foundation footings (75-100mm), Slabs & beams (100-125mm), Tremie/pumped concrete (150-180mm with superplasticizer)."
        ),
        "tags": ["Slump Test", "ASTM C143", "Workability", "Quality Control"]
    },
    {
        "id": "kb-3",
        "category": "Site Safety Practices",
        "title": "OSHA 1926.501 Fall Protection Hierarchy on Elevated Decks",
        "summary": "Mandatory fall arrest standards and guardrail specifications for work over 6 feet.",
        "content": (
            "OSHA standard 1926.501 requires fall protection for workers at elevations of 6 feet (1.8m) or higher above a lower level. "
            "The safety hierarchy prioritizes: (1) Elimination/Substitution, (2) Guardrail systems (top rail 42±3 inches, mid-rail 21 inches, toeboard 3.5 inches, capable of withstanding 200 lbf), "
            "(3) Safety net systems (installed within 30 feet of working level), and (4) Personal Fall Arrest Systems (PFAS) anchored to an engineered point supporting at least 5,000 lbs (22.2 kN) per worker."
        ),
        "tags": ["Safety", "OSHA 1926", "Fall Protection", "Guardrails", "Harness"]
    },
    {
        "id": "kb-4",
        "category": "Site Safety Practices",
        "title": "Excavation & Trench Shoring Protocol (OSHA 1926 Subpart P)",
        "summary": "Protective systems for trenches exceeding 5 feet depth to prevent cave-ins.",
        "content": (
            "A trench is considered an excavation where depth exceeds width. Trenches 5 feet (1.5m) or deeper require protective systems: "
            "Sloping (sloping trench walls at an angle based on soil type: Type A 3/4:1, Type B 1:1, Type C 1.5:1), Benching, "
            "Shoring (hydraulic aluminum cylinders), or Shielding (trench boxes). Keep spoil piles and machinery at least 2 feet (0.6m) "
            "from the edge. Provide ladder egress within 25 feet of lateral travel for all workers."
        ),
        "tags": ["Excavation", "Trenching", "Shoring", "Cave-In", "OSHA"]
    },
    {
        "id": "kb-5",
        "category": "Construction Materials",
        "title": "Steel Rebar Grades, Yield Strength, and Minimum Cover Requirements",
        "summary": "Grade 60 vs Grade 75/80 reinforcement specifications and corrosion cover depths.",
        "content": (
            "Deformed steel rebar commonly used in structural RC conforms to ASTM A615 / A706. "
            "Grade 60 provides minimum yield strength of 60,000 psi (420 MPa). "
            "Clear concrete cover requirements per ACI 318: Concrete cast against earth (foundations): 75mm (3 in); "
            "Exterior weather exposed beams/columns: 50mm (2 in); Interior slabs/walls: 20mm to 40mm depending on bar diameter. "
            "Inadequate cover is the primary cause of carbonation and premature chloride-induced rebar corrosion."
        ),
        "tags": ["Rebar", "Reinforcement", "ASTM A615", "Clear Cover", "ACI 318"]
    },
    {
        "id": "kb-6",
        "category": "Structural Inspection Basics",
        "title": "Diagnosing Concrete Cracks: Structural vs Non-Structural",
        "summary": "Distinguishing flexural, shear, plastic shrinkage, and thermal fissures.",
        "content": (
            "Non-structural cracks include plastic shrinkage (shallow, parallel fissures shortly after pour), map crazing, and thermal contraction. "
            "Structural cracks indicate excessive stress or foundation settlement. "
            "Flexural cracks form perpendicular to tension zones (bottom midspan of simply supported beams). "
            "Shear cracks form diagonally (approx 45 degrees) near beam supports and require immediate shoring. "
            "Cracks exceeding 0.3mm (0.012 in) in exterior exposure or 0.4mm in interior exposure generally exceed allowable durability thresholds."
        ),
        "tags": ["Crack Diagnosis", "Shear Crack", "Flexural Crack", "Forensics", "Inspection"]
    },
    {
        "id": "kb-7",
        "category": "Project Management",
        "title": "Critical Path Method (CPM) and Float Optimization",
        "summary": "Principles of sequence scheduling and managing non-critical buffer float.",
        "content": (
            "The Critical Path is the longest sequence of dependent activities from project start to finish, determining total project duration. "
            "Activities on the critical path have Total Float = 0; any delay on these tasks directly slips the final completion date. "
            "Total Float represents the amount of time an activity can be delayed without delaying the project finish date. "
            "Free Float is the delay permitted without impacting subsequent early start dates. Effective superintendents focus daily resources on critical path tasks."
        ),
        "tags": ["CPM", "Gantt", "Float", "Project Planning", "WBS"]
    },
    {
        "id": "kb-8",
        "category": "Building Terminology",
        "title": "Glossary of Key Structural and Site Engineering Terms",
        "summary": "Essential definitions: Acrow prop, Spalling, Efflorescence, Tremie, Formwork.",
        "content": (
            "• Acrow Prop: Telescopic tubular steel temporary support used to shore formwork or load-bearing beams during repairs.\n"
            "• Spalling: Flaking or breaking away of surface concrete caused by rebar expansion or freeze-thaw cycles.\n"
            "• Efflorescence: White powdery deposit of mineral salts leached to the masonry or concrete surface by evaporating water.\n"
            "• Tremie Pipe: Watertight hopper tube used for pouring concrete underwater or in deep pile holes without aggregate segregation.\n"
            "• Formwork: Temporary or permanent mold into which fresh concrete is poured and compacted."
        ),
        "tags": ["Terminology", "Glossary", "Definitions", "Engineering"]
    }
]

def seed_database_if_empty():
    """Populates initial realistic demo data if database is clean"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check projects count
        cursor.execute("SELECT COUNT(*) FROM projects")
        if cursor.fetchone()[0] > 0:
            return  # already seeded

        print("[Seed] Populating initial realistic construction platform data...")
        now = datetime.utcnow()
        
        # 1. Seed Projects
        projects = [
            (
                "PRJ-METRO-01",
                "Skyline Heights Tower C",
                "742 Downtown Financial District, Metro City",
                48500000.0,
                29800000.0,
                (now - timedelta(days=220)).strftime("%Y-%m-%d"),
                (now + timedelta(days=160)).strftime("%Y-%m-%d"),
                "in_progress",
                68,
                "32-story mixed-use commercial and luxury residential tower. Currently in superstructure glazing and MEP stage.",
                (now - timedelta(days=220)).isoformat() + "Z"
            ),
            (
                "PRJ-HARBOR-02",
                "Harborfront Commercial Plaza",
                "Port Terminal Pier 4, Coastal Sector",
                24200000.0,
                11400000.0,
                (now - timedelta(days=110)).strftime("%Y-%m-%d"),
                (now + timedelta(days=240)).strftime("%Y-%m-%d"),
                "in_progress",
                45,
                "Retail mall and conference center with waterfront pedestrian deck. Substructure complete; podium casting ongoing.",
                (now - timedelta(days=110)).isoformat() + "Z"
            ),
            (
                "PRJ-LOGIS-03",
                "Riverside Logistics Park - Phase 1",
                "Highway 101 Industrial Corridor",
                16800000.0,
                15200000.0,
                (now - timedelta(days=190)).strftime("%Y-%m-%d"),
                (now + timedelta(days=35)).strftime("%Y-%m-%d"),
                "in_progress",
                88,
                "350,000 sq.ft cold storage and automated sorting facility. Enclosure and industrial floor slabs nearing completion.",
                (now - timedelta(days=190)).isoformat() + "Z"
            ),
            (
                "PRJ-ECO-04",
                "Greenfield Civic Library & Cultural Hub",
                "Central Park Boulevard, East Ward",
                12500000.0,
                2100000.0,
                (now - timedelta(days=30)).strftime("%Y-%m-%d"),
                (now + timedelta(days=320)).strftime("%Y-%m-%d"),
                "in_progress",
                18,
                "Mass timber eco-certified community facility. Foundation piles and ground beams underway.",
                (now - timedelta(days=30)).isoformat() + "Z"
            )
        ]

        cursor.executemany("""
            INSERT INTO projects (id, name, location, budget, spent, start_date, target_completion_date, status, progress_pct, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, projects)

        # 2. Seed Tasks for Project 1
        tasks_p1 = [
            ("TSK-101", "PRJ-METRO-01", "Poured-in-Place Core Shear Walls (Levels 24-28)", "Superstructure", "critical", 18, 90, 0, "[]", "Concrete Works", "in_progress", now.isoformat()),
            ("TSK-102", "PRJ-METRO-01", "Curtain Wall Unitized Facade Panels (Levels 14-20)", "Envelope", "high", 24, 65, 5, "[]", "Glazing & Facades", "in_progress", now.isoformat()),
            ("TSK-103", "PRJ-METRO-01", "High-Voltage Electrical Busway Risers", "MEP", "high", 14, 50, 10, "[]", "Electrical", "in_progress", now.isoformat()),
            ("TSK-104", "PRJ-METRO-01", "Chilled Water Primary Loop Piping & Risers", "MEP", "medium", 21, 40, 15, "[]", "HVAC Mechanical", "in_progress", now.isoformat()),
            ("TSK-105", "PRJ-METRO-01", "Internal Gypsum Board Partitions (Levels 8-12)", "Finishes", "medium", 30, 25, 20, "[]", "Drywall & Partitions", "in_progress", now.isoformat()),
            ("TSK-106", "PRJ-METRO-01", "Freight Elevator Hoistway Installation", "Vertical Transport", "high", 28, 70, 2, "[]", "Elevators", "in_progress", now.isoformat()),
            ("TSK-107", "PRJ-METRO-01", "Roof Penthouse Steel Structure & Helipad", "Superstructure", "critical", 25, 0, 35, "[]", "Structural Steel", "pending", now.isoformat()),
            ("TSK-108", "PRJ-METRO-01", "Final Building Automation System Commissioning", "Commissioning", "critical", 15, 0, 60, "[]", "Controls & Automation", "pending", now.isoformat())
        ]
        cursor.executemany("""
            INSERT INTO tasks (id, project_id, title, phase, priority, duration_days, progress_pct, start_offset_days, dependencies, assigned_trade, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, tasks_p1)

        # 3. Seed Safety Inspections
        safety_samples = [
            (
                "SAF-DEMO-01",
                "Skyline Heights Tower C",
                "Level 18 Perimeter Scaffold",
                "Scaffolding & Working at Heights",
                "",
                "high",
                "demo",
                json.dumps([
                    {"title": "Missing Mid-Rail on Working Deck", "description": "Secondary scaffold bay lacks standardized mid-rail guard rail above 2.4m.", "severity": "high", "location_hint": "Bay 3 Elevation +54m"},
                    {"title": "Harness Lanyard Anchor Position", "description": "Operative tethered below waist level rather than overhead anchor point.", "severity": "high", "location_hint": "East Deck"}
                ]),
                json.dumps([
                    "Unprotected edge fall hazard (>6ft rule OSHA 1926.501)",
                    "Dropped object danger to lower workers"
                ]),
                json.dumps([
                    "Install complete 42-inch top-rail and 21-inch mid-rail immediately.",
                    "Enforce dual-point 100% tie-off with self-retracting lifelines (SRL)."
                ]),
                json.dumps(["Full Body Harness (ANSI Z359)", "Class E Hard Hat", "Hi-Vis Vest", "Steel Toe Boots"]),
                "Observed during routine morning perimeter audit by safety supervisor.",
                "Simulated safety observation for demo purposes. Formal sign-off requires site safety officer inspection.",
                (now - timedelta(days=2)).isoformat() + "Z"
            ),
            (
                "SAF-DEMO-02",
                "Harborfront Commercial Plaza",
                "North Basement Excavation Section 2",
                "Excavation & Trenching",
                "",
                "critical",
                "demo",
                json.dumps([
                    {"title": "Inadequate Shoring Support on Surcharge Bank", "description": "Trench exceeds 2m depth with heavy excavator idling within 1m of un-shored edge.", "severity": "critical", "location_hint": "North Trench"}
                ]),
                json.dumps([
                    "Imminent cave-in risk due to dynamic equipment vibration and surcharge."
                ]),
                json.dumps([
                    "Evacuate workers from trench immediately.",
                    "Erect hydraulic aluminum trench box and pull back equipment 3 meters."
                ]),
                json.dumps(["Hard Hat", "High-Vis Vest", "Metatarsal Boots", "Personal Gas Detector"]),
                "Immediate stop-work notice issued on Section 2 trench.",
                "Simulated safety observation for demo purposes.",
                (now - timedelta(days=5)).isoformat() + "Z"
            ),
            (
                "SAF-DEMO-03",
                "Riverside Logistics Park - Phase 1",
                "Bay D Main Electrical Substation",
                "Electrical & Power Safety",
                "",
                "low",
                "demo",
                json.dumps([
                    {"title": "Proper Lockout/Tagout (LOTO) Compliance Verified", "description": "All 480V feeder panels properly tagged and locked during transformer feeder pulling.", "severity": "low", "location_hint": "Substation Room"}
                ]),
                json.dumps([]),
                json.dumps([
                    "Maintain current lockout log entries across shift turnover."
                ]),
                json.dumps(["Insulated Dielectric Boots", "Arc Flash Face Shield", "NFPA 70E Gloves"]),
                "Routine high-voltage panel audit completed satisfactorily.",
                "Simulated safety observation for demo purposes.",
                (now - timedelta(days=8)).isoformat() + "Z"
            )
        ]
        cursor.executemany("""
            INSERT INTO safety_inspections (id, project_name, site_location, category, image_path, risk_level, mode, observations, hazards, recommendations, ppe_required, inspector_notes, disclaimer, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, safety_samples)

        # 4. Seed Structural Inspections
        structural_samples = [
            (
                "STR-DEMO-01",
                "Skyline Heights Tower C",
                "Reinforced Concrete Transfer Beam",
                "Level 4 Parking Ramp Column B-7",
                "",
                "moderate",
                "Diagonal Shear Crack (45-degree)",
                0.65,
                "demo",
                json.dumps([
                    {"title": "Diagonal Shear Pattern Near Support", "description": "45-degree hairline shear fissure extending 42cm from support interface.", "severity": "moderate"}
                ]),
                json.dumps([
                    "Install crack width tell-tale monitoring gauge for 14-day displacement tracking.",
                    "Schedule ultrasonic pulse velocity test across shear span.",
                    "Submit report to Principal Structural Engineer for live load verification."
                ]),
                "Observed during post-formwork removal punch list review.",
                "Visual AI inspection demo. Professional engineering certification mandatory.",
                (now - timedelta(days=3)).isoformat() + "Z"
            ),
            (
                "STR-DEMO-02",
                "Greenfield Civic Library",
                "Basement Retaining Wall",
                "West Perimeter Stem Wall",
                "",
                "minor",
                "Plastic Shrinkage & Crazing",
                0.22,
                "demo",
                json.dumps([
                    {"title": "Superficial Shrinkage Crazing", "description": "Interconnected surface map cracking; non-structural moisture evaporation pattern.", "severity": "minor"}
                ]),
                json.dumps([
                    "Apply crystalline waterproofing slurry coat.",
                    "Re-inspect in 30 days during rainy period to ensure dry perimeter."
                ]),
                "Routine pre-backfill waterproofing inspection.",
                "Visual AI inspection demo. Professional engineering certification mandatory.",
                (now - timedelta(days=9)).isoformat() + "Z"
            )
        ]
        cursor.executemany("""
            INSERT INTO structural_inspections (id, project_name, structure_type, location_element, image_path, severity, crack_type, estimated_width_mm, mode, observations, suggested_next_steps, inspector_notes, disclaimer, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, structural_samples)

        # 5. Seed Property Valuations
        valuations_samples = [
            (
                "VAL-DEMO-01",
                "Downtown Financial District, Metro City",
                "Commercial Office Suite",
                4500.0,
                0,
                3.5,
                12,
                "Premium",
                json.dumps(["LEED Gold Certified", "Dedicated High-Speed Elevators", "Fiber Backbone", "HVAC Zoning"]),
                1750000.0,
                2050000.0,
                1912500.0,
                425.0,
                json.dumps([
                    {"factor": "Prime Urban Core Access", "impact": "positive", "weight_pct": 40, "description": "Adjacent to central transit interchange"},
                    {"factor": "Premium Grade-A Fitout", "impact": "positive", "weight_pct": 30, "description": "Acoustic ceiling baffles and raised access flooring"},
                    {"factor": "3.5yr Asset Age", "impact": "neutral", "weight_pct": 15, "description": "Minimal depreciation recorded"}
                ]),
                json.dumps([
                    "Based on 92% occupancy rates in adjacent commercial towers.",
                    "Triple Net (NNN) commercial lease baseline model."
                ]),
                "demo",
                (now - timedelta(days=4)).isoformat() + "Z"
            ),
            (
                "VAL-DEMO-02",
                "Westside Residential Suburb",
                "Single Family Luxury Villa",
                3200.0,
                4,
                1.0,
                2,
                "Luxury",
                json.dumps(["Infinity Pool", "Solar PV Array", "Smart Home Automation", "Italian Marble Flooring"]),
                1120000.0,
                1280000.0,
                1200000.0,
                375.0,
                json.dumps([
                    {"factor": "Turnkey Luxury Construction", "impact": "positive", "weight_pct": 35, "description": "Architectural grade finishings and fixtures"},
                    {"factor": "Energy Efficient Solar Integration", "impact": "positive", "weight_pct": 20, "description": "Reduces ongoing operational utility cost"}
                ]),
                json.dumps([
                    "Clear fee simple residential title assumed.",
                    "Recent comparable sales in gated neighborhood within 0.5 miles."
                ]),
                "demo",
                (now - timedelta(days=7)).isoformat() + "Z"
            )
        ]
        cursor.executemany("""
            INSERT INTO property_valuations (id, location, property_type, built_up_area_sqft, bedrooms, age_years, floors, construction_quality, amenities, estimated_min_price, estimated_max_price, estimated_avg_price, price_per_sqft, influencing_factors, assumptions, mode, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, valuations_samples)

        # 6. Seed Activity Logs
        logs = [
            ("SAFETY", "Safety Inspection Logged", "High risk scaffold mid-rail observation recorded on Skyline Heights Tower C.", (now - timedelta(days=2)).isoformat() + "Z"),
            ("STRUCTURAL", "Structural Assessment Generated", "Diagonal shear crack evaluated on Level 4 transfer beam.", (now - timedelta(days=3)).isoformat() + "Z"),
            ("VALUATION", "Property Valuation Computed", "Estimated valuation of $1,912,500 calculated for Downtown Commercial Suite.", (now - timedelta(days=4)).isoformat() + "Z"),
            ("PROJECT", "Milestone Reached", "Substructure concrete slab completed for Harborfront Commercial Plaza.", (now - timedelta(days=6)).isoformat() + "Z"),
            ("WEATHER", "Weather Warning Issued", "High wind advisory flagged for crane lifting operations.", (now - timedelta(days=7)).isoformat() + "Z")
        ]
        cursor.executemany("""
            INSERT INTO activity_logs (action_type, title, description, created_at)
            VALUES (?, ?, ?, ?)
        """, logs)

        print("[Seed] Realistic database seed completed successfully.")
