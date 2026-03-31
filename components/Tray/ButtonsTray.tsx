'use client';
import React, {useState} from 'react';
import {Button, ButtonGroup, Divider, Grid, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {usePathname, useSearchParams} from "next/navigation";
import {Airport, Radar} from "@/generated/prisma/client";

const VIEWER_COUNT = 4;

export default function ButtonsTray({airport, radar,}: { airport?: Airport, radar?: Radar, }) {

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [cacheBuster, setCacheBuster] = useState<number>();

    const refreshCacheBuster = () => {
        setCacheBuster((new Date()).getTime());
    }

    const tv = searchParams.get('tv') || '1';

    const redirectToViewer = (viewer: string, params?: URLSearchParams) => {
        if (viewer === 'url') {
            refreshCacheBuster();
        }

        const current = new URLSearchParams(searchParams.toString());
        current.set(`viewer${tv}`, viewer);
        if (params) {
            params.forEach((value, key) => current.set(`${key}${tv}`, value));
        }
        current.set('tv', tv);
        return `${pathname}?${current.toString()}`;
    }

    const setTargetViewer = (n: string) => {
        const current = new URLSearchParams(searchParams.toString());
        current.set('tv', n);
        return `${pathname}?${current.toString()}`;
    }

    const clearViewer = () => {
        const current = new URLSearchParams(searchParams.toString());
        current.delete(`viewer${tv}`);
        current.delete(`facility${tv}`);
        current.delete(`url${tv}`);
        current.delete(`startAirport${tv}`);
        return `${pathname}?${current.toString()}`;
    }

    return (
        <Grid size={2} sx={{border: 1,height: 250,overflowY: 'auto', p: 0.5,}}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{mt: 0.5,}}>
                <Typography variant="caption" textAlign="center" fontSize={10}>V SEL: </Typography>
                <ButtonGroup size="small" variant="contained" disableElevation>
                    {Array.from({length: VIEWER_COUNT}, (_, i) => {
                        const n = String(i + 1);
                        return (
                            <Link key={n} href={setTargetViewer(n)} scroll={false} style={{color: 'inherit'}}>
                                <Button color={tv === n ? 'primary' : 'inherit'} size="small" sx={{p: 0,}}>V{n}</Button>
                            </Link>
                        );
                    })}
                </ButtonGroup>
            </Stack>

            <Divider color="white" sx={{my: 1,}}/>
            <ButtonGroup size="small" variant="contained" disableElevation sx={{flexWrap: 'wrap', gap: 1,}}>
                <Link href={redirectToViewer('wx')} scroll={false} style={{color: 'inherit',}}>
                    <Button color="inherit" style={{borderTopLeftRadius:'0px',borderBottomLeftRadius:"0px"}}>WX</Button>
                </Link>
                <Link
                    href={redirectToViewer('rel', new URLSearchParams({facility: airport?.facilityId || radar?.facilityId || '',}))}
                    scroll={false} style={{color: 'inherit',}}>
                    <Button color="inherit" sx={{ backgroundColor: 'lightcyan', color: 'black' }}>REL</Button>
                </Link>
                <Link scroll={false}
                    href={redirectToViewer('conflict-probing')}>
                    <Button color="inherit" sx={{ backgroundColor: 'darkviolet', color: 'white' }}>CONF-P</Button>
                </Link>
                <Link href={redirectToViewer('prd', new URLSearchParams({startAirport: airport?.iata || '',}))}
                      scroll={false}>
                    <Button color="success">PRD</Button>
                </Link>
                <Link scroll={false}
                    href={redirectToViewer('sop', new URLSearchParams({facility: airport?.facilityId || radar?.facilityId || '',}))}>
                    <Button color="secondary">SOP</Button>
                </Link>
                <Link scroll={false}
                      href={redirectToViewer('url', new URLSearchParams({url: `http://localhost:3000/publications/downloads?ids=true&cb=${cacheBuster}`}))}>
                    <Button color="secondary">PUB</Button>
                </Link>
                <Link href={redirectToViewer('url', new URLSearchParams({url: 'https://asx.vzdc.org'}))} scroll={false}>
                    <Button color="secondary">ASX</Button>
                </Link>
                <Link href={redirectToViewer('set-airport')} scroll={false}>
                    <Button color="info">ARP/SET</Button>
                </Link>
                <Link href={redirectToViewer('set-radar')} scroll={false}>
                    <Button color="info">RDR/SET</Button>
                </Link>
                <Link href={redirectToViewer('consol')} scroll={false}>
                    <Button color="info">RDR/CONSOL</Button>
                </Link>
                <Link href={redirectToViewer('position')} scroll={false}>
                    <Button color="warning">POS</Button>
                </Link>
                <Link href={redirectToViewer('emergency')} scroll={false}>
                    <Button color="error">EMRG</Button>
                </Link>
                <Link href={clearViewer()} scroll={false}>
                    <Button variant="contained" color="primary">CLR</Button>
                </Link>
                <Link href="/">
                    <Button variant="contained" color="primary">EXIT</Button>
                </Link>
                <Link href={redirectToViewer('url', new URLSearchParams({url: 'https://vzdc.org/'}))} scroll={false}
                      style={{color: 'inherit'}}>
                    <Button variant="outlined" color="inherit" size="small" style={{borderTopRightRadius:'0px',borderBottomRightRadius:"0px"}}>VZDC WEBSITE</Button>
                </Link>
            </ButtonGroup>
            <Typography sx={{mt: 1,}}>&copy; {(new Date()).getFullYear()} vZDC</Typography>
            <Typography variant="subtitle2" color="red">NOT FOR REAL WORLD USE</Typography>
        </Grid>
    );
}
