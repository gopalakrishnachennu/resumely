import { StyleSheet } from '@react-pdf/renderer';
import { activeConfig } from './config';

const config = activeConfig;

export const styles = StyleSheet.create({
    page: {
        padding: config.page.margin.top,
        paddingLeft: config.page.margin.left,
        paddingRight: config.page.margin.right,
        paddingBottom: config.page.margin.bottom,
        fontSize: config.fontSize.normal,
        fontFamily: config.fonts.main,
        lineHeight: config.lineHeight.normal,
        color: config.colors.primary,
    },

    // Header styles
    header: {
        marginBottom: config.spacing.headerBottom,
    },
    name: {
        fontSize: config.fontSize.name,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    contactInfo: {
        fontSize: config.fontSize.contactInfo,
        color: config.colors.secondary,
        marginBottom: 4,
    },

    // Section styles
    section: {
        marginBottom: config.spacing.sectionBottom,
    },
    sectionTitle: {
        fontSize: config.fontSize.sectionTitle,
        fontWeight: 'bold',
        marginBottom: config.spacing.sectionTitleBottom,
        paddingBottom: 4,
        borderBottom: `${config.spacing.sectionTitleBorder}pt solid ${config.colors.border}`,
        textTransform: 'uppercase',
    },

    // Content styles
    paragraph: {
        marginBottom: config.spacing.paragraphBottom,
        lineHeight: config.lineHeight.normal,
    },
    bulletList: {
        marginLeft: config.spacing.bulletIndent,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: config.spacing.bulletSpacing,
    },
    bulletPoint: {
        width: 15,
        fontSize: config.fontSize.small,
    },
    bulletText: {
        flex: 1,
    },

    // Job/Education entry styles
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    entryTitle: {
        fontWeight: 'bold',
    },
    entryDate: {
        fontSize: config.fontSize.small,
        color: config.colors.secondary,
    },
    entrySubtitle: {
        fontSize: config.fontSize.small,
        color: config.colors.secondary,
        marginBottom: 6,
    },
});
