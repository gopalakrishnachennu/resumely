from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import os
from pathlib import Path
from schemas import ResumeData


class TemplateService:
    """Jinja2 rendering engine for LaTeX templates"""
    
    def __init__(self, templates_dir: str = "templates"):
        self.templates_dir = Path(templates_dir)
        
        if not self.templates_dir.exists():
            raise ValueError(f"Templates directory not found: {templates_dir}")
        
        # Configure Jinja2 with standard delimiters
        # LaTeX content will be escaped properly
        self.env = Environment(
            loader=FileSystemLoader(self.templates_dir),
            trim_blocks=True,
            lstrip_blocks=True,
            autoescape=False,
        )
    
    def get_available_templates(self) -> list[str]:
        """List all available template names"""
        templates = []
        for file in self.templates_dir.glob("*.tex"):
            templates.append(file.stem)
        return templates
    
    def render_resume(self, resume_data: ResumeData, template_name: str = "professional") -> str:
        """
        Render resume data into LaTeX using specified template
        
        Args:
            resume_data: Validated resume data from Pydantic model
            template_name: Name of template file (without .tex extension)
        
        Returns:
            Rendered LaTeX string ready for compilation
        """
        template_file = f"{template_name}.tex"
        
        try:
            template = self.env.get_template(template_file)
        except TemplateNotFound:
            available = self.get_available_templates()
            raise ValueError(
                f"Template '{template_name}' not found. "
                f"Available templates: {', '.join(available)}"
            )
        
        # Convert Pydantic model to dict for Jinja2
        context = resume_data.model_dump()
        
        # Render template
        rendered_latex = template.render(**context)
        
        return rendered_latex
    
    def validate_template(self, template_name: str) -> bool:
        """Check if template exists and is valid"""
        template_file = f"{template_name}.tex"
        template_path = self.templates_dir / template_file
        
        if not template_path.exists():
            return False
        
        # Basic validation: check if file contains document structure
        content = template_path.read_text()
        required_elements = [
            r'\documentclass',
            r'\begin{document}',
            r'\end{document}'
        ]
        
        return all(elem in content for elem in required_elements)
