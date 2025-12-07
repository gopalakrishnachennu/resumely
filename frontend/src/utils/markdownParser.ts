import { ResumeData } from '../types/resume';
import matter from 'gray-matter';

/**
 * Convert Markdown resume format to ResumeData JSON
 */
export function parseMarkdownResume(markdown: string): ResumeData {
    // Parse frontmatter if present
    const { data, content } = matter(markdown);

    // If frontmatter exists and has all data, use it
    if (data && Object.keys(data).length > 0) {
        return data as ResumeData;
    }

    // Otherwise parse the markdown content
    const lines = content.split('\n');
    const resume: any = {
        personal_info: {},
        experience: [],
        education: [],
        skills: {},
        projects: [],
        certifications: []
    };

    let currentSection = '';
    let currentItem: any = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // H1 - Name
        if (line.startsWith('# ')) {
            resume.personal_info.name = line.substring(2).trim();
        }
        // H2 - Sections
        else if (line.startsWith('## ')) {
            currentSection = line.substring(3).trim().toLowerCase();
            currentItem = null;
        }
        // H3 - Job/Education titles
        else if (line.startsWith('### ')) {
            const title = line.substring(4).trim();

            if (currentSection === 'experience') {
                // Parse "Role @ Company" format
                const match = title.match(/(.+?)\s+@\s+(.+)/);
                if (match) {
                    currentItem = {
                        role: match[1].trim(),
                        company: match[2].trim(),
                        bullets: []
                    };
                    resume.experience.push(currentItem);
                }
            } else if (currentSection === 'education') {
                currentItem = {
                    degree: title,
                    bullets: []
                };
                resume.education.push(currentItem);
            }
        }
        // Italic line - duration/location
        else if (line.startsWith('*') && line.endsWith('*')) {
            const text = line.substring(1, line.length - 1);
            const parts = text.split('|').map((p: string) => p.trim());

            if (currentItem) {
                if (parts.length >= 1) currentItem.duration = parts[0];
                if (parts.length >= 2) currentItem.location = parts[1];
            }
        }
        // Bullet points
        else if (line.startsWith('- ')) {
            const bullet = line.substring(2).trim();
            if (currentItem && currentItem.bullets) {
                currentItem.bullets.push(bullet);
            }
        }
        // Contact info line (email, phone)
        else if (line.includes('📧') || line.includes('📱') || line.includes('@')) {
            const parts = line.split('|').map((p: string) => p.trim());
            parts.forEach((part: string) => {
                if (part.includes('@')) {
                    resume.personal_info.email = part.replace('📧', '').trim();
                } else if (part.includes('+1') || part.includes('(')) {
                    resume.personal_info.phone = part.replace('📱', '').trim();
                } else if (part.includes('linkedin')) {
                    resume.personal_info.linkedin = part.trim();
                } else if (part.includes('github')) {
                    resume.personal_info.github = part.trim();
                }
            });
        }
        // Summary section
        else if (currentSection === 'summary' && !line.startsWith('#')) {
            resume.summary = (resume.summary || '') + line + ' ';
        }
        // Skills section
        else if (currentSection === 'skills' && line.includes(':')) {
            const [category, items] = line.split(':').map(s => s.trim());
            if (category && items) {
                resume.skills[category] = items.split(',').map((s: string) => s.trim());
            }
        }
    }

    // Clean up summary
    if (resume.summary) {
        resume.summary = resume.summary.trim();
    }

    return resume as ResumeData;
}

/**
 * Convert ResumeData to Markdown format
 */
export function resumeToMarkdown(data: ResumeData): string {
    let md = '';

    // Header
    md += `# ${data.personal_info.name}\n\n`;

    // Contact info
    const contact = [];
    if (data.personal_info.email) contact.push(`📧 ${data.personal_info.email}`);
    if (data.personal_info.phone) contact.push(`📱 ${data.personal_info.phone}`);
    if (data.personal_info.location) contact.push(`📍 ${data.personal_info.location}`);
    if (contact.length > 0) md += contact.join(' | ') + '\n\n';

    if (data.personal_info.linkedin) md += `🔗 [LinkedIn](${data.personal_info.linkedin})\n`;
    if (data.personal_info.github) md += `🔗 [GitHub](${data.personal_info.github})\n`;
    if (data.personal_info.linkedin || data.personal_info.github) md += '\n';

    // Summary
    if (data.summary) {
        md += `## Summary\n\n${data.summary}\n\n`;
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
        md += `## Experience\n\n`;
        data.experience.forEach(exp => {
            md += `### ${exp.role} @ ${exp.company}\n`;
            md += `*${exp.duration}`;
            if (exp.location) md += ` | ${exp.location}`;
            md += `*\n\n`;

            exp.bullets.forEach(bullet => {
                md += `- ${bullet}\n`;
            });
            md += '\n';
        });
    }

    // Education
    if (data.education && data.education.length > 0) {
        md += `## Education\n\n`;
        data.education.forEach(edu => {
            md += `### ${edu.degree}\n`;
            md += `*${edu.institution} | ${edu.year}*\n`;
            if (edu.gpa) md += `GPA: ${edu.gpa}\n`;
            md += '\n';
        });
    }

    // Skills
    if (data.skills) {
        md += `## Skills\n\n`;
        if (Array.isArray(data.skills)) {
            md += data.skills.join(', ') + '\n\n';
        } else {
            Object.entries(data.skills).forEach(([category, items]) => {
                md += `**${category}:** ${items.join(', ')}\n\n`;
            });
        }
    }

    // Projects
    if (data.projects && data.projects.length > 0) {
        md += `## Projects\n\n`;
        data.projects.forEach(proj => {
            md += `### ${proj.name}\n`;
            md += `${proj.description}\n\n`;
            md += `**Tech:** ${proj.technologies.join(', ')}\n`;
            if (proj.link) md += `🔗 [View Project](${proj.link})\n`;
            md += '\n';
        });
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        md += `## Certifications\n\n`;
        data.certifications.forEach(cert => {
            md += `- ${cert}\n`;
        });
    }

    return md;
}
