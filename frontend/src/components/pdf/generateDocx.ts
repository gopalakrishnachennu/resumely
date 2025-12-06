import { Document, Paragraph, TextRun, AlignmentType, convertInchesToTwip, ExternalHyperlink, BorderStyle, Packer } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '../../types/resume';
import { pdfConfig } from './config';

/**
 * Generate and download a DOCX resume
 * Uses the SAME config as PDF - respects all user settings from Settings Panel
 */
export const generateDocx = async (data: ResumeData, config = pdfConfig) => {
    const { personal_info, sections } = data;

    // Convert pt to twips (1 pt = 20 twips)
    const ptToTwip = (pt: number) => pt * 20;

    // Convert pt to half-points (for font sizes: 1 pt = 2 half-points)
    const ptToHalfPt = (pt: number) => pt * 2;

    // ATS-friendly soft black color
    const BLACK_COLOR = '1a1a1a';

    const children: any[] = [];

    // Name (centered, bold, black) - uses config.fontSize.name
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: personal_info.name,
                    size: ptToHalfPt(config.fontSize.name), // From settings
                    bold: true,
                    font: config.fonts.main, // From settings
                    color: BLACK_COLOR,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
                after: ptToTwip(config.spacing.nameContactGap), // From settings
            },
        })
    );

    // Contact Info (centered, clickable links, black) - uses config.fontSize.contactInfo
    const contactParts: (TextRun | ExternalHyperlink)[] = [];
    const contactItems = [
        { value: personal_info.email, link: `mailto:${personal_info.email}` },
        { value: personal_info.phone, link: `tel:${personal_info.phone?.replace(/[^0-9+]/g, '')}` },
        { value: personal_info.linkedin?.replace(/^https?:\/\/(www\.)?/, ''), link: personal_info.linkedin?.startsWith('http') ? personal_info.linkedin : `https://${personal_info.linkedin}` },
        { value: personal_info.github?.replace(/^https?:\/\/(www\.)?/, ''), link: personal_info.github?.startsWith('http') ? personal_info.github : `https://${personal_info.github}` },
        { value: personal_info.location, link: null },
    ].filter(item => item.value);

    contactItems.forEach((item, index) => {
        if (item.link) {
            contactParts.push(
                new ExternalHyperlink({
                    children: [
                        new TextRun({
                            text: item.value || '',
                            size: ptToHalfPt(config.fontSize.contactInfo), // From settings
                            font: config.fonts.main, // From settings
                            color: BLACK_COLOR,
                            underline: {},
                        }),
                    ],
                    link: item.link,
                })
            );
        } else {
            contactParts.push(
                new TextRun({
                    text: item.value || '',
                    size: ptToHalfPt(config.fontSize.contactInfo), // From settings
                    font: config.fonts.main, // From settings
                    color: BLACK_COLOR,
                })
            );
        }

        if (index < contactItems.length - 1) {
            contactParts.push(
                new TextRun({
                    text: ' | ',
                    size: ptToHalfPt(config.fontSize.contactInfo),
                    font: config.fonts.main,
                    color: BLACK_COLOR,
                })
            );
        }
    });

    children.push(
        new Paragraph({
            children: contactParts,
            alignment: AlignmentType.CENTER,
            spacing: {
                after: ptToTwip(config.spacing.headerBottom), // From settings
            },
        })
    );

    // Process sections
    sections.forEach((section, sectionIndex) => {
        // Section Title - uses config.fontSize.sectionTitle
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: section.title.toUpperCase(),
                        size: ptToHalfPt(config.fontSize.sectionTitle), // From settings
                        bold: true,
                        font: config.fonts.main, // From settings
                        color: BLACK_COLOR,
                    }),
                ],
                alignment: AlignmentType.LEFT,
                spacing: {
                    before: sectionIndex === 0 ? 0 : ptToTwip(config.spacing.sectionBottom), // From settings
                    after: ptToTwip(config.spacing.sectionTitleBottom), // From settings
                },
                border: {
                    bottom: {
                        color: config.colors.border.replace('#', ''), // From settings
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: config.spacing.sectionTitleBorder * 8, // From settings
                    },
                },
            })
        );

        // Section Content
        section.content.forEach((line) => {
            if (line.startsWith('@JOB')) {
                // Parse job entry
                const match = line.match(/@JOB\[([^\]]+)\]\[([^\]]+)\]\[([^\]]+)\]\[([^\]]+)\]/);
                if (match) {
                    const [, company, title, dates, location] = match;

                    // Company - uses config.fontSize.jobEntry
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: company,
                                    bold: true,
                                    size: ptToHalfPt(config.fontSize.jobEntry || config.fontSize.normal), // From settings
                                    font: config.fonts.main, // From settings
                                    color: BLACK_COLOR,
                                }),
                            ],
                            spacing: {
                                after: ptToTwip(2),
                            },
                        })
                    );

                    // Title | Dates | Location
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: title,
                                    bold: true,
                                    size: ptToHalfPt(config.fontSize.jobEntry || config.fontSize.normal), // From settings
                                    font: config.fonts.main, // From settings
                                    color: BLACK_COLOR,
                                }),
                                new TextRun({
                                    text: ` | ${dates} | ${location}`,
                                    size: ptToHalfPt(config.fontSize.jobEntry || config.fontSize.normal), // From settings
                                    font: config.fonts.main, // From settings
                                    color: BLACK_COLOR,
                                }),
                            ],
                            spacing: {
                                after: ptToTwip(config.spacing.bulletSpacing), // From settings
                            },
                        })
                    );
                }
            } else if (line.startsWith('- ')) {
                // Bullet point - uses config.fontSize.normal
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line.substring(2),
                                size: ptToHalfPt(config.fontSize.normal), // From settings
                                font: config.fonts.main, // From settings
                                color: BLACK_COLOR,
                            }),
                        ],
                        bullet: {
                            level: 0,
                        },
                        spacing: {
                            after: ptToTwip(config.spacing.bulletSpacing), // From settings
                        },
                        indent: {
                            left: ptToTwip(config.spacing.bulletIndent), // From settings
                        },
                    })
                );
            } else {
                // Regular paragraph - uses config.fontSize.normal
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                size: ptToHalfPt(config.fontSize.normal), // From settings
                                font: config.fonts.main, // From settings
                                color: BLACK_COLOR,
                            }),
                        ],
                        spacing: {
                            after: ptToTwip(config.spacing.paragraphBottom || 4), // From settings
                        },
                    })
                );
            }
        });
    });

    // Create document with margins FROM SETTINGS
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: convertInchesToTwip(config.page.margin.top / 72), // From settings
                            right: convertInchesToTwip(config.page.margin.right / 72), // From settings
                            bottom: convertInchesToTwip(config.page.margin.bottom / 72), // From settings
                            left: convertInchesToTwip(config.page.margin.left / 72), // From settings
                        },
                    },
                },
                children: children,
            },
        ],
    });

    // Generate and download using Packer
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'resume.docx');
};
