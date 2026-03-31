'use client';
import React from 'react';
import {Box, Divider, Grid, Typography} from "@mui/material";
import {useSearchParams} from "next/navigation";
import UrlViewer from "@/components/Viewer/UrlViewer";
import EmergencyChecklist from "@/components/Viewer/EmergencyChecklist";
import PositionChecklist from "@/components/Viewer/PositionChecklist";
import Weather from "@/components/Viewer/Weather";
import SopViewer from "@/components/Viewer/SopViewer";
import PreferredRoutes from "@/components/Viewer/PreferredRoutes";
import Airspace from "@/components/Viewer/Airspace";
import AirportSettings from "@/components/Viewer/AirportSettings";
import RadarSettings from "@/components/Viewer/RadarSettings";
import Consolidation from "@/components/Viewer/Consolidation";
import ReleaseWindow from "@/components/Viewer/ReleaseWindow";
import ConflictProbing from "@/components/Viewer/ConflictProbing";
import CallsignLookup from "@/components/Viewer/CallsignLookup";

const VIEWER_COUNT = 4;

function ViewerPanel({index, size}: { index: number, size: number }) {
    const searchParams = useSearchParams();

    const display = searchParams.get(`viewer${index}`);
    const facility = searchParams.get(`facility${index}`);
    const prdStartAirport = searchParams.get(`startAirport${index}`);

    return (
        <Grid size={size} sx={{border: 1,}}>
            <Typography variant="h6">V{index}</Typography>
            <Divider color="cyan" sx={{my: 1,}} id={index === 1 ? 'viewer' : `viewer${index}`}/>
            <Box sx={{height: 550, overflow: 'auto',}}>
                {display === 'url' && <UrlViewer url={searchParams.get(`url${index}`) || ''}/>}
                {display === 'emergency' && <EmergencyChecklist/>}
                {display === 'position' && <PositionChecklist/>}
                {display === 'conflict-probing' && <ConflictProbing/>}
                {display === 'wx' && <Weather/>}
                {display === 'sop' && <SopViewer defaultFacility={facility || undefined}/>}
                {display === 'prd' && <PreferredRoutes startAirport={prdStartAirport || undefined}/>}
                {display === 'cs' && <CallsignLookup/>}
                {display === 'airspace' && <Airspace/>}
                {display === 'set-airport' && <AirportSettings/>}
                {display === 'set-radar' && <RadarSettings/>}
                {display === 'consol' && <Consolidation/>}
                {display === 'rel' && <ReleaseWindow facilityId={facility || ''}/>}
            </Box>
        </Grid>
    );
}

export default function Viewer() {
    return (
        <Grid container size={12} sx={{mb: 4,}}>
            {Array.from({length: VIEWER_COUNT}, (_, i) => (
                <ViewerPanel key={i + 1} index={i + 1} size={VIEWER_COUNT > 2 ? 6 : 12 / i}/>
            ))}
        </Grid>
    );
}
