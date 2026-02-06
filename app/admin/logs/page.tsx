import React, {Suspense} from 'react';
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import LogTable from "@/components/Admin/Logs/LogTable";

export default async function Page() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Logs</Typography>
                <Suspense fallback={<CircularProgress />}>
                    <LogTable/>
                </Suspense>
            </CardContent>
        </Card>
    );
}