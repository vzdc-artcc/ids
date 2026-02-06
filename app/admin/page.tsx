import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import prisma from "@/lib/prisma";

export default async function Page() {

    const airportCount = await prisma.airport.count();
    const radarCount = await prisma.radar.count();
    const enrouteCount = await prisma.radarSector.count({
        where: {
            radar: {
                isEnrouteFacility: true,
            },
        },
    });
    const tmuCount = await prisma.tmuNotice.count();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h4">IDS Management</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">{airportCount} airport(s) configured.</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">{radarCount} radar facilities configured.</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">{enrouteCount} enroute radar sector(s) configured.</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">{tmuCount} TMU notice(s) active.</Typography>
                </CardContent>
            </Card>
        </Stack>
    );
}