import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker - use file from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFPreviewProps {
    pdfBlob: Blob | null;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ pdfBlob }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pdfBlob) {
            console.log('PDF Blob received:', pdfBlob.size, 'bytes, type:', pdfBlob.type);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setError(null);
            return () => URL.revokeObjectURL(url);
        } else {
            setPdfUrl(null);
            setNumPages(0);
        }
    }, [pdfBlob]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        console.log('PDF loaded successfully:', numPages, 'pages');
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF load error:', error);
        setError(`Failed to load PDF: ${error.message}`);
        setLoading(false);
    };

    const onDocumentLoadStart = () => {
        console.log('Starting to load PDF...');
        setLoading(true);
        setError(null);
    };

    if (!pdfUrl) {
        return (
            <div className="pdf-preview-empty">
                <p>No PDF generated yet. Fill out the form and click "Generate PDF".</p>
            </div>
        );
    }

    return (
        <div className="pdf-preview">
            <div className="pdf-controls">
                <span>{numPages} page{numPages !== 1 ? 's' : ''}</span>
                <a href={pdfUrl} download="resume.pdf" className="download-btn">
                    Download PDF
                </a>
            </div>

            {loading && <div className="pdf-loading">Loading PDF...</div>}

            {error && (
                <div className="pdf-error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="pdf-document">
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    onLoadStart={onDocumentLoadStart}
                    loading={<div>Loading PDF...</div>}
                >
                    {Array.from(new Array(numPages), (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            width={600}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};
