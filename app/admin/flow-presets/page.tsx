import React, {Suspense} from 'react';
import {Button, CircularProgress, Stack, Typography} from "@mui/material";
import FlowPresetTable from "@/components/Admin/FlowPreset/FlowPresetTable";
import Link from "next/link";
import {Add} from "@mui/icons-material";

export default async function Page() {
    return (
        <>
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <Typography variant="h5">Flow Presets</Typography>
                <Link href="/admin/flow-presets/new">
                    <Button variant="contained" startIcon={<Add/>}>New Flow Preset</Button>
                </Link>
            </Stack>
            <Suspense fallback={<CircularProgress />}>
                <FlowPresetTable/>
            </Suspense>
        </>
    );
}