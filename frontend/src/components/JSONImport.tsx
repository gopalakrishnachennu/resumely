import React, { useState } from 'react';
import { ResumeData } from '../types/resume';

interface JSONImportProps {
    onImport: (data: ResumeData) => void;
}

export const JSONImport: React.FC<JSONImportProps> = ({ onImport }) => {
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleImport = () => {
        setError(null);
        setSuccess(false);

        if (!jsonText.trim()) {
            setError('Please paste JSON data');
            return;
        }

        try {
            // Parse JSON
            const parsed = JSON.parse(jsonText);

            // Basic validation
            if (!parsed.personal_info || !parsed.experience || !parsed.education) {
                throw new Error('Missing required fields: personal_info, experience, or education');
            }

            // Import the data
            onImport(parsed as ResumeData);
            setSuccess(true);
            setError(null);

            // Clear after successful import
            setTimeout(() => {
                setJsonText('');
                setSuccess(false);
            }, 2000);

        } catch (e: any) {
            setError(`Invalid JSON: ${e.message}`);
        }
    };

    const handleClear = () => {
        setJsonText('');
        setError(null);
        setSuccess(false);
    };

    return (
        <div className="json-import">
            <div className="json-import-header">
                <h3>📋 Import Resume JSON</h3>
                <p className="hint">Paste the JSON output from ChatGPT here</p>
            </div>

            <textarea
                className="json-textarea"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={`Paste your JSON here, for example:\n\n{\n  "personal_info": {\n    "name": "John Doe",\n    "email": "john@example.com",\n    ...\n  },\n  "experience": [...],\n  ...\n}`}
                rows={12}
            />

            <div className="json-import-actions">
                <button onClick={handleImport} className="import-btn">
                    ✅ Validate & Import
                </button>
                <button onClick={handleClear} className="clear-btn">
                    🗑️ Clear
                </button>
            </div>

            {error && (
                <div className="json-error">
                    <strong>❌ Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="json-success">
                    <strong>✅ Success!</strong> Resume data imported. You can now edit the form below.
                </div>
            )}

            <div className="json-import-help">
                <p>
                    <strong>Need help?</strong>{' '}
                    <a href="/chatgpt_prompts.md" download className="download-prompts-link">
                        📥 Download ChatGPT Prompts
                    </a>
                </p>
            </div>
        </div>
    );
};
