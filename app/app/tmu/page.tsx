import React, {Suspense} from 'react';
import {Box, Button, CircularProgress, Stack, Typography, Accordion, AccordionSummary, AccordionDetails} from "@mui/material";
import TmuTable from "@/components/Admin/TMU/TmuTable";
import ReleaseRequestViewer from "@/components/ReleaseRequest/ReleaseRequestViewer";
import Link from "next/link";
import {Add, Reorder, ExpandMore} from "@mui/icons-material";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'TMU',
};

export default async function Page() {

    return (
        <Stack direction="column" spacing={2}>
            <Box sx={{ border: 1, p: 1 }}>
                <Typography gutterBottom textAlign="center">TRAFFIC MANAGEMENT ONLY</Typography>
                <ReleaseRequestViewer />
            </Box>

            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h5">T.M.U Notices</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="column" spacing={2} sx={{ width: '100%' }}>
                        <Box>
                            <Link href="/app/tmu/order" style={{color: 'inherit',}}>
                                <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                        sx={{mr: 1,}}>Order</Button>
                            </Link>
                            <Link href="/app/tmu/new">
                                <Button variant="contained" startIcon={<Add/>}>Broadcast</Button>
                            </Link>
                        </Box>
                        <Suspense fallback={<CircularProgress />}>
                            <TmuTable/>
                        </Suspense>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );

}
