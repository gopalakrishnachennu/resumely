from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


class PersonalInfo(BaseModel):
    """Personal information section"""
    name: str = Field(..., description="Full name")
    email: EmailStr = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    linkedin: Optional[str] = Field(None, description="LinkedIn URL")
    github: Optional[str] = Field(None, description="GitHub URL")
    location: Optional[str] = Field(None, description="City, State/Country")


class ExperienceItem(BaseModel):
    """Single work experience entry"""
    company: str = Field(..., description="Company name")
    role: str = Field(..., description="Job title/role")
    duration: str = Field(..., description="Time period (e.g., 'Jan 2020 - Present')")
    location: Optional[str] = Field(None, description="Job location")
    bullets: List[str] = Field(..., description="Achievement bullets (3-5 recommended)")


class EducationItem(BaseModel):
    """Single education entry"""
    institution: str = Field(..., description="University/School name")
    degree: str = Field(..., description="Degree and major")
    year: str = Field(..., description="Graduation year or time period")
    gpa: Optional[str] = Field(None, description="GPA if notable (>3.5)")
    honors: Optional[List[str]] = Field(None, description="Honors, awards, or relevant coursework")


class ProjectItem(BaseModel):
    """Single project entry"""
    name: str = Field(..., description="Project name")
    description: str = Field(..., description="Brief description")
    technologies: List[str] = Field(..., description="Technologies used")
    link: Optional[str] = Field(None, description="GitHub/demo link")


class ResumeData(BaseModel):
    """Complete resume data structure - AI must output this exact schema"""
    personal_info: PersonalInfo
    summary: Optional[str] = Field(None, description="Professional summary (2-3 sentences)")
    experience: List[ExperienceItem] = Field(default_factory=list, description="Work experience entries")
    education: List[EducationItem] = Field(default_factory=list, description="Education entries")
    skills: dict[str, List[str]] | List[str] = Field(..., description="Skills - either categorized dict or simple list")
    projects: Optional[List[ProjectItem]] = Field(None, description="Notable projects")
    certifications: Optional[List[str]] = Field(None, description="Certifications")


class LinkedInParseRequest(BaseModel):
    """Request to parse LinkedIn PDF"""
    file_content: str = Field(..., description="Base64 encoded PDF content")


class JobMatchRequest(BaseModel):
    """Request to tailor resume to job description"""
    resume_data: ResumeData
    job_description: str = Field(..., description="Target job description text")


class GeneratePDFRequest(BaseModel):
    """Request to generate PDF from resume data"""
    resume_data: ResumeData
    template: str = Field(default="professional", description="Template name (professional, modern)")
