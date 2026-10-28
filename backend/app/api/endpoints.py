import os
import json
import uuid
import aiofiles
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import get_db
from app.schemas.schemas import (
    HealthResponse,
    SafetyAnalyzeResponse,
    StructuralAnalyzeResponse,
    ValuationRequest,
    ValuationResponse,
    ProjectCreate,
    ProjectResponse,
    TaskItem,
    PlanningGenerateRequest,
    PlanningGenerateResponse,
    AssistantChatRequest,
    AssistantChatResponse,
    WeatherResponse,
    KnowledgeItem,
    UnifiedReportItem
)
from app.services.ai_service import ai_service
from app.services.seed_data import KNOWLEDGE_BASE

router = APIRouter()

# -------------------------------------------------------------
# 1. HEALTH & SYSTEM STATUS
# -------------------------------------------------------------
@router.get("/health", response_model=HealthResponse)
def get_health():
    is_cfg = ai_service.is_ai_configured
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        ai_configured=is_cfg,
        ai_provider=ai_service.provider,
        database_connected=True,
        mode="real" if is_cfg else "demo",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

# -------------------------------------------------------------
# 2. DASHBOARD AGGREGATE STATS
# -------------------------------------------------------------
@router.get("/dashboard")
def get_dashboard_data(
    project_id: Optional[str] = Query(None, description="Optional filter by project")
):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Projects
        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        project_rows = cursor.fetchall()
        projects = [dict(r) for r in project_rows]
        
        # Filter if requested
        active_projects = projects
        if project_id and project_id != "all":
            active_projects = [p for p in projects if p["id"] == project_id]

        total_projects = len(projects)
        avg_progress = (
            round(sum(p["progress_pct"] for p in projects) / total_projects, 1)
            if total_projects > 0 else 0
        )
        
        # 2. Safety Inspections
        cursor.execute("SELECT * FROM safety_inspections ORDER BY created_at DESC")
        safety_rows = cursor.fetchall()
        safety_inspections = [dict(r) for r in safety_rows]
        
        # Risk Distribution counts
        risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        for s in safety_inspections:
            rl = s.get("risk_level", "medium").lower()
            if rl in risk_counts:
                risk_counts[rl] += 1
            else:
                risk_counts["medium"] += 1
                
        high_risk_obs = risk_counts["critical"] + risk_counts["high"]
        
        # 3. Structural Inspections
        cursor.execute("SELECT * FROM structural_inspections ORDER BY created_at DESC")
        struct_rows = cursor.fetchall()
        structural_inspections = [dict(r) for r in struct_rows]

        # 4. Activity Logs
        cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 10")
        activity_rows = cursor.fetchall()
        recent_activity = [dict(r) for r in activity_rows]
        
        # 5. Project Progress Chart data
        project_progress_chart = [
            {
                "id": p["id"],
                "name": p["name"],
                "progress": p["progress_pct"],
                "budget_spent_pct": round((p["spent"] / p["budget"]) * 100, 1) if p["budget"] > 0 else 0,
                "status": p["status"]
            }
            for p in projects
        ]

        # 6. Safety Risk Chart data
        safety_risk_chart = [
            {"name": "Critical", "count": risk_counts["critical"], "color": "#EF4444"},
            {"name": "High", "count": risk_counts["high"], "color": "#F97316"},
            {"name": "Medium", "count": risk_counts["medium"], "color": "#EAB308"},
            {"name": "Low", "count": risk_counts["low"], "color": "#10B981"}
        ]

        # Recent combined inspections
        recent_inspections = []
        for s in safety_inspections[:4]:
            recent_inspections.append({
                "id": s["id"],
                "type": "Safety Inspection",
                "project": s["project_name"],
                "detail": f"{s['category']} ({s['risk_level'].upper()})",
                "risk_level": s["risk_level"],
                "date": s["created_at"][:10],
                "mode": s["mode"]
            })
        for st in structural_inspections[:3]:
            recent_inspections.append({
                "id": st["id"],
                "type": "Structural Inspection",
                "project": st["project_name"],
                "detail": f"{st['structure_type']} - {st['crack_type']}",
                "risk_level": st["severity"],
                "date": st["created_at"][:10],
                "mode": st["mode"]
            })
            
        recent_inspections.sort(key=lambda x: x["date"], reverse=True)

        return {
            "total_active_projects": total_projects,
            "safety_inspections_count": len(safety_inspections),
            "high_risk_observations": high_risk_obs,
            "structural_inspections_count": len(structural_inspections),
            "average_completion_pct": avg_progress,
            "projects": projects,
            "project_progress_chart": project_progress_chart,
            "safety_risk_chart": safety_risk_chart,
            "recent_activity": recent_activity,
            "recent_inspections": recent_inspections[:6],
            "demo_mode": not ai_service.is_ai_configured
        }

# -------------------------------------------------------------
# 3. SAFETY MONITORING MODULE
# -------------------------------------------------------------
@router.post("/safety/analyze", response_model=SafetyAnalyzeResponse)
async def analyze_safety_inspection(
    project_name: str = Form(...),
    site_location: str = Form(...),
    category: str = Form(...),
    inspector_notes: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    image_bytes = None
    saved_filename = ""
    image_url = None

    if image and image.filename:
        # Validate MIME type
        if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type: {image.content_type}. Allowed: JPEG, PNG, WEBP, BMP"
            )
        
        image_bytes = await image.read()
        if len(image_bytes) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Image file exceeds maximum allowable size of {settings.MAX_FILE_SIZE // (1024*1024)}MB."
            )
            
        # Save to uploads
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        saved_filename = f"safety_{uuid.uuid4().hex[:10]}{ext}"
        save_path = settings.UPLOAD_DIR / saved_filename
        async with aiofiles.open(save_path, "wb") as f:
            await f.write(image_bytes)
        image_url = f"/uploads/{saved_filename}"

    # Call AI service (handles real Gemini or high-fidelity labeled demo)
    result = await ai_service.analyze_safety(
        project_name=project_name,
        site_location=site_location,
        category=category,
        image_bytes=image_bytes,
        image_url=image_url,
        inspector_notes=inspector_notes
    )

    # Persist in SQLite
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO safety_inspections (
                id, project_name, site_location, category, image_path, risk_level, mode,
                observations, hazards, recommendations, ppe_required, inspector_notes, disclaimer, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.id,
            result.project_name,
            result.site_location,
            result.category,
            result.image_url or "",
            result.risk_level,
            result.mode,
            json.dumps([o.model_dump() for o in result.observations]),
            json.dumps(result.hazards),
            json.dumps(result.recommendations),
            json.dumps(result.ppe_required),
            result.inspector_notes or "",
            result.disclaimer,
            result.timestamp
        ))
        
        # Log activity
        cursor.execute("""
            INSERT INTO activity_logs (action_type, title, description, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            "SAFETY",
            f"Safety Inspection: {result.project_name}",
            f"{result.risk_level.upper()} risk observed in {result.category}.",
            result.timestamp
        ))

    return result

@router.get("/safety/inspections")
def get_safety_inspections():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM safety_inspections ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["observations"] = json.loads(d.get("observations") or "[]")
            d["hazards"] = json.loads(d.get("hazards") or "[]")
            d["recommendations"] = json.loads(d.get("recommendations") or "[]")
            d["ppe_required"] = json.loads(d.get("ppe_required") or "[]")
            result.append(d)
        return result

# -------------------------------------------------------------
# 4. CRACK DETECTION & STRUCTURAL INSPECTION
# -------------------------------------------------------------
@router.post("/structural/analyze", response_model=StructuralAnalyzeResponse)
async def analyze_structural_inspection(
    project_name: str = Form(...),
    structure_type: str = Form(...),
    location_element: str = Form(...),
    inspector_notes: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    image_bytes = None
    saved_filename = ""
    image_url = None

    if image and image.filename:
        if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported image type: {image.content_type}"
            )
        image_bytes = await image.read()
        if len(image_bytes) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image file exceeds maximum allowable size (15MB)."
            )
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        saved_filename = f"structural_{uuid.uuid4().hex[:10]}{ext}"
        save_path = settings.UPLOAD_DIR / saved_filename
        async with aiofiles.open(save_path, "wb") as f:
            await f.write(image_bytes)
        image_url = f"/uploads/{saved_filename}"

    result = await ai_service.analyze_structural(
        project_name=project_name,
        structure_type=structure_type,
        location_element=location_element,
        image_bytes=image_bytes,
        image_url=image_url,
        inspector_notes=inspector_notes
    )

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO structural_inspections (
                id, project_name, structure_type, location_element, image_path, severity, crack_type,
                estimated_width_mm, mode, observations, suggested_next_steps, inspector_notes, disclaimer, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.id,
            result.project_name,
            result.structure_type,
            result.location_element,
            result.image_url or "",
            result.severity,
            result.crack_type,
            result.estimated_width_mm,
            result.mode,
            json.dumps([o.model_dump() for o in result.observations]),
            json.dumps(result.suggested_next_steps),
            result.inspector_notes or "",
            result.disclaimer,
            result.timestamp
        ))
        
        cursor.execute("""
            INSERT INTO activity_logs (action_type, title, description, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            "STRUCTURAL",
            f"Structural Crack Scan: {result.structure_type}",
            f"{result.severity.upper()} crack ({result.crack_type}) identified.",
            result.timestamp
        ))

    return result

@router.get("/structural/inspections")
def get_structural_inspections():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM structural_inspections ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["observations"] = json.loads(d.get("observations") or "[]")
            d["suggested_next_steps"] = json.loads(d.get("suggested_next_steps") or "[]")
            result.append(d)
        return result

# -------------------------------------------------------------
# 5. REAL ESTATE VALUATION
# -------------------------------------------------------------
@router.post("/valuation/estimate", response_model=ValuationResponse)
async def estimate_valuation(req: ValuationRequest):
    result = await ai_service.estimate_valuation(req)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO property_valuations (
                id, location, property_type, built_up_area_sqft, bedrooms, age_years,
                floors, construction_quality, amenities, estimated_min_price, estimated_max_price,
                estimated_avg_price, price_per_sqft, influencing_factors, assumptions, mode, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            result.id,
            result.location,
            result.property_type,
            result.built_up_area_sqft,
            req.bedrooms,
            req.age_years,
            req.floors,
            req.construction_quality,
            json.dumps(req.amenities),
            result.estimated_min_price,
            result.estimated_max_price,
            result.estimated_avg_price,
            result.price_per_sqft,
            json.dumps([f.model_dump() for f in result.influencing_factors]),
            json.dumps(result.assumptions),
            result.mode,
            result.timestamp
        ))
        
        cursor.execute("""
            INSERT INTO activity_logs (action_type, title, description, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            "VALUATION",
            f"Valuation: {result.property_type}",
            f"Modeled valuation of ${result.estimated_avg_price:,.0f} in {result.location}.",
            result.timestamp
        ))

    return result

@router.get("/valuation/history")
def get_valuation_history():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM property_valuations ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["amenities"] = json.loads(d.get("amenities") or "[]")
            d["influencing_factors"] = json.loads(d.get("influencing_factors") or "[]")
            d["assumptions"] = json.loads(d.get("assumptions") or "[]")
            result.append(d)
        return result

# -------------------------------------------------------------
# 6. PROJECTS & TASKS MANAGEMENT
# -------------------------------------------------------------
@router.get("/projects", response_model=List[ProjectResponse])
def get_all_projects():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects ORDER BY created_at DESC")
        rows = cursor.fetchall()
        projects = []
        for r in rows:
            p = dict(r)
            # fetch tasks for each project
            cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY start_offset_days ASC", (p["id"],))
            task_rows = cursor.fetchall()
            tasks = []
            for tr in task_rows:
                td = dict(tr)
                td["dependencies"] = json.loads(td.get("dependencies") or "[]")
                tasks.append(td)
            p["tasks"] = tasks
            projects.append(p)
        return projects

@router.post("/projects", response_model=ProjectResponse)
def create_project(req: ProjectCreate):
    project_id = f"PRJ-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO projects (
                id, name, location, budget, spent, start_date, target_completion_date, status, progress_pct, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            project_id,
            req.name,
            req.location,
            req.budget,
            req.spent,
            req.start_date,
            req.target_completion_date,
            req.status,
            req.progress_pct,
            req.notes or "",
            now_iso
        ))
        
        cursor.execute("""
            INSERT INTO activity_logs (action_type, title, description, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            "PROJECT",
            f"New Project Created: {req.name}",
            f"Budget: ${req.budget:,.0f} | Location: {req.location}",
            now_iso
        ))

    return ProjectResponse(
        id=project_id,
        name=req.name,
        location=req.location,
        budget=req.budget,
        spent=req.spent,
        start_date=req.start_date,
        target_completion_date=req.target_completion_date,
        status=req.status,
        progress_pct=req.progress_pct,
        notes=req.notes,
        created_at=now_iso,
        tasks=[]
    )

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project_by_id(project_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail=f"Project with ID '{project_id}' not found.")
        
        p = dict(row)
        cursor.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY start_offset_days ASC", (project_id,))
        task_rows = cursor.fetchall()
        tasks = []
        for tr in task_rows:
            td = dict(tr)
            td["dependencies"] = json.loads(td.get("dependencies") or "[]")
            tasks.append(td)
        p["tasks"] = tasks
        return p

@router.delete("/projects/{project_id}")
def delete_project(project_id: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE project_id = ?", (project_id,))
        cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "message": f"Project {project_id} deleted."}

@router.post("/projects/{project_id}/tasks")
def add_project_task(project_id: str, task: TaskItem):
    task_id = f"TSK-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO tasks (
                id, project_id, title, phase, priority, duration_days, progress_pct,
                start_offset_days, dependencies, assigned_trade, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            task_id,
            project_id,
            task.title,
            task.phase,
            task.priority,
            task.duration_days,
            task.progress_pct,
            task.start_offset_days,
            json.dumps(task.dependencies),
            task.assigned_trade,
            task.status,
            now_iso
        ))
    return {"success": True, "id": task_id}

@router.patch("/tasks/{task_id}")
def update_task_progress(task_id: str, progress_pct: int = Query(..., ge=0, le=100)):
    status_str = "completed" if progress_pct == 100 else ("in_progress" if progress_pct > 0 else "pending")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE tasks SET progress_pct = ?, status = ? WHERE id = ?", (progress_pct, status_str, task_id))
    return {"success": True, "task_id": task_id, "progress_pct": progress_pct, "status": status_str}

# -------------------------------------------------------------
# 7. AI PROJECT PLANNER
# -------------------------------------------------------------
@router.post("/planning/generate", response_model=PlanningGenerateResponse)
async def generate_project_plan(req: PlanningGenerateRequest):
    return await ai_service.generate_project_plan(req)

# -------------------------------------------------------------
# 8. DAILY SITE ASSISTANT
# -------------------------------------------------------------
@router.post("/assistant/chat", response_model=AssistantChatResponse)
async def chat_with_assistant(req: AssistantChatRequest):
    return await ai_service.chat_assistant(req)

# -------------------------------------------------------------
# 9. WEATHER-AWARE ADVISORY
# -------------------------------------------------------------
@router.get("/weather", response_model=WeatherResponse)
async def get_weather(location: str = Query("Metro City", description="Target site location")):
    return await ai_service.get_weather_advisory(location)

# -------------------------------------------------------------
# 10. KNOWLEDGE BASE
# -------------------------------------------------------------
@router.get("/knowledge", response_model=List[KnowledgeItem])
def get_knowledge_base(
    query: Optional[str] = Query(None, description="Search keyword"),
    category: Optional[str] = Query(None, description="Category filter")
):
    results = KNOWLEDGE_BASE
    if category and category != "All":
        results = [k for k in results if k["category"].lower() == category.lower()]
    if query:
        q = query.lower()
        results = [
            k for k in results
            if q in k["title"].lower() or q in k["content"].lower() or any(q in t.lower() for t in k["tags"])
        ]
    return [KnowledgeItem(**k) for k in results]

# -------------------------------------------------------------
# 11. UNIFIED REPORTS REPOSITORY
# -------------------------------------------------------------
@router.get("/reports", response_model=List[UnifiedReportItem])
def get_all_reports(
    report_type: Optional[str] = Query(None, description="Filter: safety, structural, valuation, planning")
):
    unified = []
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Safety
        cursor.execute("SELECT * FROM safety_inspections ORDER BY created_at DESC")
        for r in cursor.fetchall():
            d = dict(r)
            d["observations"] = json.loads(d.get("observations") or "[]")
            d["hazards"] = json.loads(d.get("hazards") or "[]")
            d["recommendations"] = json.loads(d.get("recommendations") or "[]")
            d["ppe_required"] = json.loads(d.get("ppe_required") or "[]")
            unified.append(UnifiedReportItem(
                id=d["id"],
                type="safety",
                title=f"Safety Inspection: {d['project_name']}",
                subtitle=f"{d['category']} | {d['site_location']}",
                risk_or_status=d["risk_level"].upper(),
                mode=d["mode"],
                created_at=d["created_at"],
                data=d
            ))
            
        # Structural
        cursor.execute("SELECT * FROM structural_inspections ORDER BY created_at DESC")
        for r in cursor.fetchall():
            d = dict(r)
            d["observations"] = json.loads(d.get("observations") or "[]")
            d["suggested_next_steps"] = json.loads(d.get("suggested_next_steps") or "[]")
            unified.append(UnifiedReportItem(
                id=d["id"],
                type="structural",
                title=f"Structural Assessment: {d['structure_type']}",
                subtitle=f"{d['project_name']} | {d['location_element']}",
                risk_or_status=d["severity"].upper(),
                mode=d["mode"],
                created_at=d["created_at"],
                data=d
            ))

        # Valuation
        cursor.execute("SELECT * FROM property_valuations ORDER BY created_at DESC")
        for r in cursor.fetchall():
            d = dict(r)
            d["amenities"] = json.loads(d.get("amenities") or "[]")
            d["influencing_factors"] = json.loads(d.get("influencing_factors") or "[]")
            d["assumptions"] = json.loads(d.get("assumptions") or "[]")
            unified.append(UnifiedReportItem(
                id=d["id"],
                type="valuation",
                title=f"Property Valuation: {d['property_type']}",
                subtitle=f"${d['estimated_avg_price']:,.0f} (${d['price_per_sqft']:,.2f}/sq.ft) in {d['location']}",
                risk_or_status="VALUATION",
                mode=d["mode"],
                created_at=d["created_at"],
                data=d
            ))

    # Filter by type if requested
    if report_type and report_type.lower() != "all":
        unified = [u for u in unified if u.type.lower() == report_type.lower()]

    unified.sort(key=lambda x: x.created_at, reverse=True)
    return unified
