'use client';
import React from 'react';
import {Box, Button, ButtonGroup, Divider, Grid, Stack, Typography} from "@mui/material";
import {usePathname, useSearchParams} from "next/navigation";
import Link from "next/link";
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

const DISPLAY_LABELS: Record<string, string> = {
    url: 'URL',
    emergency: 'EMRG',
    position: 'POS',
    'conflict-probing': 'CONF-P',
    wx: 'WX',
    sop: 'SOP',
    prd: 'PRD',
    cs: 'C/S',
    airspace: 'ARPSC',
    'set-airport': 'ARP/SET',
    'set-radar': 'RDR/SET',
    consol: 'CONSOL',
    rel: 'REL',
};

export default function Viewer() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tv = searchParams.get('tv') || '1';

    const switchViewer = (n: string) => {
        const current = new URLSearchParams(searchParams.toString());
        current.set('tv', n);
        return `${pathname}?${current.toString()}`;
    };

    return (
        <Grid size={12} sx={{mb: 4, overflow: 'auto', border: 1,}}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{mb: 0.5,}}>
                <ButtonGroup size="small" variant="contained" disableElevation>
                    {Array.from({length: VIEWER_COUNT}, (_, i) => {
                        const n = String(i + 1);
                        const slotDisplay = searchParams.get(`viewer${n}`);
                        const baseLabel = slotDisplay === 'url'
                            ? (searchParams.get(`urlName${n}`) ?? 'URL')
                            : (DISPLAY_LABELS[slotDisplay ?? ''] ?? slotDisplay?.toUpperCase());
                        const facilityParam = searchParams.get(`facility${n}`);
                        const startAirportParam = searchParams.get(`startAirport${n}`);
                        const subtitle =
                            (slotDisplay === 'sop' || slotDisplay === 'rel') && facilityParam ? facilityParam :
                                slotDisplay === 'prd' && startAirportParam ? startAirportParam :
                                    null;
                        const label = slotDisplay
                            ? `V${n} · ${baseLabel}${subtitle ? ` / ${subtitle}` : ''}`
                            : `V${n}`;
                        return (
                            <Link key={n} href={switchViewer(n)} scroll={false} style={{color: 'inherit',}}>
                                <Button
                                    color={tv === n ? 'success' : 'inherit'}
                                    sx={{px: 1.5, minWidth: 80, fontSize: 11,}}
                                >
                                    {label}
                                </Button>
                            </Link>
                        );
                    })}
                </ButtonGroup>
            </Stack>

            <Divider color="cyan" sx={{mb: 1,}} id="viewer"/>

            <Box sx={{height: '75vh', overflow: 'auto', border: 1,}}>
                {Array.from({length: VIEWER_COUNT}, (_, i) => {
                    const n = String(i + 1);
                    const slotDisplay = searchParams.get(`viewer${n}`);
                    const slotFacility = searchParams.get(`facility${n}`);
                    const slotPrdStart = searchParams.get(`startAirport${n}`);
                    const slotUrl = searchParams.get(`url${n}`) || '';
                    const isActive = tv === n;

                    if (!slotDisplay) {
                        return isActive ? (
                            <Typography key={n} variant="body2" color="text.secondary"
                                        sx={{p: 2, textAlign: 'center',}}>
                                No content loaded. Use the buttons panel to load content into V{n}.
                            </Typography>
                        ) : null;
                    }

                    return (
                        <Box key={n} sx={{display: isActive ? 'block' : 'none', height: '100%',}}>
                            {slotDisplay === 'url' && <UrlViewer url={slotUrl}/>}
                            {slotDisplay === 'emergency' && <EmergencyChecklist/>}
                            {slotDisplay === 'position' && <PositionChecklist/>}
                            {slotDisplay === 'conflict-probing' && <ConflictProbing/>}
                            {slotDisplay === 'wx' && <Weather/>}
                            {slotDisplay === 'sop' && <SopViewer defaultFacility={slotFacility || undefined}/>}
                            {slotDisplay === 'prd' && <PreferredRoutes startAirport={slotPrdStart || undefined}/>}
                            {slotDisplay === 'cs' && <CallsignLookup/>}
                            {slotDisplay === 'airspace' && <Airspace/>}
                            {slotDisplay === 'set-airport' && <AirportSettings/>}
                            {slotDisplay === 'set-radar' && <RadarSettings/>}
                            {slotDisplay === 'consol' && <Consolidation/>}
                            {slotDisplay === 'rel' && <ReleaseWindow facilityId={slotFacility || ''}/>}
                        </Box>
                    );
                })}
            </Box>
        </Grid>
    );
}
