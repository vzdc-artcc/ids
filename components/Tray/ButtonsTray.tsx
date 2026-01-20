'use client';
import React from 'react';
import {Box, Button, ButtonGroup, Grid2, Typography} from "@mui/material";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Airport, Radar} from "@prisma/client";

export default function ButtonsTray({airport, radar,}: { airport?: Airport, radar?: Radar, }) {

    const pathname = usePathname();

    const redirectToViewer = (viewer: string, params?: URLSearchParams) => {
        return `${pathname}?${params?.toString() || ''}&viewer=${viewer}#viewer`;
    }

    return (
        <Grid2 size={2} sx={{border: 1,}}>
            <Typography variant="h6">VIEWER CTL</Typography>
            <Box height={250} sx={{overflow: 'auto',}}>
                <ButtonGroup size="small" variant="contained" disableElevation sx={{flexWrap: 'wrap', gap: 1,}}>
                    <Link href={redirectToViewer('wx')} style={{color: 'inherit',}}>
                        <Button color="inherit" style={{borderTopLeftRadius:'0px',borderBottomLeftRadius:"0px"}}>WX</Button>
                    </Link>
                    <Link href={redirectToViewer('rel', new URLSearchParams({facility: airport?.facilityId || radar?.facilityId || '',}))} style={{ color: 'inherit', }}>
                        <Button color="inherit" sx={{ backgroundColor: 'lightcyan', color: 'black' }}>REL</Button>
                    </Link>
                    <Link
                        href={redirectToViewer('url', new URLSearchParams({url: '/app/conflict-probing'}))}>
                        <Button color="inherit" sx={{ backgroundColor: 'darkviolet', color: 'white' }}>CONF-P</Button>
                    </Link>
                    <Link href={redirectToViewer('prd', new URLSearchParams({startAirport: airport?.iata || '',}))}>
                        <Button color="success">PRD</Button>
                    </Link>
                    <Link
                        href={redirectToViewer('sop', new URLSearchParams({facility: airport?.facilityId || radar?.facilityId || '',}))}>
                        <Button color="secondary">SOP</Button>
                    </Link>
                    <Link
                        href={redirectToViewer('url', new URLSearchParams({url: 'https://vzdc.org/publications/downloads?openInNewTab=false'}))}>
                        <Button color="secondary">PUB</Button>
                    </Link>
                    <Link href={redirectToViewer('url', new URLSearchParams({url: 'https://asx.vzdc.org'}))}>
                        <Button color="secondary">ASX</Button>
                    </Link>
                    <Link href={redirectToViewer('set-airport')}>
                        <Button color="info">ARP/SET</Button>
                    </Link>
                    <Link href={redirectToViewer('set-radar')}>
                        <Button color="info">RDR/SET</Button>
                    </Link>
                    <Link href={redirectToViewer('consol')}>
                        <Button color="info">RDR/CONSOL</Button>
                    </Link>
                    <Link href={redirectToViewer('position')}>
                        <Button color="warning">POS</Button>
                    </Link>
                    <Link href={redirectToViewer('emergency')}>
                        <Button color="error">EMRG</Button>
                    </Link>
                    <Link href={pathname}>
                        <Button variant="contained" color="primary">CLR</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="contained" color="primary">EXIT</Button>
                    </Link>
                    <Link href={redirectToViewer('url', new URLSearchParams({url: 'https://vzdc.org/'}))}
                          style={{color: 'inherit'}}>
                        <Button variant="outlined" color="inherit" size="small" style={{borderTopRightRadius:'0px',borderBottomRightRadius:"0px"}}>VZDC WEBSITE</Button>
                    </Link>
                </ButtonGroup>
                <Typography sx={{mt: 4,}}>&copy; {(new Date()).getFullYear()} vZDC</Typography>
                <Typography variant="subtitle2" color="red">NOT FOR REAL WORLD USE</Typography>
            </Box>
        </Grid2>
    );
}