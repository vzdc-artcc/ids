import React from 'react';
import prisma from "@/lib/prisma";
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import RadarForm from "@/components/Admin/Radar/RadarForm";
import {notFound} from "next/navigation";
import Link from "next/link";
import {Map} from "@mui/icons-material";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const radar = await prisma.radar.findUnique({
        where: {
            id,
        },
        include: {
            facility: true,
        },
    });

    if (!radar) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Typography variant="h5">Edit Radar Facility</Typography>
                    <Link href={`/admin/radars/${radar.id}/sectors`}>
                        <Button variant="contained" startIcon={<Map/>}>Radar Sectors</Button>
                    </Link>
                </Stack>
                <Typography variant="caption" gutterBottom>RADAR FACILITY ID: {radar.id}</Typography>
                <RadarForm radar={radar} hidden={radar.facility.hiddenFromPicker}/>
            </CardContent>
        </Card>
    );
}