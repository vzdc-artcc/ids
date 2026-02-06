import React, {Suspense} from 'react';
import {Button, CircularProgress, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import AirspaceDiagramTable from "@/components/Admin/AirspaceDiagram/AirspaceDiagramTable";

export default async function Page() {

    return (
        <>
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <Typography variant="h5">Airspace Diagrams</Typography>
                <Link href="/admin/airspaces/new">
                    <Button variant="contained" startIcon={<Add/>}>New Airspace Diagram</Button>
                </Link>
            </Stack>
            <Suspense fallback={<CircularProgress />}>
                <AirspaceDiagramTable/>
            </Suspense>
        </>
    );

}