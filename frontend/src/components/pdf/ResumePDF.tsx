import React from 'react';
import { Document, Page, Text, View, Link } from '@react-pdf/renderer';
import { ResumeData } from '../../types/resume';
import { StyleSheet } from '@react-pdf/renderer';
import { pdfConfig as defaultConfig } from './config';

interface ResumePDFProps {
    data: ResumeData;
    config?: any; // PDF configuration
}

/**
 * Process escape sequences in text
 * \n becomes newline
 * \t becomes tab (4 spaces)
 */
const processEscapeSequences = (text: string): string => {
    return text
        .replace(/\\n/g, '\n')  // Replace \n with actual newline
        .replace(/\\t/g, '    '); // Replace \t with 4 spaces (tab)
};

/**
 * Parse a line and return array of text segments with formatting
 * **bold** becomes bold
 * @LINK[text](url) becomes a clickable italic link
 * \n becomes newline
 * \t becomes tab space
 */
const parseLineWithFormatting = (line: string) => {
    // First process escape sequences
    const processedLine = processEscapeSequences(line);

    const segments: Array<{ text: string; bold: boolean; link?: string; italic?: boolean }> = [];
    let currentText = '';
    let i = 0;

    while (i < processedLine.length) {
        // Check for @LINK[text](url)
        if (processedLine.substring(i, i + 5) === '@LINK') {
            // Save current text
            if (currentText) {
                segments.push({ text: currentText, bold: false });
                currentText = '';
            }

            i += 5; // Skip '@LINK'

            // Find [text]
            if (processedLine[i] === '[') {
                i++; // Skip '['
                let linkText = '';
                while (i < processedLine.length && processedLine[i] !== ']') {
                    linkText += processedLine[i];
                    i++;
                }
                i++; // Skip ']'

                // Find (url)
                if (processedLine[i] === '(') {
                    i++; // Skip '('
                    let url = '';
                    while (i < processedLine.length && processedLine[i] !== ')') {
                        url += processedLine[i];
                        i++;
                    }
                    i++; // Skip ')'

                    if (linkText && url) {
                        segments.push({ text: linkText, bold: false, link: url, italic: true });
                    }
                }
            }
            continue;
        }

        // Check for **bold**
        if (processedLine[i] === '*' && processedLine[i + 1] === '*') {
            // Save current text
            if (currentText) {
                segments.push({ text: currentText, bold: false });
                currentText = '';
            }

            // Find closing **
            i += 2;
            let boldText = '';
            while (i < processedLine.length && !(processedLine[i] === '*' && processedLine[i + 1] === '*')) {
                boldText += processedLine[i];
                i++;
            }

            if (boldText) {
                segments.push({ text: boldText, bold: true });
            }

            // Skip closing **
            i += 2;
        } else {
            currentText += processedLine[i];
            i++;
        }
    }

    // Add remaining text
    if (currentText) {
        segments.push({ text: currentText, bold: false });
    }

    return segments;
};

export const ResumePDF: React.FC<ResumePDFProps> = ({ data, config: userConfig }) => {
    const { personal_info, sections } = data;

    // Use provided config or default
    const config = userConfig || defaultConfig;

    // Debug: Log the font being used
    console.log('PDF Rendering with font:', config.fonts.main);

    // Create dynamic styles based on config
    const styles = StyleSheet.create({
        page: {
            padding: `${config.page.margin.top}pt ${config.page.margin.right}pt ${config.page.margin.bottom}pt ${config.page.margin.left}pt`,
            fontSize: config.fontSize.normal,
            fontFamily: config.fonts.main,  // Apply font to entire page
            lineHeight: config.lineHeight.normal,
            color: config.colors.primary,
        },
        header: {
            marginBottom: config.spacing.headerBottom,
            textAlign: 'center',
        },
        name: {
            fontSize: config.fontSize.name,
            fontWeight: 'bold',
            marginBottom: config.spacing.nameContactGap || 8,  // Use config value
            textAlign: 'center',
            fontFamily: config.fonts.main,  // Apply font to name
        },
        contactInfo: {
            fontSize: config.fontSize.contactInfo,
            color: '#000000',  // Black color for contact info
            marginBottom: 0,
            textAlign: 'center',
            lineHeight: config.spacing.contactLineHeight || 1.5,  // Use config value
            fontFamily: config.fonts.main,  // Apply font to contact
        },
        section: {
            marginBottom: config.spacing.sectionBottom,
            wrap: false, // Try to keep section on same page
        },
        sectionTitle: {
            fontSize: config.fontSize.sectionTitle,
            fontWeight: 'bold',
            marginBottom: config.spacing.sectionTitleBottom,
            paddingBottom: 4,
            borderBottom: `${config.spacing.sectionTitleBorder}pt solid ${config.colors.border}`,
            textTransform: 'uppercase',
            fontFamily: config.fonts.main,  // Apply font to section titles
        },
        paragraph: {
            marginBottom: config.spacing.paragraphBottom,
            lineHeight: config.lineHeight.normal,
            fontFamily: config.fonts.main,  // Apply font to paragraphs
        },
        // Job entry styles
        jobEntry: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 4,
            wrap: false, // Keep job header together
        },
        jobLeft: {
            flex: 1,
        },
        jobRight: {
            textAlign: 'right',
        },
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header - Centered Name with Contact Info Below */}
                <View style={styles.header}>
                    <Text style={{ ...styles.name, textAlign: 'center' }}>
                        {personal_info.name}
                    </Text>
                    <Text style={{ ...styles.contactInfo, textAlign: 'center' }}>
                        {[
                            personal_info.email,
                            personal_info.phone,
                            personal_info.linkedin,
                            personal_info.github,
                            personal_info.location,
                        ]
                            .filter(Boolean)
                            .join(' | ')}
                    </Text>
                </View>

                {/* Sections - render with formatting support */}
                {sections.map((section, idx) => (
                    <View key={idx} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        {section.content.map((line, lineIdx) => {
                            // Skip completely empty lines
                            if (!line.trim()) return null;

                            // Check for job entry marker
                            if (line.startsWith('@JOBENTRY|')) {
                                const parts = line.substring(10).split('|');
                                if (parts.length >= 4) {
                                    const [company, title, dates, location] = parts;
                                    return (
                                        <View key={lineIdx}>
                                            <View style={styles.jobEntry}>
                                                <View style={styles.jobLeft}>
                                                    <Text style={{ fontWeight: 'bold', fontSize: config.fontSize.jobEntry || config.fontSize.normal }}>{company}</Text>
                                                    <Text style={{ fontWeight: 'bold', fontSize: config.fontSize.jobEntry || config.fontSize.normal }}>{title}</Text>
                                                </View>
                                                <View style={styles.jobRight}>
                                                    <Text style={{ fontSize: config.fontSize.jobEntry || config.fontSize.normal }}>{dates}</Text>
                                                    <Text style={{ fontSize: config.fontSize.jobEntry || config.fontSize.normal }}>{location}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                }
                            }

                            // Parse line for formatting
                            const segments = parseLineWithFormatting(line);

                            return (
                                <Text key={lineIdx} style={styles.paragraph}>
                                    {segments.map((segment, segIdx) => {
                                        // If it's a link, use Link component with src
                                        if (segment.link) {
                                            return (
                                                <Link
                                                    key={segIdx}
                                                    style={{ fontStyle: 'italic', color: '#000000', textDecoration: 'none' }}
                                                    src={segment.link}
                                                >
                                                    {segment.text}
                                                </Link>
                                            );
                                        }

                                        // Regular text with optional bold
                                        return (
                                            <Text
                                                key={segIdx}
                                                style={segment.bold ? { fontWeight: 'bold' } : {}}
                                            >
                                                {segment.text}
                                            </Text>
                                        );
                                    })}
                                </Text>
                            );
                        })}
                    </View>
                ))}
            </Page>
        </Document>
    );
};
