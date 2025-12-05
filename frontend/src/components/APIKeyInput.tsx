import React, { useState } from 'react';

interface APIKeyInputProps {
    onKeySubmit: (apiKey: string) => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({ onKeySubmit }) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onKeySubmit(apiKey.trim());
        }
    };

    return (
        <div className="api-key-input">
            <div className="api-key-header">
                <h3>🔑 OpenAI API Key Required</h3>
                <p className="hint">Enter your OpenAI API key to use Auto Mode</p>
            </div>

            <form onSubmit={handleSubmit} className="api-key-form">
                <div className="input-group">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="api-key-field"
                    />
                    <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="toggle-visibility"
                    >
                        {showKey ? '🙈' : '👁️'}
                    </button>
                </div>

                <button type="submit" className="submit-key-btn" disabled={!apiKey.trim()}>
                    Save API Key
                </button>

                <div className="api-key-help">
                    <p>
                        <strong>Don't have an API key?</strong>{' '}
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                            Get one from OpenAI →
                        </a>
                    </p>
                    <p className="security-note">
                        🔒 Your API key is stored locally in your browser and never sent to our servers.
                    </p>
                </div>
            </form>
        </div>
    );
};
