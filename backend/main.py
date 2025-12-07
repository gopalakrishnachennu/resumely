from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import ValidationError
import os
from dotenv import load_dotenv
import base64

from schemas import (
    ResumeData, 
    LinkedInParseRequest, 
    JobMatchRequest, 
    GeneratePDFRequest
)
from services.ai_service import AIService
from services.template_service import TemplateService
from services.pdf_service import PDFService

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Resume Generator API",
    description="Hybrid LaTeX resume generator with AI-powered content optimization",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
template_service = TemplateService()
pdf_service = PDFService()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Resume Generator API",
        "version": "1.0.0"
    }


@app.get("/api/templates")
async def list_templates():
    """Get list of available resume templates"""
    try:
        templates = template_service.get_available_templates()
        return {
            "templates": templates,
            "count": len(templates)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/validate-json")
async def validate_json(data: dict):
    """
    Validate user-provided JSON matches ResumeData schema
    Used for Manual Mode - no AI call, just validation
    
    Returns: Validation result with errors if any
    """
    try:
        # Validate against Pydantic schema
        resume_data = ResumeData(**data)
        
        return {
            "valid": True,
            "message": "✅ JSON is valid and ready to use!",
            "data": resume_data.model_dump()
        }
        
    except ValidationError as e:
        return {
            "valid": False,
            "message": "❌ JSON validation failed",
            "errors": [
                {
                    "field": ".".join(str(loc) for loc in err["loc"]),
                    "message": err["msg"],
                    "type": err["type"]
                }
                for err in e.errors()
            ]
        }
    except Exception as e:
        return {
            "valid": False,
            "message": f"❌ Unexpected error: {str(e)}",
            "errors": []
        }


@app.post("/api/parse-linkedin")
async def parse_linkedin(file: UploadFile = File(...)):
    """
    Extract structured resume data from LinkedIn PDF
    AUTO MODE ONLY - Uses OpenAI API (costs money)
    
    Returns: ResumeData JSON
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Read and encode file
        content = await file.read()
        base64_content = base64.b64encode(content).decode('utf-8')
        
        # Parse with AI
        request = LinkedInParseRequest(file_content=base64_content)
        resume_data = await ai_service.parse_linkedin_pdf(request)
        
        return resume_data
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse LinkedIn PDF: {str(e)}")


@app.post("/api/match-job")
async def match_job(request: JobMatchRequest):
    """
    Optimize resume bullets to match job description
    AUTO MODE ONLY - Uses OpenAI API (costs money)
    
    Returns: Optimized ResumeData JSON
    """
    try:
        optimized_resume = await ai_service.match_to_job(request)
        return optimized_resume
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to optimize resume: {str(e)}")


@app.post("/api/generate-pdf")
async def generate_pdf(resume_data: ResumeData, template: str = "professional"):
    """
    Generate PDF from resume data using freeform template
    
    Args:
        resume_data: Resume data in freeform structure
        template: Template name (ignored, always uses freeform)
    
    Returns:
        PDF file as binary stream
    """
    try:
        # Render LaTeX
        latex_content, render_context = template_service.render_resume(
            resume_data, template, return_context=True
        )
        
        # Generate PDF (uses Tectonic when available, falls back to FPDF offline)
        pdf_bytes = pdf_service.compile_resume(latex_content, render_context)
        
        # Return as streaming response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=resume.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preview-latex")
async def preview_latex(request: GeneratePDFRequest):
    """
    Preview rendered LaTeX without compiling to PDF (for debugging)
    
    Returns: Rendered LaTeX as text
    """
    try:
        latex_content = template_service.render_resume(
            request.resume_data,
            request.template
        )
        return {"latex": latex_content}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
