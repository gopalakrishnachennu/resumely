import os
from openai import OpenAI
from typing import Optional
import PyPDF2
import io
import base64

from schemas import ResumeData, LinkedInParseRequest, JobMatchRequest
from prompts import LINKEDIN_PARSER_PROMPT, JOB_MATCHER_PROMPT, SYSTEM_ROLE


class AIService:
    """OpenAI integration using Structured Outputs for guaranteed valid JSON"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.client = OpenAI(api_key=api_key)
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
        else:
            self.client = None
            self.model = None
            print("⚠️  OpenAI API key not set - Auto Mode will not work. Manual Mode is still available.")
    
    def _extract_pdf_text(self, base64_content: str) -> str:
        """Extract text from base64-encoded PDF"""
        try:
            pdf_bytes = base64.b64decode(base64_content)
            pdf_file = io.BytesIO(pdf_bytes)
            reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract PDF text: {str(e)}")
    
    async def parse_linkedin_pdf(self, request: LinkedInParseRequest) -> ResumeData:
        """
        Extract structured resume data from LinkedIn PDF
        Uses OpenAI Structured Outputs to guarantee valid JSON
        """
        if not self.client:
            raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable or use Manual Mode.")
        
        pdf_text = self._extract_pdf_text(request.file_content)
        
        if not pdf_text:
            raise ValueError("No text extracted from PDF")
        
        # Use structured outputs to force valid JSON schema
        completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_ROLE},
                {"role": "user", "content": f"{LINKEDIN_PARSER_PROMPT}\n\nPDF Content:\n{pdf_text}"}
            ],
            response_format=ResumeData,
        )
        
        resume_data = completion.choices[0].message.parsed
        
        if not resume_data:
            raise ValueError("AI failed to parse resume data")
        
        return resume_data
    
    async def match_to_job(self, request: JobMatchRequest) -> ResumeData:
        """Optimize resume bullets to match job description"""
        if not self.client:
            raise ValueError("OpenAI API key not configured. Please set OPENAI_API_KEY environment variable or use Manual Mode.")
        
        current_resume = request.resume_data.model_dump_json(indent=2)
        job_desc = request.job_description
        
        completion = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_ROLE},
                {
                    "role": "user", 
                    "content": f"{JOB_MATCHER_PROMPT}\n\nCurrent Resume:\n{current_resume}\n\nTarget Job Description:\n{job_desc}"
                }
            ],
            response_format=ResumeData,
        )
        
        optimized_resume = completion.choices[0].message.parsed
        
        if not optimized_resume:
            raise ValueError("AI failed to optimize resume")
        
        return optimized_resume
