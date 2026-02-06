import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import RadarForm from "@/components/Admin/Radar/RadarForm";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New Radar Facility</Typography>
                <RadarForm/>
            </CardContent>
        </Card>
    );
}