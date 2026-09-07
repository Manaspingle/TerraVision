import os
import json
import time
from typing import List, Dict, Any

DATA_FILE = os.path.join(os.path.dirname(__file__), "database.json")

DEFAULT_BLOGS = [
    {
        "id": "blog-1",
        "title": "Understanding Multispectral & Hyperspectral Satellite Imagery",
        "author": "TerraVision Team",
        "role": "Default Library",
        "category": "Remote Sensing",
        "date": "2026-08-15",
        "content": "Multispectral remote sensing captures image data within specific wavelength bands across the electromagnetic spectrum. Learn how LANDSAT 8 and Sentinel-2 use band combinations like False Color Infrared to analyze crop health and vegetation indices (NDVI)."
    },
    {
        "id": "blog-2",
        "title": "Histogram Equalization & CLAHE in Earth Observation",
        "author": "TerraVision Team",
        "role": "Default Library",
        "category": "Image Enhancement",
        "date": "2026-08-20",
        "content": "Satellite images often suffer from low dynamic range due to atmospheric haze. Contrast Limited Adaptive Histogram Equalization (CLAHE) enhances subtle ground features without amplifying noise."
    },
    {
        "id": "blog-3",
        "title": "Land Cover Classification using K-Means & Watershed Segmentation",
        "author": "TerraVision Team",
        "role": "Default Library",
        "category": "Segmentation",
        "date": "2026-09-01",
        "content": "Segmentation divides complex satellite scenes into water bodies, urban zones, and forest cover. K-Means clustering groups spectral signatures, while Watershed isolates water basins."
    }
]

INITIAL_RETENTION_NOTIFICATIONS = [
    {
        "id": "notif-1",
        "title": "🛰️ LANDSAT 8 Is Feeling Lonely!",
        "message": "Hey Stargazer! Your satellite imagery hasn't seen any contrast stretching today. Give your spectral bands some love!",
        "type": "retention",
        "timestamp": "Just now"
    },
    {
        "id": "notif-2",
        "title": "📡 Is Your RGB Looking A Bit Gray?",
        "message": "Don't let your land-cover classification fade. Run a CLAHE enhancement before your coffee gets cold!",
        "type": "retention",
        "timestamp": "10 mins ago"
    },
    {
        "id": "notif-3",
        "title": "🌌 Earth Calling TerraVision User!",
        "message": "Swiggy delivers food, TerraVision delivers pixel-perfect GLCM texture feature maps! Open the Studio now.",
        "type": "retention",
        "timestamp": "1 hour ago"
    }
]

SAMPLE_ADMIN_REQUESTS = [
    {
        "uid": "req-admin-101",
        "email": "dev.dixit@gis-research.org",
        "displayName": "Dev Dixit (GIS Lead)",
        "role": "admin",
        "status": "pending_admin_approval",
        "createdAt": "2026-09-07 21:45:10"
    },
    {
        "uid": "req-admin-102",
        "email": "sarah.admin@earthobs.net",
        "displayName": "Sarah Jenkins (Remote Sensing Analyst)",
        "role": "admin",
        "status": "pending_admin_approval",
        "createdAt": "2026-09-07 22:15:30"
    }
]

def load_db() -> Dict[str, Any]:
    if not os.path.exists(DATA_FILE):
        initial_db = {
            "users": [
                {
                    "uid": "master-admin-1",
                    "email": "manaspingle.dev@gmail.com",
                    "displayName": "Manas Pingle (Master Admin)",
                    "role": "master_admin",
                    "status": "active",
                    "createdAt": "2026-08-01 10:00:00"
                },
                SAMPLE_ADMIN_REQUESTS[0],
                SAMPLE_ADMIN_REQUESTS[1]
            ],
            "admin_requests": SAMPLE_ADMIN_REQUESTS,
            "blogs": DEFAULT_BLOGS,
            "reviews": [],
            "subscriptions": [
                {
                    "id": "sub-101",
                    "userEmail": "alex.student@university.edu",
                    "userName": "Alex Student",
                    "plan": "Pro Explorer Plan",
                    "amount": "$29/mo",
                    "paymentId": "pay_K9zX12789a",
                    "status": "Active",
                    "date": "2026-09-06 14:32"
                }
            ],
            "reports": [],
            "notifications": INITIAL_RETENTION_NOTIFICATIONS
        }
        save_db(initial_db)
        return initial_db
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_db(db: Dict[str, Any]):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
