import React from 'react';
import {Grid, Typography} from "@mui/material";
import AdminMenu from "@/components/Admin/AdminMenu";
import {Metadata} from "next";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

const {IS_STAFF_ENDPOINT} = process.env;

export const metadata: Metadata = {
    title: 'Admin | vZDC IDS',
    description: 'vZDC IDS admin page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return <Typography>Only members of the ARTCC can access the IDS. Login to continue.</Typography>
    }

    const res = await fetch(IS_STAFF_ENDPOINT?.replace('{cid}', session.user.cid) || '');
    const isStaff: boolean = await res.json();
    if (!isStaff) {
        return <Typography>Only staff members of the ARTCC can access the admin section</Typography>
    }

    return (
        <Grid container columns={9} spacing={2} sx={{mt: 2,}}>
            <Grid size={{xs: 9, lg: 2,}}>
                <AdminMenu/>
            </Grid>
            <Grid size="grow">
                {children}
            </Grid>
        </Grid>
    );
}