"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    avatar: str
    level: str
    total_learning_hours: float
    courses_completed: int
    carbon_offset: float
    trees_planted: int
    streak: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Course Schemas
class CourseBase(BaseModel):
    title: str
    category: str
    difficulty: Optional[str] = "Débutant"
    description: Optional[str] = None


class CourseCreate(CourseBase):
    duration: Optional[str] = None
    modules: Optional[int] = 0
    instructor: Optional[str] = None


class CourseResponse(CourseBase):
    id: int
    duration: str
    modules: int
    instructor: Optional[str]
    carbon_impact: float
    enrolled_count: int
    rating: float
    ai_generated: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Enrollment Schemas
class EnrollmentCreate(BaseModel):
    course_id: int


class EnrollmentResponse(BaseModel):
    id: int
    course_id: int
    progress: float
    completed: bool
    started_at: datetime
    last_accessed: Optional[datetime]
    
    class Config:
        from_attributes = True


class EnrollmentWithCourse(EnrollmentResponse):
    course: CourseResponse


# AI Course Generation
class AIGenerateRequest(BaseModel):
    topic: str
    difficulty: str = Field(default="Débutant", pattern="^(Débutant|Intermédiaire|Avancé)$")
    duration: str = Field(default="4h", description="Durée souhaitée")
    focus_areas: Optional[List[str]] = None


class AIGenerateResponse(BaseModel):
    course: CourseResponse
    content: Dict[str, Any]
    generation_metadata: Dict[str, Any]


# Carbon Metrics
class CarbonMetricResponse(BaseModel):
    id: int
    month: str
    year: int
    carbon_offset: float
    trees_planted: int
    learning_hours: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class CarbonCalculationRequest(BaseModel):
    learning_hours: float
    course_category: str


class CarbonCalculationResponse(BaseModel):
    carbon_offset: float
    trees_equivalent: int
    calculation_method: str


# Tree Plantation
class TreePlantationRequest(BaseModel):
    trees_count: int = Field(gt=0, le=100)
    location: Optional[str] = None


class TreePlantationResponse(BaseModel):
    id: int
    trees_count: int
    location: Optional[str]
    organization: str
    status: str
    carbon_equivalent: float
    planted_at: datetime
    
    class Config:
        from_attributes = True


# Achievement Schemas
class AchievementResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    points: int
    unlocked: bool
    unlocked_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Stats & Dashboard
class DashboardStats(BaseModel):
    total_users: int
    total_courses: int
    total_carbon_offset: float
    total_trees_planted: int
    active_learners: int


class UserDashboard(BaseModel):
    user: UserResponse
    recent_courses: List[EnrollmentWithCourse]
    carbon_evolution: List[CarbonMetricResponse]
    achievements: List[AchievementResponse]
    learning_stats: Dict[str, Any]


# Generic Response
class MessageResponse(BaseModel):
    message: str
    success: bool = True
