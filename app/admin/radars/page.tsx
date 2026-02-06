import React, {Suspense} from 'react';
import {Box, Button, Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import RadarTable from "@/components/Admin/Radar/RadarTable";
import Link from "next/link";
import {Add, Reorder} from "@mui/icons-material";

export default async function Page() {
    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Typography variant="h5">Radar Facilities</Typography>
                    <Box>
                        <Link href="/admin/order/enroute" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                    sx={{mr: 1,}}>Order Enroutes</Button>
                        </Link>
                        <Link href="/admin/order/radar" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                    sx={{mr: 1,}}>Order Radars</Button>
                        </Link>
                        <Link href="/admin/radars/new">
                            <Button variant="contained" startIcon={<Add/>}>New Radar Facility</Button>
                        </Link>
                    </Box>
                </Stack>
                <Suspense fallback={<CircularProgress />}>
                    <RadarTable/>
                </Suspense>
            </CardContent>
        </Card>
    );
}