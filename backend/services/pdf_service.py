import subprocess
import tempfile
import os
from pathlib import Path
from typing import Optional, Any
import hashlib
import json


class PDFService:
    """Tectonic-based PDF compilation service with caching"""
    
    def __init__(self, cache_dir: str = ".cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Check if Tectonic is available
        self.tectonic_available = self._verify_tectonic()
    
    def _verify_tectonic(self) -> bool:
        """Verify Tectonic is installed and accessible"""
        try:
            result = subprocess.run(
                ["tectonic", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                return False
        except FileNotFoundError:
            return False
        except subprocess.TimeoutExpired:
            return False
        return True
    
    def _get_cache_key(self, latex_content: str) -> str:
        """Generate cache key from LaTeX content"""
        return hashlib.sha256(latex_content.encode()).hexdigest()
    
    def _get_cached_pdf(self, cache_key: str) -> Optional[bytes]:
        """Retrieve cached PDF if available"""
        cache_file = self.cache_dir / f"{cache_key}.pdf"
        if cache_file.exists():
            return cache_file.read_bytes()
        return None
    
    def _cache_pdf(self, cache_key: str, pdf_content: bytes):
        """Store PDF in cache"""
        cache_file = self.cache_dir / f"{cache_key}.pdf"
        cache_file.write_bytes(pdf_content)
    
    def compile_latex(self, latex_content: str, *, use_cache: bool = True) -> bytes:
        """
        Compile LaTeX to PDF using Tectonic
        
        Args:
            latex_content: Rendered LaTeX string
            use_cache: Whether to use cached PDF if available
        
        Returns:
            PDF file as bytes
        
        Raises:
            RuntimeError: If compilation fails
        """
        if not self.tectonic_available:
            raise RuntimeError("Tectonic is not available on this system.")

        # Check cache first
        if use_cache:
            cache_key = self._get_cache_key(latex_content)
            cached_pdf = self._get_cached_pdf(cache_key)
            if cached_pdf:
                return cached_pdf
        
        # Create temporary directory for compilation
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)
            tex_file = tmpdir_path / "resume.tex"
            pdf_file = tmpdir_path / "resume.pdf"
            
            # Write LaTeX content to file
            tex_file.write_text(latex_content, encoding='utf-8')
            
            try:
                # Run Tectonic with timeout
                result = subprocess.run(
                    [
                        "tectonic",
                        "-X", "compile",
                        str(tex_file),
                        "--outdir", str(tmpdir_path),
                        "--keep-logs",
                        "--keep-intermediates"
                    ],
                    capture_output=True,
                    text=True,
                    timeout=30,
                    cwd=tmpdir_path
                )
                
                if result.returncode != 0:
                    error_msg = self._parse_latex_error(result.stderr)
                    raise RuntimeError(f"LaTeX compilation failed: {error_msg}")
                
                # Read generated PDF
                if not pdf_file.exists():
                    raise RuntimeError("PDF file was not generated")
                
                pdf_content = pdf_file.read_bytes()
                
                # Cache the result
                if use_cache:
                    self._cache_pdf(cache_key, pdf_content)
                
                return pdf_content
                
            except subprocess.TimeoutExpired:
                raise RuntimeError("LaTeX compilation timed out (>30s)")
            except Exception as e:
                raise RuntimeError(f"Compilation error: {str(e)}")
    
    def compile_resume(self, latex_content: str, render_context: Optional[dict[str, Any]] = None, *, use_cache: bool = True) -> bytes:
        """
        Compile resume. Prefer Tectonic; fall back to a lightweight FPDF renderer
        if Tectonic fails (e.g., no network bundle).
        """
        try:
            return self.compile_latex(latex_content, use_cache=use_cache)
        except Exception as latex_error:
            if not render_context:
                raise
            # Fallback to FPDF so users still get a PDF preview offline.
            try:
                safe_context = self._sanitize_context(render_context)
                return self._compile_fpdf(safe_context)
            except Exception as fallback_error:
                # Surface the original LaTeX error for transparency.
                raise RuntimeError(
                    f"LaTeX compilation failed ({latex_error}); fallback renderer also failed: {fallback_error}"
                )
    
    def _parse_latex_error(self, stderr: str) -> str:
        """Extract meaningful error message from LaTeX output"""
        # Tectonic provides cleaner error messages than traditional LaTeX
        lines = stderr.split('\n')
        
        # Look for error indicators
        error_lines = []
        for line in lines:
            if 'error' in line.lower() or 'failed' in line.lower():
                error_lines.append(line.strip())
        
        if error_lines:
            return '\n'.join(error_lines[:3])  # Return first 3 error lines
        
        return stderr[:500]  # Fallback: return first 500 chars
    
    def clear_cache(self):
        """Clear all cached PDFs"""
        for cache_file in self.cache_dir.glob("*.pdf"):
            cache_file.unlink()

    def _compile_fpdf(self, render_context: dict[str, Any]) -> bytes:
        """Simple offline PDF renderer using fpdf2 as a fallback."""
        try:
            from fpdf import FPDF
        except ImportError as e:
            raise RuntimeError("fpdf2 is not installed. Run `pip install fpdf2`.") from e

        info = render_context.get("personal_info", {}) or {}
        sections = render_context.get("normalized_sections", []) or []

        pdf = FPDF(format="A4")
        pdf.set_margins(15, 15, 15)
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Header
        pdf.set_font("Helvetica", "B", 18)
        pdf.cell(0, 10, info.get("name", ""))
        pdf.ln(8)

        pdf.set_font("Helvetica", "", 11)
        contact_parts = [
            info.get("location", ""),
            info.get("phone", ""),
            info.get("email", ""),
            info.get("linkedin", ""),
            info.get("github", ""),
        ]
        contact_line = "  |  ".join([p for p in contact_parts if p])
        pdf.set_text_color(90, 90, 90)
        if contact_line:
            pdf.multi_cell(0, 6, contact_line)
            pdf.ln(2)
        pdf.set_text_color(0, 0, 0)

        # Sections
        for section in sections:
            title = section.get("title", "Untitled")
            blocks = section.get("blocks", [])

            pdf.set_font("Helvetica", "B", 13)
            pdf.cell(0, 8, title)
            pdf.ln(6)

            pdf.set_font("Helvetica", "", 11)
            for block in blocks:
                if block.get("type") == "list":
                    for item in block.get("entries", []):
                        item_str = str(item or "")
                        # Draw a small filled circle as bullet, avoid encoding issues
                        x = pdf.get_x()
                        y = pdf.get_y()
                        pdf.set_fill_color(0, 0, 0)
                        pdf.circle(x + 2.5, y + 3, 1.2, style="F")
                        pdf.set_x(x + 8)
                        pdf.multi_cell(0, 6, item_str)
                    pdf.ln(2)
                else:
                    text = str(block.get("text", "") or "")
                    if text:
                        pdf.set_x(pdf.l_margin)
                        pdf.multi_cell(0, 6, text)
                # Add small spacing between blocks
            pdf.ln(4)

        pdf_bytes = pdf.output(dest="S")
        # fpdf2 returns a bytearray for dest="S"
        return bytes(pdf_bytes)

    def _sanitize_text(self, text: Any) -> str:
        """Make text safe for fpdf2's Latin-1 Helvetica font."""
        if text is None:
            return ""
        s = str(text)

        # Inline helpers: strip simple markup and keep line breaks
        s = s.replace("[br]", "\n")
        s = s.replace("[space]", "\n\n")
        # Remove bold/italic markers for plain rendering; fallback uses a single font
        import re
        s = re.sub(r"\*\*(.+?)\*\*", r"\1", s)
        s = re.sub(r"__(.+?)__", r"\1", s)

        replacements = {
            "\u2022": "",   # bullet (we draw bullets ourselves)
            "\u2023": "",
            "\u2043": "",
            "\u2219": "",
            "\u25e6": "",
            "\u2013": "-",  # en dash
            "\u2014": "-",  # em dash
            "\u00a0": " ",  # nbsp
            "\ufeff": "",   # BOM
            "\t": "    ",   # tabs to spaces
        }
        for bad, repl in replacements.items():
            s = s.replace(bad, repl)
        try:
            return s.encode("latin-1", "replace").decode("latin-1")
        except Exception:
            return s.encode("ascii", "replace").decode("ascii")

    def _sanitize_context(self, render_context: dict[str, Any]) -> dict[str, Any]:
        """Create a sanitized copy of the render context for the fallback renderer."""
        info = render_context.get("personal_info", {}) or {}
        safe_info = {k: self._sanitize_text(v) for k, v in info.items()}

        safe_sections = []
        for section in render_context.get("normalized_sections", []) or []:
            blocks = []
            for block in section.get("blocks", []) or []:
                if block.get("type") == "list":
                    entries = [self._sanitize_text(it) for it in block.get("entries", [])]
                    blocks.append({"type": "list", "entries": entries})
                else:
                    blocks.append({"type": "text", "text": self._sanitize_text(block.get("text", ""))})
            safe_sections.append({"title": self._sanitize_text(section.get("title", "Untitled")), "blocks": blocks})

        return {"personal_info": safe_info, "normalized_sections": safe_sections}
