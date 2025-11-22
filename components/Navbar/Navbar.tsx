import React from 'react';
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import Logo from "@/components/Navbar/Logo";
import ZuluClock from "@/components/Navbar/ZuluClock";
import LoginButton from "@/components/Navbar/LoginButton";
import {Session} from "next-auth";
import Link from "next/link";
import getConfig from 'next/config';
import {Consolidation} from "@/components/Viewer/Consolidation";
import NavConsolidationDeleteButton from "@/components/Navbar/NavConsolidationDeleteButton";
import AppPickerMenu from "@/components/AppPicker/AppPickerMenu";

const {IS_STAFF_ENDPOINT, DEV_MODE} = process.env;
const TRAINING_MODE = process.env['TRAINING_MODE'] === 'true';

export default async function Navbar({session, activeConsol }: { session: Session | null, activeConsol?: Consolidation }) {

    const res = await fetch(IS_STAFF_ENDPOINT?.replace('{cid}', session?.user.cid || 'null') || '');
    const isStaff: boolean = await res.json();
    const {publicRuntimeConfig} = getConfig();

    return (
        <AppBar position="sticky">
            <Toolbar>
                {session ? <ZuluClock/> : <Logo/>}
                <Box sx={{ml: 4, p: 0.5, border: 1, borderColor: 'cyan',}}>
                    <Typography variant="subtitle1" color="cyan"
                                fontWeight="bold">{session?.user.fullName || 'NO SESSION'}</Typography>
                    {DEV_MODE === 'true' &&
                        <Typography variant="subtitle2" color="limegreen">Development Build</Typography>}
                    {DEV_MODE !== 'true' &&
                        <Typography variant="subtitle2">IDS & ERIDS v{publicRuntimeConfig?.version}</Typography>}
                </Box>
                <Box sx={{ml: 4, p: 0.5, border: 1, borderColor: 'gold',}}>
                    <Typography variant="subtitle1" color={activeConsol ? 'gold' : 'red'}
                                fontWeight="bold">{activeConsol ? `${activeConsol.primarySector.radar.facilityId} - ${activeConsol.primarySector.identifier}` : 'NO CONSOL'}</Typography>
                    <Typography variant="subtitle2">{activeConsol ? `+${activeConsol.secondarySectors.length} Sectors` : ''}</Typography>
                </Box>
                {TRAINING_MODE && <Box sx={{ml: 4, p: 0.5, border: 1, borderColor: 'hotpink',}}>
                    <Typography variant="subtitle1" color="hotpink">TRAINING USE ONLY</Typography>
                </Box>}
                { activeConsol && <NavConsolidationDeleteButton id={activeConsol.id} /> }
                <span style={{flexGrow: 1,}}></span>
                <AppPickerMenu/>
                {session && isStaff && <Link href="/admin" style={{color: 'inherit',}}>
                    <Button variant="contained" color="inherit" sx={{mr: 1,}}>ADMIN</Button>
                </Link>}
                <LoginButton session={session}/>
            </Toolbar>
        </AppBar>
    );
}