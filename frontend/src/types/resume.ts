// Type definitions matching backend schemas

export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    location?: string;
}

export interface Section {
    title: string;
    content: string[];
}

export interface ResumeData {
    personal_info: PersonalInfo;
    sections: Section[];
}
