import time
import uuid
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from pydantic import BaseModel
from .image_processor import process_pipeline_op
from .database import load_db, save_db

router = APIRouter()

class UserRegister(BaseModel):
    uid: str
    email: str
    displayName: Optional[str] = "User"
    role: str = "student" # 'student' or 'admin'

class ApproveAdminReq(BaseModel):
    email: str
    approve: bool

class ReviewReq(BaseModel):
    userName: str
    userEmail: str
    rating: int
    comment: str

class BlogReq(BaseModel):
    title: str
    author: str
    role: str
    category: str
    content: str

class ReportReq(BaseModel):
    title: str
    userEmail: str
    userName: str
    operations: List[dict]
    notes: Optional[str] = ""

class SubscriptionReq(BaseModel):
    userEmail: str
    userName: str
    plan: str
    amount: str
    paymentId: str

# --- AUTH & ADMIN APPROVAL ---
@router.post("/auth/register")
def register_user(user: UserRegister):
    db = load_db()
    users = db.get("users", [])
    
    # Check if user already exists
    existing = next((u for u in users if u["email"] == user.email), None)
    if existing:
        return {"status": "exists", "user": existing}
    
    if user.role == "admin":
        # Security mechanism: admin signups enter pending_admin_approval
        new_user = {
            "uid": user.uid,
            "email": user.email,
            "displayName": user.displayName,
            "role": "admin",
            "status": "pending_admin_approval",
            "createdAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        users.append(new_user)
        db["users"] = users
        
        # Add admin approval request to pending list
        reqs = db.get("admin_requests", [])
        reqs.append(new_user)
        db["admin_requests"] = reqs
        
        # Trigger Developer Notification
        notifs = db.get("notifications", [])
        notifs.insert(0, {
            "id": f"notif-admin-{uuid.uuid4().hex[:6]}",
            "title": "🚨 Admin Approval Requested!",
            "message": f"User {user.displayName} ({user.email}) requested Admin privileges. Developer approval required.",
            "type": "admin_approval_request",
            "userEmail": user.email,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })
        db["notifications"] = notifs
        save_db(db)
        return {"status": "pending_approval", "message": "Admin registration submitted. Waiting for developer approval.", "user": new_user}
    else:
        # Student user registration
        new_user = {
            "uid": user.uid,
            "email": user.email,
            "displayName": user.displayName,
            "role": "student",
            "status": "active",
            "createdAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        users.append(new_user)
        db["users"] = users
        
        # Welcome Notification
        notifs = db.get("notifications", [])
        notifs.insert(0, {
            "id": f"notif-welcome-{uuid.uuid4().hex[:6]}",
            "title": "🚀 Welcome to Terravision!",
            "message": f"Welcome {user.displayName}! Your account is active. Explore our 6-stage remote sensing DIP pipeline.",
            "type": "system",
            "userEmail": user.email,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        })
        db["notifications"] = notifs
        save_db(db)
        return {"status": "success", "user": new_user}

@router.post("/auth/send-welcome-email")
def send_welcome_email(payload: dict = Body(...)):
    email = payload.get("email")
    name = payload.get("name", "User")
    return {
        "status": "sent",
        "message": f"Welcome email sent successfully to {name} ({email})"
    }

@router.get("/auth/pending-admins")
def get_pending_admins():
    db = load_db()
    users = db.get("users", [])
    pending = [u for u in users if u.get("role") == "admin" and u.get("status") == "pending_admin_approval"]
    return {"pending_admins": pending}

@router.post("/auth/approve-admin")
def approve_admin(req: ApproveAdminReq):
    db = load_db()
    users = db.get("users", [])
    user = next((u for u in users if u["email"] == req.email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if req.approve:
        user["status"] = "active"
        notif_title = "✅ Admin Request Approved!"
        notif_msg = f"Your admin account ({user['email']}) has been approved by the platform developer!"
    else:
        user["status"] = "rejected"
        notif_title = "❌ Admin Request Rejected"
        notif_msg = f"Your request for admin access was not approved by developer."
        
    db["users"] = users
    db["admin_requests"] = [r for r in db.get("admin_requests", []) if r["email"] != req.email]
    
    notifs = db.get("notifications", [])
    notifs.insert(0, {
        "id": f"notif-app-{uuid.uuid4().hex[:6]}",
        "title": notif_title,
        "message": notif_msg,
        "type": "system",
        "userEmail": req.email,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    db["notifications"] = notifs
    save_db(db)
    return {"status": "success", "user": user}

@router.get("/auth/approved-admins")
def get_approved_admins():
    db = load_db()
    users = db.get("users", [])
    approved = [u for u in users if u.get("role") == "admin" and u.get("status") == "active"]
    return {"approved_admins": approved}

@router.post("/auth/revert-admin")
def revert_admin(payload: dict = Body(...)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    db = load_db()
    users = db.get("users", [])
    user = next((u for u in users if u["email"] == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Revert status back to pending_admin_approval
    user["status"] = "pending_admin_approval"
    user["revertedAt"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    # Re-add to admin_requests list if not already present
    reqs = db.get("admin_requests", [])
    if not any(r["email"] == email for r in reqs):
        reqs.append(user)
        db["admin_requests"] = reqs
        
    db["users"] = users
    
    # Add notification for user
    notifs = db.get("notifications", [])
    notifs.insert(0, {
        "id": f"notif-rev-{uuid.uuid4().hex[:6]}",
        "title": "🔄 Admin Privilege Reverted",
        "message": f"Your active admin status for {email} has been reverted back to pending approval by Master Developer.",
        "type": "admin_approval_request",
        "userEmail": email,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    db["notifications"] = notifs
    save_db(db)
    return {"status": "success", "user": user, "message": f"Successfully reverted approval for {email}"}

# --- USERS MANAGEMENT ---
@router.get("/users")
def get_users():
    db = load_db()
    return {"users": db.get("users", [])}

@router.delete("/users/{email}")
def delete_user(email: str):
    db = load_db()
    users = db.get("users", [])
    target = next((u for u in users if u["email"] == email), None)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mark status as disabled and delete or archive
    target["status"] = "disabled"
    
    # Trigger required user notification:
    # "Due to unusual activities your account has been disabled by admin."
    notifs = db.get("notifications", [])
    notifs.insert(0, {
        "id": f"notif-disabled-{uuid.uuid4().hex[:6]}",
        "title": "⚠️ Account Disabled Alert",
        "message": "Due to unusual activities your account has been disabled by admin.",
        "type": "account_disabled",
        "userEmail": email,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    })
    db["notifications"] = notifs
    db["users"] = users
    save_db(db)
    return {"status": "disabled", "message": f"User {email} has been disabled by admin."}

# --- IMAGE PROCESSING ---
@router.post("/process")
async def process_image(
    file: UploadFile = File(...),
    stage: str = Form(...),
    operation: str = Form(...),
    params: str = Form("{}")
):
    try:
        import json
        params_dict = json.loads(params)
        img_bytes = await file.read()
        res = process_pipeline_op(img_bytes, stage, operation, params_dict)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- REVIEWS & RATINGS ---
@router.get("/reviews")
def get_reviews():
    db = load_db()
    return {"reviews": db.get("reviews", [])}

@router.post("/reviews")
def create_review(rev: ReviewReq):
    db = load_db()
    reviews = db.get("reviews", [])
    new_rev = {
        "id": f"rev-{uuid.uuid4().hex[:6]}",
        "userName": rev.userName,
        "userEmail": rev.userEmail,
        "rating": rev.rating,
        "comment": rev.comment,
        "date": time.strftime("%Y-%m-%d")
    }
    reviews.insert(0, new_rev)
    db["reviews"] = reviews
    save_db(db)
    return {"status": "success", "review": new_rev}

# --- BLOGS ---
@router.get("/blogs")
def get_blogs():
    db = load_db()
    return {"blogs": db.get("blogs", [])}

@router.post("/blogs")
def create_blog(blog: BlogReq):
    db = load_db()
    blogs = db.get("blogs", [])
    new_blog = {
        "id": f"blog-{uuid.uuid4().hex[:6]}",
        "title": blog.title,
        "author": blog.author,
        "role": blog.role,
        "category": blog.category,
        "date": time.strftime("%Y-%m-%d"),
        "content": blog.content
    }
    blogs.insert(0, new_blog)
    db["blogs"] = blogs
    save_db(db)
    return {"status": "success", "blog": new_blog}

# --- REPORTS ---
@router.get("/reports")
def get_reports(userEmail: Optional[str] = None):
    db = load_db()
    reports = db.get("reports", [])
    if userEmail:
        reports = [r for r in reports if r.get("userEmail") == userEmail]
    return {"reports": reports}

@router.post("/reports")
def create_report(rep: ReportReq):
    db = load_db()
    reports = db.get("reports", [])
    new_rep = {
        "id": f"rep-{uuid.uuid4().hex[:6]}",
        "title": rep.title,
        "userEmail": rep.userEmail,
        "userName": rep.userName,
        "operations": rep.operations,
        "notes": rep.notes,
        "createdAt": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    reports.insert(0, new_rep)
    db["reports"] = reports
    save_db(db)
    return {"status": "success", "report": new_rep}

# --- SUBSCRIPTIONS ---
@router.get("/subscriptions")
def get_subscriptions():
    db = load_db()
    return {"subscriptions": db.get("subscriptions", [])}

@router.post("/subscriptions")
def purchase_subscription(sub: SubscriptionReq):
    db = load_db()
    subs = db.get("subscriptions", [])
    new_sub = {
        "id": f"sub-{uuid.uuid4().hex[:6]}",
        "userEmail": sub.userEmail,
        "userName": sub.userName,
        "plan": sub.plan,
        "amount": sub.amount,
        "paymentId": sub.paymentId,
        "status": "Active",
        "date": time.strftime("%Y-%m-%d %H:%M")
    }
    subs.insert(0, new_sub)
    db["subscriptions"] = subs
    save_db(db)
    return {"status": "success", "subscription": new_sub}

# --- NOTIFICATIONS ---
@router.get("/notifications")
def get_notifications(userEmail: Optional[str] = None):
    db = load_db()
    notifs = db.get("notifications", [])
    if userEmail:
        # filter user-specific notifications and retention notifications
        notifs = [n for n in notifs if n.get("userEmail") in [None, userEmail] or n.get("type") in ["retention", "admin_approval_request"]]
    return {"notifications": notifs}
