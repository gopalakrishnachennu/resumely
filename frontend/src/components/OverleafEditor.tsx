import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types/resume';
import { api } from '../services/api';
import { PDFPreview } from './PDFPreview';
import * as yaml from 'js-yaml';
import './OverleafEditor.css';

interface OverleafEditorProps {
    initialData?: ResumeData;
}

type EditorFormat = 'json' | 'yaml';

export const OverleafEditor: React.FC<OverleafEditorProps> = ({ initialData }) => {
    const [editorContent, setEditorContent] = useState<string>('');
    const [format, setFormat] = useState<EditorFormat>('yaml'); // Default to YAML (easier)
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [template, setTemplate] = useState('professional');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoReload, setAutoReload] = useState(true);

    // Initialize with sample data
    useEffect(() => {
        const sampleData: ResumeData = initialData || {
            personal_info: {
                name: "Your Name",
                email: "your.email@example.com",
                phone: "+1 (123) 456-7890",
                linkedin: "linkedin.com/in/yourprofile",
                github: "github.com/yourusername",
                location: "City, State"
            },
            summary: "Experienced professional with expertise in...",
            experience: [],
            education: [],
            skills: {
                "Cloud Platforms": ["AWS (S3, Lambda, EC2)", "Azure", "GCP"],
                "Programming Languages & Tools": ["Python", "SQL", "JavaScript"],
                "Databases": ["PostgreSQL", "Snowflake", "MySQL"]
            },
            projects: [],
            certifications: []
        };

        // Set initial content based on format
        if (format === 'yaml') {
            setEditorContent(yaml.dump(sampleData, { indent: 2, lineWidth: -1 }));
        } else {
            setEditorContent(JSON.stringify(sampleData, null, 2));
        }
    }, [initialData]); // Only run on mount

    // Auto-generate PDF when content changes
    useEffect(() => {
        if (!autoReload || !editorContent) return;

        const timer = setTimeout(() => {
            handleGeneratePDF();
        }, 1500);

        return () => clearTimeout(timer);
    }, [editorContent, template, autoReload]);

    // Handle format toggle
    const handleFormatToggle = (newFormat: EditorFormat) => {
        try {
            // Parse current content
            const data = format === 'yaml'
                ? yaml.load(editorContent) as ResumeData
                : JSON.parse(editorContent);

            // Convert to new format
            if (newFormat === 'yaml') {
                setEditorContent(yaml.dump(data, { indent: 2, lineWidth: -1 }));
            } else {
                setEditorContent(JSON.stringify(data, null, 2));
            }
            setFormat(newFormat);
        } catch (err) {
            setError('Cannot convert: Invalid format in current editor');
        }
    };

    const handleGeneratePDF = async () => {
        try {
            setError(null);
            // Parse based on current format
            const data = format === 'yaml'
                ? yaml.load(editorContent) as ResumeData
                : JSON.parse(editorContent);

            setIsGenerating(true);
            const blob = await api.generatePDF(data, template);
            setPdfBlob(blob);
        } catch (err: any) {
            if (err instanceof yaml.YAMLException || err instanceof SyntaxError) {
                setError(`Invalid ${format.toUpperCase()} syntax`);
            } else {
                setError(err.response?.data?.detail || 'Failed to generate PDF');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume_${template}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="overleaf-container">
            {/* Top Toolbar */}
            <div className="overleaf-toolbar">
                <div className="toolbar-left">
                    <h1>📝 Resume Editor</h1>
                </div>
                <div className="toolbar-center">
                    <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        className="template-select"
                    >
                        <option value="professional">Professional</option>
                        <option value="modern">Modern</option>
                    </select>
                    <label className="auto-reload-toggle">
                        <input
                            type="checkbox"
                            checked={autoReload}
                            onChange={(e) => setAutoReload(e.target.checked)}
                        />
                        Auto-reload
                    </label>
                </div>
                <div className="toolbar-right">
                    <button
                        onClick={handleGeneratePDF}
                        className="btn-compile"
                        disabled={isGenerating}
                    >
                        {isGenerating ? '⏳ Compiling...' : '▶️ Recompile'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="btn-download"
                        disabled={!pdfBlob}
                    >
                        ⬇️ Download PDF
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    <strong>Error:</strong> {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Split Editor */}
            <div className="overleaf-split">
                {/* Left: Editor */}
                <div className="editor-pane">
                    <div className="pane-header">
                        <span>📄 Resume Data ({format.toUpperCase()})</span>
                        <div className="format-toggle">
                            <button
                                className={`format-btn ${format === 'yaml' ? 'active' : ''}`}
                                onClick={() => handleFormatToggle('yaml')}
                            >
                                YAML
                            </button>
                            <button
                                className={`format-btn ${format === 'json' ? 'active' : ''}`}
                                onClick={() => handleFormatToggle('json')}
                            >
                                JSON
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="json-editor"
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        spellCheck={false}
                        placeholder={`Enter your resume data as ${format.toUpperCase()}...`}
                    />
                </div>

                {/* Right: PDF Preview */}
                <div className="preview-pane">
                    <div className="pane-header">
                        <span>📋 PDF Preview</span>
                        {isGenerating && <span className="compiling-indicator">⏳ Compiling...</span>}
                    </div>
                    <div className="pdf-preview-container">
                        <PDFPreview pdfBlob={pdfBlob} />
                    </div>
                </div>
            </div>
        </div>
    );
};
