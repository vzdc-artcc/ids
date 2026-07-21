import React from 'react';
import {Box} from "@mui/material";

export default async function Layout({ children }: { children: React.ReactNode }) {
    return (
        <Box sx={{ mt: 1 }}>
            {children}
        </Box>
    );
}