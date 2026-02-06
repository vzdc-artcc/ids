'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    cssVariables: true,
    colorSchemes: {
        light: {},
        dark: {
            palette: {
                mode: "dark",
                primary: {
                    main: '#500E0E',
                    contrastText: '#EDEDF5',
                },
            }
        },
    },
    typography: {
        fontFamily: 'var(--font-roboto)',
    },
});

export default theme;
