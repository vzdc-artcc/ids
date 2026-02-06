import React, {Suspense} from 'react';
import {Box, Button, CircularProgress, Stack, Typography} from "@mui/material";
import TmuTable from "@/components/Admin/TMU/TmuTable";
import Link from "next/link";
import {Add, Reorder} from "@mui/icons-material";

export default async function Page() {

    return (
        <>
            <Stack direction="row" spacing={1} justifyContent="space-between">
                <Typography variant="h5">T.M.U Notices</Typography>
                <Box>
                    <Link href="/admin/order/tmu" style={{color: 'inherit',}}>
                        <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                sx={{mr: 1,}}>Order</Button>
                    </Link>
                    <Link href="/admin/tmu/new">
                        <Button variant="contained" startIcon={<Add/>}>Broadcast</Button>
                    </Link>
                </Box>

            </Stack>
            <Suspense fallback={<CircularProgress />}>
                <TmuTable/>
            </Suspense>
        </>
    );

}