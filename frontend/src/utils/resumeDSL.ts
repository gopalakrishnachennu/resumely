import { PersonalInfo, ResumeData, Section } from '../types/resume';

/**
 * Lightweight DSL parser/serializer for the resume editor.
 *
 * Rules:
 * - Header lines start with @TAG and set personal info (NAME/EMAIL/PHONE/LINKEDIN/GITHUB/LOCATION).
 * - @JOB tag creates a formatted job entry with left/right alignment
 *   Format: @JOB Company Name | Job Title | Start Date - End Date | Location
 * - Any other @Title line starts a new freeform section with that exact title.
 * - All following lines (including bullets, numbers, blanks) belong to the current section until the next @ line.
 * - Formatting is preserved by storing each line verbatim in the section content array.
 */

const HEADER_TAGS: Record<string, keyof PersonalInfo> = {
    NAME: 'name',
    EMAIL: 'email',
    PHONE: 'phone',
    LINKEDIN: 'linkedin',
    GITHUB: 'github',
    LOCATION: 'location'
};

const HEADER_ORDER: (keyof typeof HEADER_TAGS)[] = ['NAME', 'EMAIL', 'PHONE', 'LINKEDIN', 'GITHUB', 'LOCATION'];

function createEmptyPersonalInfo(): PersonalInfo {
    return {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        location: ''
    };
}

/**
 * Parse the custom resume DSL into ResumeData.
 */
export function parseResumeDSL(input: string): ResumeData {
    const lines = input.split(/\r?\n/);
    const personal_info: PersonalInfo = createEmptyPersonalInfo();
    const sections: Section[] = [];

    let currentSection: Section | null = null;

    for (const rawLine of lines) {
        const trimmed = rawLine.trim();

        // Section or header
        if (trimmed.startsWith('@')) {
            const token = trimmed.slice(1).trim(); // remove leading '@'
            if (!token) {
                currentSection = null;
                continue;
            }

            const [tag, ...restParts] = token.split(/\s+/);
            const rest = restParts.join(' ').trim();
            const cleanTag = tag.replace(/:$/, '').toUpperCase();

            // Known header tag -> set personal info
            if (cleanTag in HEADER_TAGS) {
                const field = HEADER_TAGS[cleanTag];
                (personal_info as any)[field] = rest;
                currentSection = null; // headers reset section context
                continue;
            }

            // @JOB tag - special formatting for job entries
            if (cleanTag === 'JOB') {
                if (!currentSection) {
                    currentSection = { title: 'Experience', content: [] };
                    sections.push(currentSection);
                }

                // Parse: @JOB Company | Title | Dates | Location
                const parts = rest.split('|').map(p => p.trim());
                if (parts.length >= 4) {
                    const [company, title, dates, location] = parts;
                    // Add special marker for job entry
                    currentSection.content.push(`@JOBENTRY|${company}|${title}|${dates}|${location}`);
                }
                continue;
            }

            // Otherwise it's a new section
            const title = token.replace(/:$/, '');
            currentSection = { title, content: [] };
            sections.push(currentSection);
            continue;
        }

        // Preserve blank lines inside a section
        if (currentSection) {
            currentSection.content.push(rawLine);
        }
    }

    return { personal_info, sections };
}

/**
 * Serialize ResumeData back into the DSL text.
 */
export function resumeToDSL(data: ResumeData): string {
    const lines: string[] = [];

    // Headers in a fixed order
    HEADER_ORDER.forEach((tag) => {
        const field = HEADER_TAGS[tag];
        const value = (data.personal_info as any)?.[field];
        if (value) {
            lines.push(`@${tag} ${value}`);
        }
    });

    if (lines.length > 0) {
        lines.push(''); // spacer between headers and sections
    }

    // Sections remain fully freeform
    data.sections.forEach((section, idx) => {
        lines.push(`@${section.title}`);
        section.content.forEach((line) => lines.push(line));
        if (idx !== data.sections.length - 1) {
            lines.push(''); // spacer between sections
        }
    });

    return lines.join('\n');
}
