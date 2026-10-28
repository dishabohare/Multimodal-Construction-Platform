import sqlite3
import json
from contextlib import contextmanager
from datetime import datetime
from app.core.config import settings

def get_connection():
    conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initializes tables in the SQLite database"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # 1. Projects
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT NOT NULL,
                budget REAL NOT NULL,
                spent REAL DEFAULT 0,
                start_date TEXT NOT NULL,
                target_completion_date TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'in_progress',
                progress_pct INTEGER NOT NULL DEFAULT 0,
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL
            )
        """)

        # 2. Project Tasks
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                phase TEXT NOT NULL,
                priority TEXT NOT NULL DEFAULT 'medium',
                duration_days INTEGER NOT NULL DEFAULT 7,
                progress_pct INTEGER NOT NULL DEFAULT 0,
                start_offset_days INTEGER NOT NULL DEFAULT 0,
                dependencies TEXT DEFAULT '[]',
                assigned_trade TEXT DEFAULT 'General',
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            )
        """)

        # 3. Safety Inspections
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS safety_inspections (
                id TEXT PRIMARY KEY,
                project_name TEXT NOT NULL,
                site_location TEXT NOT NULL,
                category TEXT NOT NULL,
                image_path TEXT DEFAULT '',
                risk_level TEXT NOT NULL,
                mode TEXT NOT NULL DEFAULT 'demo',
                observations TEXT NOT NULL,
                hazards TEXT NOT NULL,
                recommendations TEXT NOT NULL,
                ppe_required TEXT NOT NULL,
                inspector_notes TEXT DEFAULT '',
                disclaimer TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        # 4. Structural Inspections
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS structural_inspections (
                id TEXT PRIMARY KEY,
                project_name TEXT NOT NULL,
                structure_type TEXT NOT NULL,
                location_element TEXT NOT NULL,
                image_path TEXT DEFAULT '',
                severity TEXT NOT NULL,
                crack_type TEXT DEFAULT 'Surface',
                estimated_width_mm REAL DEFAULT 0.5,
                mode TEXT NOT NULL DEFAULT 'demo',
                observations TEXT NOT NULL,
                suggested_next_steps TEXT NOT NULL,
                inspector_notes TEXT DEFAULT '',
                disclaimer TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        # 5. Property Valuations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS property_valuations (
                id TEXT PRIMARY KEY,
                location TEXT NOT NULL,
                property_type TEXT NOT NULL,
                built_up_area_sqft REAL NOT NULL,
                bedrooms INTEGER NOT NULL,
                age_years REAL NOT NULL,
                floors INTEGER NOT NULL,
                construction_quality TEXT NOT NULL,
                amenities TEXT NOT NULL,
                estimated_min_price REAL NOT NULL,
                estimated_max_price REAL NOT NULL,
                estimated_avg_price REAL NOT NULL,
                price_per_sqft REAL NOT NULL,
                influencing_factors TEXT NOT NULL,
                assumptions TEXT NOT NULL,
                mode TEXT NOT NULL DEFAULT 'demo',
                created_at TEXT NOT NULL
            )
        """)

        # 6. Activity Logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
