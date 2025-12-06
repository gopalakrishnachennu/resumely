import React, { useState } from 'react';
import './SettingsPanel.css';

interface SettingsPanelProps {
    config: any;
    onConfigChange: (newConfig: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onConfigChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const updateConfig = (path: string[], value: number | string) => {
        const newConfig = JSON.parse(JSON.stringify(config));
        let current = newConfig;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        console.log('Config updated:', path.join('.'), '=', value);
        console.log('New font:', newConfig.fonts?.main);
        onConfigChange(newConfig);
    };

    const updateAllMargins = (value: number) => {
        updateConfig(['page', 'margin', 'top'], value);
        updateConfig(['page', 'margin', 'right'], value);
        updateConfig(['page', 'margin', 'bottom'], value);
        updateConfig(['page', 'margin', 'left'], value);
    };

    return (
        <>
            {/* Settings Button - Bottom Right */}
            <button
                className="settings-toggle"
                onClick={() => setIsOpen(!isOpen)}
                title="PDF Settings"
            >
                ⚙️
            </button>

            {/* Settings Panel */}
            {isOpen && (
                <div className="settings-panel">
                    <div className="settings-header">
                        <h2>PDF Settings</h2>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="settings-content">
                        {/* Header Spacing */}
                        <div className="setting-group">
                            <h3>Header Spacing</h3>

                            <div className="setting-item">
                                <label>Name ↔ Contact Gap</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    value={config.spacing.nameContactGap || 8}
                                    onChange={(e) => updateConfig(['spacing', 'nameContactGap'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.spacing.nameContactGap || 8}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Header ↔ Content Gap</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={config.spacing.headerBottom}
                                    onChange={(e) => updateConfig(['spacing', 'headerBottom'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.spacing.headerBottom}pt</span>
                            </div>
                        </div>

                        {/* Section Spacing */}
                        <div className="setting-group">
                            <h3>Section Spacing</h3>

                            <div className="setting-item">
                                <label>Between Sections</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="30"
                                    value={config.spacing.sectionBottom}
                                    onChange={(e) => updateConfig(['spacing', 'sectionBottom'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.spacing.sectionBottom}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Between Lines</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={config.spacing.paragraphBottom}
                                    onChange={(e) => updateConfig(['spacing', 'paragraphBottom'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.spacing.paragraphBottom}pt</span>
                            </div>
                        </div>

                        {/* Page Margins */}
                        <div className="setting-group">
                            <h3>Page Margins</h3>

                            <div className="setting-item">
                                <label>Top</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="72"
                                    value={config.page.margin.top}
                                    onChange={(e) => updateConfig(['page', 'margin', 'top'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.page.margin.top}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Bottom</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="72"
                                    value={config.page.margin.bottom}
                                    onChange={(e) => updateConfig(['page', 'margin', 'bottom'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.page.margin.bottom}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Left</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="72"
                                    value={config.page.margin.left}
                                    onChange={(e) => updateConfig(['page', 'margin', 'left'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.page.margin.left}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Right</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="72"
                                    value={config.page.margin.right}
                                    onChange={(e) => updateConfig(['page', 'margin', 'right'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.page.margin.right}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>All Margins (Quick Set)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="72"
                                    value={config.page.margin.top}
                                    onChange={(e) => updateAllMargins(parseInt(e.target.value))}
                                />
                                <span className="value">{config.page.margin.top}pt</span>
                            </div>
                        </div>

                        {/* Text Size */}
                        <div className="setting-group">
                            <h3>Text Size</h3>

                            <div className="setting-item">
                                <label>Font Family</label>
                                <select
                                    className="font-dropdown"
                                    value={config.fonts?.main || 'Helvetica'}
                                    onChange={(e) => {
                                        const fontValue = e.target.value;
                                        const newConfig = JSON.parse(JSON.stringify(config));
                                        if (!newConfig.fonts) {
                                            newConfig.fonts = {};
                                        }
                                        newConfig.fonts.main = fontValue;
                                        newConfig.fonts.headerName = fontValue;
                                        console.log('Font changed to:', fontValue);
                                        onConfigChange(newConfig);
                                    }}
                                >
                                    <option value="Helvetica">Helvetica (Sans-serif - Clean)</option>
                                    <option value="Helvetica-Bold">Helvetica Bold</option>
                                    <option value="Times-Roman">Times New Roman (Serif - Traditional)</option>
                                    <option value="Times-Bold">Times Bold</option>
                                    <option value="Courier">Courier (Monospace)</option>
                                </select>
                            </div>

                            <div className="setting-item">
                                <label>Normal Text</label>
                                <input
                                    type="range"
                                    min="7"
                                    max="14"
                                    value={config.fontSize.normal}
                                    onChange={(e) => updateConfig(['fontSize', 'normal'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.fontSize.normal}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Name Size</label>
                                <input
                                    type="range"
                                    min="14"
                                    max="32"
                                    value={config.fontSize.name}
                                    onChange={(e) => updateConfig(['fontSize', 'name'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.fontSize.name}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Contact Info Size</label>
                                <input
                                    type="range"
                                    min="6"
                                    max="12"
                                    value={config.fontSize.contactInfo}
                                    onChange={(e) => updateConfig(['fontSize', 'contactInfo'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.fontSize.contactInfo}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Section Title Size</label>
                                <input
                                    type="range"
                                    min="8"
                                    max="18"
                                    value={config.fontSize.sectionTitle}
                                    onChange={(e) => updateConfig(['fontSize', 'sectionTitle'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.fontSize.sectionTitle}pt</span>
                            </div>

                            <div className="setting-item">
                                <label>Job Entry Size (Company/Title)</label>
                                <input
                                    type="range"
                                    min="7"
                                    max="14"
                                    value={config.fontSize.jobEntry || config.fontSize.normal}
                                    onChange={(e) => updateConfig(['fontSize', 'jobEntry'], parseInt(e.target.value))}
                                />
                                <span className="value">{config.fontSize.jobEntry || config.fontSize.normal}pt</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="settings-footer">
                        <button className="reset-btn" onClick={() => window.location.reload()}>
                            Reset to Defaults
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isOpen && <div className="settings-overlay" onClick={() => setIsOpen(false)} />}
        </>
    );
};
