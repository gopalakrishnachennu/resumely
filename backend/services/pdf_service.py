import subprocess
import tempfile
import os
from pathlib import Path
from typing import Optional
import hashlib
import json


class PDFService:
    """Tectonic-based PDF compilation service with caching"""
    
    def __init__(self, cache_dir: str = ".cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        
        # Check if Tectonic is available
        self._verify_tectonic()
    
    def _verify_tectonic(self):
        """Verify Tectonic is installed and accessible"""
        try:
            result = subprocess.run(
                ["tectonic", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode != 0:
                raise RuntimeError("Tectonic is not properly installed")
        except FileNotFoundError:
            raise RuntimeError(
                "Tectonic not found. Please install it: "
                "https://tectonic-typesetting.github.io/install.html"
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError("Tectonic verification timed out")
    
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
    
    def compile_latex(self, latex_content: str, use_cache: bool = True) -> bytes:
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
                # Run Tectonic
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
