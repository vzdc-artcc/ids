import React from 'react';
import {Card, CardContent} from "@mui/material";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <Card>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}