'use client';
import React from 'react';
import {Grid2, Typography} from "@mui/material";
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
import { SessionProvider } from 'next-auth/react';
import ReleaseWindow from "@/components/Viewer/ReleaseWindow";

export default function Viewer() {

    const searchParams = useSearchParams();

    const display = searchParams.get('viewer');
    const prdStartAirport = searchParams.get('startAirport');

    const facility = searchParams.get('facility');



    return (
        <Grid2 size={12} sx={{border: 1, borderBottom: 0, minHeight: 950,}}>
            <SessionProvider>
                <Typography variant="h6">VIEWER</Typography>
                <div style={{paddingTop: 64, height: '1px',}} id="viewer"></div>
                {display === 'url' && <UrlViewer url={searchParams.get('url') || ''}/>}
                {display === 'emergency' && <EmergencyChecklist/>}
                {display === 'position' && <PositionChecklist/>}
                {display === 'wx' && <Weather/>}
                {display === 'sop' && <SopViewer defaultFacility={facility || undefined}/>}
                {display === 'prd' && <PreferredRoutes startAirport={prdStartAirport || undefined}/>}
                {display === 'airspace' && <Airspace/>}
                {display === 'set-airport' && <AirportSettings/>}
                {display === 'set-radar' && <RadarSettings/>}
                {display === 'consol' && <Consolidation/>}
                {display === 'rel' && <ReleaseWindow facilityId={facility || ''} />}
            </SessionProvider>
        </Grid2>
    );
}