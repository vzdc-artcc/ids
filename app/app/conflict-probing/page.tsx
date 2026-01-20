'use client';
import React, {useEffect, useState} from 'react';
import {ConflictProbingConfigResponse, ConflictProbingResponse} from "@/types/conflict-probing";
import {fetchConflictProbingConfig, fetchConflictProbingData} from "@/actions/conflictProbing";
import {Box, Card, CardContent, CircularProgress, Grid2, Typography} from "@mui/material";
import ConflictProbingConfig from "@/components/ConflictProbing/ConflictProbingConfig";
import ConflictProbingMap, {MapOptions} from "@/components/ConflictProbing/ConflictProbingMap";
import ConflictProbingMapConfig from "@/components/ConflictProbing/ConflictProbingMapConfig";
import AlertsWindow from "@/components/ConflictProbing/AlertsWindow";

export default function Page() {

    const [config, setConfig] = useState<ConflictProbingConfigResponse>();
    const [data, setData] = useState<ConflictProbingResponse>();
    const [mapOptions, setMapOptions] = useState<MapOptions>({
        showAlertsOnly: false,
        showPredictions: false,
        showNonAlertDatablocks: false,
        showCurrentFlightLevel: false,
        showFlightPlanAltitude: false,
        showVerticalSpeed: false,
        showGroundSpeed: false,
        showNextWaypoint: false,
    });

    useEffect(() => {
        fetchConflictProbingConfig().then(setConfig).catch(console.error);

        const dataInterval = setInterval(() => {
            fetchConflictProbingData().then(setData).catch(console.error);
        }, 5000);

        return () => {
            clearInterval(dataInterval);
        }
    }, []);

    useEffect(() => {
        fetchConflictProbingData().then(setData).catch(console.error);
    }, []);

    if (!config || !data) {
        return (
            <Card sx={{mt: 4,}}>
                <CardContent sx={{textAlign: "center",}}>
                    <CircularProgress size={100}/>
                    <Typography sx={{mt: 2,}}>Loading Conflict Probing System. This might take a few
                        seconds.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            <Box sx={{positive: 'relative', width: '100%', height: '60vh',}}>
                <ConflictProbingMap alerts={data.alerts} nonAlerts={data.non_alerts} config={config}
                                    mapOptions={mapOptions}/>
            </Box>
            <Grid2 container columns={2} spacing={2} sx={{mt: 2,}}>
                <Grid2 size={1}>
                    <ConflictProbingMapConfig config={mapOptions} onChange={setMapOptions}/>
                </Grid2>
                <Grid2 size={1}>
                    <AlertsWindow alerts={data.alerts}/>
                </Grid2>
                <Grid2 size={2}>
                    <ConflictProbingConfig config={config}/>
                </Grid2>
            </Grid2>
        </Box>

    );
}