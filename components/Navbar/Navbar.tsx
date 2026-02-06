import React from 'react';
import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";
import Logo from "@/components/Navbar/Logo";
import ZuluClock from "@/components/Navbar/ZuluClock";
import LoginButton from "@/components/Navbar/LoginButton";
import AppPickerMenu from "@/components/AppPicker/AppPickerMenu";
import config from '@/package.json' with {type: 'json'};
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import Link from "next/link";
import type {Consolidation} from "@/types";
import NavConsolidationDeleteButton from "@/components/Navbar/NavConsolidationDeleteButton";

const {DEV_MODE, IS_STAFF_ENDPOINT} = process.env;
const TRAINING_MODE = process.env['TRAINING_MODE'] === 'true';

export default async function Navbar({activeConsol}: {activeConsol?: Consolidation}) {

    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const res = await fetch(IS_STAFF_ENDPOINT?.replace('{cid}', session?.user.cid || 'null') || '');
    const isStaff: boolean = await res.json();

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
                        <Typography variant="subtitle2">IDS & ERIDS v{config.version}</Typography>}
                </Box>
                <Box sx={{ml: 4, p: 0.5, border: 1, borderColor: 'gold',}}>
                    <Typography variant="subtitle1" color={activeConsol ? 'gold' : 'red'}
                                fontWeight="bold">{activeConsol ? `${activeConsol.primarySector.radar.facilityId} - ${activeConsol.primarySector.identifier}` : 'NO CONSOL'}</Typography>
                    <Typography variant="subtitle2">{activeConsol ? `+${activeConsol.secondarySectors.length} Sectors` : ''}</Typography>
                </Box>
                { activeConsol && <NavConsolidationDeleteButton id={activeConsol.id} /> }
                {TRAINING_MODE && <Box sx={{ml: 4, p: 0.5, border: 1, borderColor: 'hotpink',}}>
                    <Typography variant="subtitle1" color="hotpink">TRAINING USE ONLY</Typography>
                </Box>}
                <span style={{flexGrow: 1,}}></span>
                <AppPickerMenu/>
                {session && isStaff && <Link href="/admin" style={{color: 'inherit',}}>
                    <Button variant="contained" color="inherit" sx={{mr: 1,}}>ADMIN</Button>
                </Link>}
                <LoginButton />
            </Toolbar>
        </AppBar>
    );
}