'use client';
import React, {useEffect, useState} from 'react';
import {Box, Chip, Stack, Typography} from "@mui/material";
import {fetchSigWx} from "@/actions/wx";

type SigWxData = {
    icaoId: string,
    alphaChar: string,
    seriesId: string,
    recieptTime: string,
    creationTime: string,
    validTimeFrom: number,
    validTimeTo: number,
    airSigmetType: string,
    hazard: string,
    altitudeHi1: number,
    altitudeHi2: number,
    altitudeLow1: number | null,
    altitudeLow2: number | null,
    movementDir: number,
    movementSpd: number,
    rawAirSigmet: string,
    postProcessFlag: number,
    severity: number,
    coords: {
        lat: number,
        lon: number,
    }[],
}

const HAZARD_COLORS: Record<string, string> = {
    CONVECTIVE: '#f57c00',
    TURB: '#fbc02d',
    ICE: '#29b6f6',
    IFR: '#ef5350',
    'MTN OBSCN': '#ab47bc',
    LLWS: '#66bb6a',
};

const REGION_LABELS: Record<string, string> = {
    C: 'Central',
    E: 'Eastern',
    W: 'Western',
};

function formatTime(unix: number): string {
    const d = new Date(unix * 1000);
    const day = d.getUTCDate().toString().padStart(2, '0');
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    return `${day}/${hh}${mm}Z`;
}

function formatAltitude(ft: number | null): string {
    if (ft === null || ft === undefined) return 'SFC';
    return `FL${Math.round(ft / 100)}`;
}

function formatMovement(dir: number, spd: number): string {
    if (!spd) return 'STNR';
    return `${dir}° @ ${spd}kt`;
}

function SigmetCard({sigmet}: { sigmet: SigWxData }) {
    const hazardColor = HAZARD_COLORS[sigmet.hazard] ?? '#90a4ae';
    const altRange = sigmet.altitudeLow1 !== null
        ? `${formatAltitude(sigmet.altitudeLow1)}–${formatAltitude(sigmet.altitudeHi1)}`
        : `SFC–${formatAltitude(sigmet.altitudeHi1)}`;

    return (
        <Box sx={{
            border: 1,
            borderColor: sigmet.seriesId === 'E' ? 'red' : 'gray',
            p: 1,
            mb: 1,
        }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{mb: 1}}>
                <Typography variant="subtitle2" fontWeight="bold">
                    {sigmet.seriesId}
                </Typography>
                <Chip
                    label={sigmet.hazard}
                    size="small"
                    color="warning"
                />
                <Typography variant="caption" color="text.secondary">
                    {REGION_LABELS[sigmet.alphaChar] ?? sigmet.alphaChar}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {altRange}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatMovement(sigmet.movementDir, sigmet.movementSpd)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ml: 'auto !important'}}>
                    {formatTime(sigmet.validTimeFrom)}–{formatTime(sigmet.validTimeTo)}
                </Typography>
            </Stack>
            <Typography sx={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'text.primary',
            }}>
                {sigmet.rawAirSigmet}
            </Typography>
        </Box>
    );
}

export default function Weather() {
    const [cacheBuster, setCacheBuster] = useState(() => Date.now());
    const [sigWxData, setSigWxData] = useState<SigWxData[]>();

    useEffect(() => {
        fetchSigWx().then(setSigWxData);

        const interval = setInterval(() => {
            setCacheBuster(Date.now());
            fetchSigWx().then(setSigWxData);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const sortByRegion = (items: SigWxData[]) => {
        return items.sort((a, b) => {
            const aIsEastern = a.seriesId.startsWith('E') ? 0 : 1;
            const bIsEastern = b.seriesId.startsWith('E') ? 0 : 1;
            return aIsEastern - bIsEastern;
        });
    };

    const sigmets = sortByRegion(sigWxData?.filter(s => s.airSigmetType === 'SIGMET') ?? []);
    const airmets = sortByRegion(sigWxData?.filter(s => s.airSigmetType === 'AIRMET') ?? []);

    return (
        <Box>
            <Box sx={{px: 1, mt: 1}}>
                {[
                    {label: 'SIGMETs', items: sigmets},
                    {label: 'AIRMETs', items: airmets},
                ].map(({label, items}) => (
                    <Box key={label} sx={{pb: 3}}>
                        <Typography variant="h6" gutterBottom>
                            {label}{' '}
                            <Typography component="span" variant="caption" color="text.secondary">
                                ({items.length} active)
                            </Typography>
                        </Typography>
                        {items.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{pl: 1}}>
                                No active {label.toLowerCase()}.
                            </Typography>
                        ) : (
                            items.map((sigmet, idx) => (
                                <SigmetCard key={`${sigmet.seriesId}-${idx}`} sigmet={sigmet}/>
                            ))
                        )}
                    </Box>
                ))}
            </Box>
            <Typography textAlign="center" variant="subtitle2">
                Page might need to be refreshed for up to date data. Check the footer of each feed to confirm that it is
                current.
            </Typography>

            <Stack direction="row" flexWrap="wrap" justifyContent="center"
                   sx={{width: '100%', boxSizing: 'border-box'}}>
                <Box sx={{p: 1, boxSizing: 'border-box', flex: '1 1 300px', minWidth: 0, maxWidth: 600}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={`ne-${cacheBuster}`} style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        boxSizing: 'border-box'
                    }} src={`https://radar.weather.gov/ridge/standard/NORTHEAST_loop.gif?t=${cacheBuster}`}
                         alt="Northeast radar"/>
                </Box>

                <Box sx={{p: 1, boxSizing: 'border-box', flex: '1 1 300px', minWidth: 0, maxWidth: 600}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={`se-${cacheBuster}`} style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        boxSizing: 'border-box'
                    }} src={`https://radar.weather.gov/ridge/standard/SOUTHEAST_loop.gif?t=${cacheBuster}`}
                         alt="Southeast radar"/>
                </Box>

                <Box sx={{p: 1, boxSizing: 'border-box', flex: '1 1 600px', minWidth: 0, maxWidth: 900}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={`conus-${cacheBuster}`} style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        boxSizing: 'border-box'
                    }} src={`https://radar.weather.gov/ridge/standard/CONUS_loop.gif?t=${cacheBuster}`}
                         alt="CONUS radar"/>
                </Box>
            </Stack>

        </Box>
    );
}
