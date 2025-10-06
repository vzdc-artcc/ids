import React from 'react';
import {Box, Typography} from "@mui/material";

const TRAINING_MODE = process.env.TRAINING_MODE === 'true';

export default async function Layout({
                                         children,
                                     }: Readonly<{
    children: React.ReactNode;
}>) {

    if (!TRAINING_MODE) {
        return (
            <Box sx={{mt: 2,}}>
                <Typography variant="h5" textAlign="center">Training Mode is Disabled</Typography>
                <Typography textAlign="center">This section is only available when the IDS is in training
                    mode.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{mt: 2,}}>
            <Typography variant="h6" textAlign="center" color="hotpink" gutterBottom>FOR TRAINER USE ONLY</Typography>
            {children}
        </Box>
    );
}