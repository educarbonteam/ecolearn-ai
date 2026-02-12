"""
SQLAlchemy models for EcoLearn AI
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar = Column(String, default="")
    level = Column(String, default="Éco-Apprenant Débutant")
    total_learning_hours = Column(Float, default=0.0)
    courses_completed = Column(Integer, default=0)
    carbon_offset = Column(Float, default=0.0)
    trees_planted = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    courses = relationship("Course", back_populates="owner")
    enrollments = relationship("Enrollment", back_populates="user")
    carbon_metrics = relationship("CarbonMetric", back_populates="user")
    achievements = relationship("UserAchievement", back_populates="user")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)
    duration = Column(String)
    difficulty = Column(String)
    modules = Column(Integer, default=0)
    instructor = Column(String)
    carbon_impact = Column(Float, default=0.0)
    content = Column(JSON)  # Generated AI content
    ai_generated = Column(Boolean, default=False)
    enrolled_count = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    progress = Column(Float, default=0.0)
    completed = Column(Boolean, default=False)
    last_accessed = Column(DateTime(timezone=True))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class CarbonMetric(Base):
    __tablename__ = "carbon_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    carbon_offset = Column(Float, default=0.0)
    trees_planted = Column(Integer, default=0)
    learning_hours = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="carbon_metrics")


class TreePlantation(Base):
    __tablename__ = "tree_plantations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trees_count = Column(Integer, nullable=False)
    location = Column(String)
    organization = Column(String)  # Reforestation API organization
    api_transaction_id = Column(String, unique=True)
    status = Column(String, default="pending")  # pending, confirmed, failed
    carbon_equivalent = Column(Float)
    planted_at = Column(DateTime(timezone=True), server_default=func.now())


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    icon = Column(String)
    criteria = Column(JSON)  # Conditions to unlock
    points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked = Column(Boolean, default=False)
    unlocked_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
