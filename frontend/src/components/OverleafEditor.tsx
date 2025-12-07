import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types/resume';
import { PDFPreview } from './PDFPreview';
import * as yaml from 'js-yaml';
import { parseResumeDSL, resumeToDSL } from '../utils/resumeDSL';
import { SettingsPanel } from './SettingsPanel';
import { pdfConfig as initialPdfConfig } from './pdf/config';
import './OverleafEditor.css';

interface OverleafEditorProps {
    initialData?: ResumeData;
}

type Format = 'json' | 'yaml' | 'resume';

export const OverleafEditor: React.FC<OverleafEditorProps> = ({ initialData }) => {
    const [format, setFormat] = useState<Format>('resume');
    const [editorContent, setEditorContent] = useState('');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoReload, setAutoReload] = useState(true);
    const [pdfConfig, setPdfConfig] = useState(initialPdfConfig);
    const [numPages, setNumPages] = useState<number>(0);

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
            sections: [
                {
                    title: "Professional Summary",
                    content: [
                        "Experienced professional with expertise in cloud platforms, databases, and automation."
                    ]
                },
                {
                    title: "Technical Skills",
                    content: [
                        "• Cloud Platforms: AWS, Azure, GCP",
                        "• Programming: Python, SQL, JavaScript",
                        "• Databases: PostgreSQL, MySQL, Redis"
                    ]
                }
            ]
        };

        setEditorContent(resumeToDSL(sampleData));
    }, [initialData]);

    // Auto-reload on content change
    useEffect(() => {
        if (!autoReload || !editorContent) return;

        const timer = setTimeout(() => {
            handleGeneratePDF();
        }, 1500);

        return () => clearTimeout(timer);
    }, [editorContent, autoReload]);

    // Auto-reload when pdfConfig changes (for settings updates like font)
    useEffect(() => {
        if (!autoReload || !editorContent) return;

        const timer = setTimeout(() => {
            handleGeneratePDF();
        }, 150); // Short delay for config changes

        return () => clearTimeout(timer);
    }, [pdfConfig]); // Watch pdfConfig changes


    // Handle format toggle
    const handleFormatToggle = (newFormat: Format) => {
        try {
            // Parse current content
            let data: ResumeData;
            if (format === 'resume') {
                data = parseResumeDSL(editorContent);
            } else if (format === 'yaml') {
                data = yaml.load(editorContent) as ResumeData;
            } else {
                data = JSON.parse(editorContent);
            }

            // Convert to new format
            let newContent: string;
            if (newFormat === 'resume') {
                newContent = resumeToDSL(data);
            } else if (newFormat === 'yaml') {
                newContent = yaml.dump(data);
            } else {
                newContent = JSON.stringify(data, null, 2);
            }

            setFormat(newFormat);
            setEditorContent(newContent);
        } catch (err) {
            setError(`Failed to convert format: ${err}`);
        }
    };

    const handleGeneratePDF = async () => {
        setError(null);
        setIsGenerating(true);

        try {
            let parsedData: ResumeData;

            // Parse based on current format
            if (format === 'resume') {
                parsedData = parseResumeDSL(editorContent);
            } else if (format === 'yaml') {
                parsedData = yaml.load(editorContent) as ResumeData;
            } else {
                parsedData = JSON.parse(editorContent);
            }

            // Generate PDF using React-PDF (client-side) with current config
            const { pdf } = await import('@react-pdf/renderer');
            const { ResumePDF } = await import('./pdf/ResumePDF');

            // Add key to force re-render when font changes
            const blob = await pdf(
                <ResumePDF
                    data={parsedData}
                    config={pdfConfig}
                    key={`${pdfConfig.fonts.main}-${Date.now()}`}
                />
            ).toBlob();
            setPdfBlob(blob);

            console.log('PDF generated successfully:', blob.size, 'bytes');
        } catch (err: any) {
            console.error('PDF generation error:', err);
            setError(err.message || 'Failed to generate PDF');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!pdfBlob) return;

        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume.pdf`;
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
                        <span>📄 Resume Data ({format === 'resume' ? 'CUSTOM' : format.toUpperCase()})</span>
                        <div className="format-toggle">
                            <button
                                className={`format-btn ${format === 'resume' ? 'active' : ''}`}
                                onClick={() => handleFormatToggle('resume')}
                            >
                                Resume
                            </button>
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
                        {/* Page Counter Badge */}
                        {pdfBlob && (
                            <div className="page-counter-badge">
                                2 pages
                            </div>
                        )}
                        <PDFPreview pdfBlob={pdfBlob} />
                    </div>
                </div>
            </div>

            {/* Settings Panel */}
            <SettingsPanel
                config={pdfConfig}
                onConfigChange={(newConfig) => {
                    setPdfConfig(newConfig);
                    // PDF will regenerate automatically via useEffect
                }}
            />
        </div>
    );
};
