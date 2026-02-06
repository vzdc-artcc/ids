import React, {Suspense} from 'react';
import {Button, CircularProgress, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import RadarConsolidationTable from "@/components/Admin/RadarConsolidation/RadarConsolidationTable";

export default async function Page() {

    return (
        <>
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <Typography variant="h5">Default Radar Consolidations</Typography>
                <Link href="/admin/radar-consolidations/new">
                    <Button variant="contained" startIcon={<Add/>}>New Consolidation</Button>
                </Link>
            </Stack>
            <Suspense fallback={<CircularProgress />}>
                <RadarConsolidationTable/>
            </Suspense>
        </>
    );

}