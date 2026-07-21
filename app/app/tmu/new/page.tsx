import React from 'react';
import prisma from "@/lib/prisma";
import {Card, CardContent, Typography} from "@mui/material";
import TmuForm from "@/components/Admin/TMU/TmuForm";

export default async function Page() {

    const allFacilities = await prisma.facility.findMany({
        orderBy: {
            id: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New T.M.U. Notice</Typography>
                <TmuForm allFacilities={allFacilities}/>
            </CardContent>
        </Card>
    );

}
