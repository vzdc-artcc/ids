'use client';
import React, {useEffect, useState} from 'react';
import {ConflictProbingConfigResponse, ConflictProbingResponse} from "@/types/conflict-probing";
import ConflictProbingMap, {MapOptions} from "@/components/ConflictProbing/ConflictProbingMap";
import {fetchConflictProbingConfig, fetchConflictProbingData} from "@/actions/conflictProbing";
import {Box, Card, CardContent, CircularProgress, Grid, Typography} from "@mui/material";
import ConflictProbingMapConfig from "@/components/ConflictProbing/ConflictProbingMapConfig";
import AlertsWindow from "@/components/ConflictProbing/AlertsWindow";
import ConflictProbingConfig from "@/components/ConflictProbing/ConflictProbingConfig";

export default function ConflictProbingInformation({ alertsOnly }: { alertsOnly?: boolean }) {
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

    if (!alertsOnly && (!config || !data)) {
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

    if (alertsOnly) {
        return (
            <AlertsWindow alerts={data ? data.alerts : []}/>
        );
    }

    return data && config && (
        <Box>
            <Box sx={{positive: 'relative', width: '100%', height: '60vh',}}>
                <ConflictProbingMap alerts={data.alerts} nonAlerts={data.non_alerts} config={config}
                                    mapOptions={mapOptions}/>
            </Box>
            <Grid container columns={2} spacing={2} sx={{mt: 2,}}>
                <Grid size={1}>
                    <ConflictProbingMapConfig config={mapOptions} onChange={setMapOptions}/>
                </Grid>
                <Grid size={1}>
                    <AlertsWindow alerts={data.alerts}/>
                </Grid>
                <Grid size={2}>
                    <ConflictProbingConfig config={config}/>
                </Grid>
            </Grid>
        </Box>

    );
}