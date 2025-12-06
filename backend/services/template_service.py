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
    
    def render_resume(self, resume_data: ResumeData, template_name: str = "professional", return_context: bool = False):
        """
        Render resume data into LaTeX using freeform template
        
        Args:
            resume_data: Validated resume data from Pydantic model
            template_name: Name of template file (ignored, always uses freeform)
            return_context: When True, also return the render context (normalized sections)
        
        Returns:
            Rendered LaTeX string ready for compilation, optionally with context
        """
        # Always use freeform template now
        try:
            template = self.env.get_template('freeform.tex')
        except TemplateNotFound:
            available = self.get_available_templates()
            raise ValueError(
                f"Freeform template not found. "
                f"Available templates: {', '.join(available)}"
            )
        
        # Convert Pydantic model to dict for Jinja2
        context = resume_data.model_dump()

        # Normalize sections so LaTeX can render bullets/paragraphs cleanly
        context["normalized_sections"] = self._normalize_sections(context.get("sections", []))
        
        # Render template
        rendered_latex = template.render(**context)
        
        if return_context:
            return rendered_latex, context
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

    def _normalize_sections(self, sections: list[dict]) -> list[dict]:
        """
        Convert freeform sections into ordered blocks of paragraphs or lists.
        This preserves user-entered order while structuring bullets for LaTeX.
        """
        bullet_markers = ('•', '-', '*')
        normalized = []

        for section in sections:
            title = section.get("title", "").strip() or "Untitled"
            content = section.get("content") or []

            blocks = []
            current_list = None

            for raw_line in content:
                line = raw_line.rstrip("\n")
                stripped = line.strip()

                # Blank lines break list blocks and are otherwise ignored
                if not stripped:
                    current_list = None
                    continue

                is_numbered = False
                bullet_text = None

                # Detect numbered list like "1. item"
                if stripped[0].isdigit():
                    parts = stripped.split('.', 1)
                    if len(parts) == 2 and parts[0].isdigit():
                        is_numbered = True
                        bullet_text = parts[1].strip()

                # Detect bullet markers
                if bullet_text is None and stripped.startswith(bullet_markers):
                    bullet_text = stripped.lstrip('•-*').strip()

                if bullet_text is not None or is_numbered:
                    if current_list is None:
                        current_list = {"type": "list", "entries": []}
                        blocks.append(current_list)
                    current_list["entries"].append(self._format_inline_latex(bullet_text or stripped))
                else:
                    blocks.append({"type": "text", "text": self._format_inline_latex(line)})
                    current_list = None

            normalized.append({"title": title, "blocks": blocks})

        return normalized

    def _format_inline_latex(self, text: str) -> str:
        """
        Apply lightweight inline formatting for LaTeX output:
        - **bold** -> \\textbf{}
        - __italic__ -> \\textit{}
        - [br] -> line break
        - [space] -> vertical space
        """
        if not text:
            return ""

        # Escape LaTeX special chars minimally
        replacements = {
            "&": r"\&",
            "%": r"\%",
            "$": r"\$",
            "#": r"\#",
            "_": r"\_",
            "{": r"\{",
            "}": r"\}",
            "~": r"\textasciitilde{}",
            "^": r"\textasciicircum{}",
            "\\": r"\textbackslash{}",
        }
        for bad, repl in replacements.items():
            text = text.replace(bad, repl)

        # Inline formatting
        def repl_bold(match):
            return r"\textbf{" + match.group(1) + "}"

        def repl_italic(match):
            return r"\textit{" + match.group(1) + "}"

        import re

        text = re.sub(r"\*\*(.+?)\*\*", repl_bold, text)
        text = re.sub(r"__(.+?)__", repl_italic, text)
        text = text.replace("[br]", r"\\")
        text = text.replace("[space]", r"\vspace{6pt}\\")

        return text
