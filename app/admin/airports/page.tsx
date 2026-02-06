import React, {Suspense} from 'react';
import {Box, Button, CircularProgress, Stack, Typography} from "@mui/material";
import {Add, Reorder} from "@mui/icons-material";
import Link from "next/link";
import AirportTable from "@/components/Admin/Airport/AirportTable";

export default async function Page() {
    return (
        <>
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <Typography variant="h5">Airports</Typography>
                <Box>
                    <Link href="/admin/order/airport" style={{color: 'inherit',}}>
                        <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                sx={{mr: 1,}}>Order</Button>
                    </Link>
                    <Link href="/admin/airports/new">
                        <Button variant="contained" startIcon={<Add/>}>New Airport</Button>
                    </Link>
                </Box>
            </Stack>
            <Suspense fallback={<CircularProgress />}>
                <AirportTable/>
            </Suspense>
        </>
    );

}