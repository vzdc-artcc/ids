import React from 'react';
import {Box, Stack, Typography} from "@mui/material";
import ReleaseRequestViewer from "@/components/ReleaseRequest/ReleaseRequestViewer";

export default async function Page() {

    return (
        <Stack direction="column" spacing={1} sx={{ mt: 1, }}>
            <Typography gutterBottom textAlign="center">TRAFFIC MANAGEMENT ONLY</Typography>
            <Box sx={{ border: 1, p: 1, }}>
                <ReleaseRequestViewer />
            </Box>
        </Stack>
    );
}