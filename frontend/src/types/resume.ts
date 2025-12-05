// Type definitions matching backend schemas

export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    location?: string;
}

export interface ExperienceItem {
    company: string;
    role: string;
    duration: string;
    location?: string;
    bullets: string[];
}

export interface EducationItem {
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
    honors?: string[];
}

export interface ProjectItem {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
}

export interface ResumeData {
    personal_info: PersonalInfo;
    summary?: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    skills: Record<string, string[]> | string[]; // Both formats supported
    projects?: ProjectItem[];
    certifications?: string[];
}
