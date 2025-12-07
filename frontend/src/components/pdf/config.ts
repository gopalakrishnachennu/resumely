/**
 * PDF Configuration File
 * 
 * Customize all spacing, margins, fonts, and sizes here.
 * All measurements are in points (pt). 1 inch = 72 points.
 */

export const pdfConfig = {
    // ==================== PAGE SETTINGS ====================
    page: {
        size: 'A4' as const, // 'A4' | 'LETTER'
        margin: {
            top: 30,      // Top margin
            right: 30,    // Right margin
            bottom: 30,   // Bottom margin
            left: 30,     // Left margin
        },
    },

    // ==================== FONTS ====================
    fonts: {
        main: 'Helvetica',           // Main font family
        headerName: 'Helvetica-Bold', // Name font
    },

    // ==================== FONT SIZES ====================
    fontSize: {
        name: 17,              // Your name size
        contactInfo: 11,       // Email, phone, etc.
        sectionTitle: 12,      // Section headings (PROFESSIONAL SUMMARY, etc.)
        normal: 11,            // Regular text
        small: 9,              // Small text
        jobEntry: 10,          // Job company/title size
    },

    // ==================== LINE SPACING ====================
    lineHeight: {
        normal: 1.2,           // Normal text line height (1.4 = 140%)
        tight: 1.2,            // Tight spacing
        loose: 1.6,            // Loose spacing
    },

    // ==================== SECTION SPACING ====================
    spacing: {
        // Header section
        headerBottom: 12,      // Space after header
        nameContactGap: 8,     // Space between name and contact info
        contactLineHeight: 1.5, // Line height for contact info

        // Between sections
        sectionBottom: 10,     // Space between sections

        // Section title
        sectionTitleBottom: 4, // Tight spacing below titles
        sectionTitleBorder: 1, // Thin border

        // Paragraphs
        paragraphBottom: 0,    // No space between lines (ultra-tight)

        // Lists
        bulletIndent: 12,      // Minimal indent
        bulletSpacing: 1,      // Minimal bullet spacing
    },

    // ==================== COLORS ====================
    colors: {
        primary: '#000000',    // Main text color (black)
        secondary: '#555555',  // Secondary text (dark gray)
        accent: '#010101ff',     // Accent color (blue)
        border: '#333333',     // Border color
    },

    // ==================== BORDERS ====================
    borders: {
        sectionTitle: {
            width: 1,            // Border width
            color: '#333333',    // Border color
            style: 'solid' as const,
        },
    },

    // ==================== WORD SPACING ====================
    wordSpacing: {
        normal: 0,             // Normal word spacing (0 = default)
        tight: -0.5,           // Tight word spacing
        loose: 1,              // Loose word spacing
    },

    // ==================== LETTER SPACING ====================
    letterSpacing: {
        normal: 0,             // Normal letter spacing
        tight: -0.3,           // Tight letter spacing
        loose: 0.5,            // Loose letter spacing
    },
};

// ==================== PRESET CONFIGURATIONS ====================

/**
 * Compact layout - fits more content
 */
export const compactConfig = {
    ...pdfConfig,
    page: {
        ...pdfConfig.page,
        margin: { top: 30, right: 30, bottom: 30, left: 30 },
    },
    fontSize: {
        ...pdfConfig.fontSize,
        name: 20,
        sectionTitle: 12,
        normal: 10,
    },
    spacing: {
        ...pdfConfig.spacing,
        sectionBottom: 12,
        paragraphBottom: 4,
    },
    lineHeight: {
        ...pdfConfig.lineHeight,
        normal: 1.3,
    },
};

/**
 * Spacious layout - more breathing room
 */
export const spaciousConfig = {
    ...pdfConfig,
    page: {
        ...pdfConfig.page,
        margin: { top: 50, right: 50, bottom: 50, left: 50 },
    },
    fontSize: {
        ...pdfConfig.fontSize,
        name: 28,
        sectionTitle: 16,
        normal: 12,
    },
    spacing: {
        ...pdfConfig.spacing,
        sectionBottom: 20,
        paragraphBottom: 8,
    },
    lineHeight: {
        ...pdfConfig.lineHeight,
        normal: 1.8,
    },
};

/**
 * Professional layout - balanced and clean
 */
export const professionalConfig = pdfConfig; // Default is already professional

// Export the active config (change this to switch presets)
export const activeConfig = pdfConfig; // Change to compactConfig or spaciousConfig
