"""
FastAPI Main Application - EcoLearn AI Backend
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv
from database import get_db, engine, Base
from models import (
    User,
    Course,
    Enrollment,
    CarbonMetric,
    TreePlantation,
    Achievement,
    UserAchievement,
)
import schemas
from services.learning_service import LearningService
from services.carbon_service import CarbonService
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import hashlib

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env vars from .env (local/dev)
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(
    title="EcoLearn AI API",
    description="API for AI-powered learning with environmental impact tracking",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# NOTE: tokenUrl should match your actual login endpoint for Swagger/OAuth flows
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

SECRET_KEY = os.getenv("SECRET_KEY", "keysecret")  # change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def _pw_to_bytes(pw: str) -> bytes:
    """
    bcrypt has a 72-byte input limit. To avoid runtime errors and keep the system robust,
    we pre-hash any password (any length) into fixed 32 bytes via SHA-256.
    """
    return hashlib.sha256(pw.encode("utf-8")).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(_pw_to_bytes(plain_password), hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(_pw_to_bytes(password))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = User(
        email=user.email,
        name=user.name,
        hashed_password=get_password_hash(user.password),
        avatar=user.name[:2].upper(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    logger.info(f"New user registered: {user.email}")
    return db_user


@app.post("/api/auth/token")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # OAuth2PasswordRequestForm uses username field for the login identifier
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    logger.info(f"User logged in: {user.email}")
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/api/ai/generate-course", response_model=schemas.AIGenerateResponse)
async def generate_course(
    request: schemas.AIGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(f"Generating course for topic: {request.topic}")

    content = await LearningService.generate_course_content(
        topic=request.topic,
        difficulty=request.difficulty,
        duration=request.duration,
        focus_areas=request.focus_areas,
    )

    db_course = Course(
        title=content["title"],
        description=content["description"],
        category=request.topic.split()[0] if request.topic else "General",
        difficulty=request.difficulty,
        duration=request.duration,
        modules=len(content.get("modules", [])),
        instructor="AI Generated",
        carbon_impact=content.get("estimated_carbon_impact", 15.0),
        content=content,
        ai_generated=True,
        owner_id=current_user.id,
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)

    return {
        "course": db_course,
        "content": content,
        "generation_metadata": content.get("generation_metadata", {}),
    }


@app.get("/api/courses", response_model=List[schemas.CourseResponse])
def get_courses(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Course).filter(Course.is_published == True)
    if category:
        query = query.filter(Course.category == category)
    return query.offset(skip).limit(limit).all()


@app.get("/api/courses/{course_id}", response_model=schemas.CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@app.post("/api/courses/{course_id}/enroll", response_model=schemas.EnrollmentResponse)
def enroll_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = (
        db.query(Enrollment)
        .filter(
            Enrollment.user_id == current_user.id, Enrollment.course_id == course_id
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = Enrollment(
        user_id=current_user.id, course_id=course_id, last_accessed=datetime.utcnow()
    )
    course.enrolled_count += 1
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@app.get("/api/my-courses", response_model=List[schemas.EnrollmentWithCourse])
def get_my_courses(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    enrollments = (
        db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    )
    return [
        {
            "id": e.id,
            "course_id": e.course_id,
            "progress": e.progress,
            "completed": e.completed,
            "started_at": e.started_at,
            "last_accessed": e.last_accessed,
            "course": e.course,
        }
        for e in enrollments
    ]


@app.patch("/api/enrollments/{enrollment_id}/progress")
def update_progress(
    enrollment_id: int,
    progress: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.id == enrollment_id, Enrollment.user_id == current_user.id)
        .first()
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.progress = min(100, max(0, progress))
    enrollment.last_accessed = datetime.utcnow()

    if enrollment.progress >= 100 and not enrollment.completed:
        enrollment.completed = True
        enrollment.completed_at = datetime.utcnow()
        current_user.courses_completed += 1

        course = enrollment.course
        # This assumes duration like "2h" - protect against errors
        try:
            hours = float(course.duration.replace("h", "").strip())
        except Exception:
            hours = 1.0

        carbon_calc = CarbonService.calculate_carbon_footprint(hours, course.category)
        current_user.carbon_offset += carbon_calc.get("carbon_offset_kg", 0.0)
        current_user.trees_planted += carbon_calc.get("trees_equivalent", 0)

    db.commit()
    return {"message": "Progress updated", "progress": enrollment.progress}


@app.post("/api/carbon/calculate", response_model=schemas.CarbonCalculationResponse)
def calculate_carbon(request: schemas.CarbonCalculationRequest):
    return CarbonService.calculate_carbon_footprint(
        request.learning_hours, request.course_category
    )


@app.get("/api/carbon/metrics", response_model=List[schemas.CarbonMetricResponse])
def get_carbon_metrics(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(CarbonMetric)
        .filter(CarbonMetric.user_id == current_user.id)
        .order_by(CarbonMetric.year.desc(), CarbonMetric.month.desc())
        .limit(12)
        .all()
    )


@app.post("/api/trees/plant", response_model=schemas.TreePlantationResponse)
async def plant_trees(
    request: schemas.TreePlantationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = await CarbonService.plant_trees_via_api(
        user_id=current_user.id,
        trees_count=request.trees_count,
        location=request.location,
    )

    plantation = TreePlantation(
        user_id=current_user.id,
        trees_count=request.trees_count,
        location=result.get("location"),
        organization=result.get("organization"),
        api_transaction_id=result.get("transaction_id"),
        status=result.get("status"),
        carbon_equivalent=result.get("carbon_offset_kg", 0.0),
    )
    db.add(plantation)
    current_user.trees_planted += request.trees_count
    current_user.carbon_offset += result.get("carbon_offset_kg", 0.0)
    db.commit()
    db.refresh(plantation)
    return plantation


@app.get("/api/trees/projects")
async def get_reforestation_projects():
    return {"projects": await CarbonService.get_reforestation_projects()}


@app.get("/api/dashboard", response_model=schemas.UserDashboard)
def get_dashboard(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    recent_enrollments = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.last_accessed.desc())
        .limit(4)
        .all()
    )

    carbon_metrics = (
        db.query(CarbonMetric)
        .filter(CarbonMetric.user_id == current_user.id)
        .order_by(CarbonMetric.year, CarbonMetric.month)
        .limit(6)
        .all()
    )

    user_achievements = (
        db.query(UserAchievement)
        .filter(UserAchievement.user_id == current_user.id)
        .all()
    )

    return {
        "user": current_user,
        "recent_courses": [
            {
                "id": e.id,
                "course_id": e.course_id,
                "progress": e.progress,
                "completed": e.completed,
                "started_at": e.started_at,
                "last_accessed": e.last_accessed,
                "course": e.course,
            }
            for e in recent_enrollments
        ],
        "carbon_evolution": carbon_metrics,
        "achievements": [
            {
                "id": ua.achievement.id,
                "name": ua.achievement.name,
                "description": ua.achievement.description,
                "icon": ua.achievement.icon,
                "points": ua.achievement.points,
                "unlocked": ua.unlocked,
                "unlocked_at": ua.unlocked_at,
            }
            for ua in user_achievements
        ],
        "learning_stats": {
            "total_hours": current_user.total_learning_hours,
            "courses_completed": current_user.courses_completed,
            "current_streak": current_user.streak,
            "level": current_user.level,
        },
    }


@app.get("/api/stats/platform", response_model=schemas.DashboardStats)
def get_platform_stats(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return {
        "total_users": len(users),
        "total_courses": db.query(Course).count(),
        "total_carbon_offset": round(sum(u.carbon_offset for u in users), 2),
        "total_trees_planted": sum(u.trees_planted for u in users),
        "active_learners": len([u for u in users if u.total_learning_hours > 0]),
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ecolearn-api",
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
