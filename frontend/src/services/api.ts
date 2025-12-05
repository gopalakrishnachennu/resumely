import axios from 'axios';
import { ResumeData } from '../types/resume';

const API_BASE = '/api';

export const api = {
    // Parse LinkedIn PDF
    parseLinkedIn: async (file: File): Promise<ResumeData> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_BASE}/parse-linkedin`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Match resume to job description
    matchJob: async (resumeData: ResumeData, jobDescription: string): Promise<ResumeData> => {
        const response = await axios.post(`${API_BASE}/match-job`, {
            resume_data: resumeData,
            job_description: jobDescription
        });
        return response.data;
    },

    // Generate PDF
    generatePDF: async (resumeData: ResumeData, template: string = 'professional'): Promise<Blob> => {
        const response = await axios.post(
            `${API_BASE}/generate-pdf`,
            {
                resume_data: resumeData,
                template: template
            },
            {
                responseType: 'blob'
            }
        );
        return response.data;
    },

    // Get available templates
    getTemplates: async (): Promise<string[]> => {
        const response = await axios.get(`${API_BASE}/templates`);
        return response.data.templates;
    }
};
