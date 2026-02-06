import React from 'react';
import {Card, CardContent, CircularProgress, Stack} from "@mui/material";

export default function Loading() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="center">
                    <CircularProgress size={80}/>
                </Stack>
            </CardContent>
        </Card>

    );
}