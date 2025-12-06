import { Font } from '@react-pdf/renderer';

// Register Arial (using Arimo - metrically identical open-source alternative)
Font.register({
    family: 'Arial',
    fonts: [
        { src: '/fonts/arial.ttf' },
        { src: '/fonts/arial-bold.ttf', fontWeight: 'bold' },
    ],
});

// Register Calibri (using Carlito - open-source alternative)
Font.register({
    family: 'Calibri',
    fonts: [
        { src: '/fonts/calibri.ttf' },
        { src: '/fonts/calibri-bold.ttf', fontWeight: 'bold' },
    ],
});

// Note: Aptos is a proprietary Microsoft font not available as open-source
// Using Calibri as a similar modern alternative
Font.register({
    family: 'Aptos',
    fonts: [
        { src: '/fonts/calibri.ttf' },  // Using Calibri as Aptos alternative
        { src: '/fonts/calibri-bold.ttf', fontWeight: 'bold' },
    ],
});
