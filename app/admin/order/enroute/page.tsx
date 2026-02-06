import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import OrderList from "@/components/Admin/Order/OrderList";
import prisma from "@/lib/prisma";
import {updateRadarOrder} from "@/actions/radar";

export default async function Page() {

    const airports = await prisma.radar.findMany({
        where: {
            isEnrouteFacility: true,
        },
        select: {
            id: true,
            facilityId: true,
            facility: {
                select: {
                    order: true,
                },
            },
        },
        orderBy: {
            facility: {
                order: 'asc',
            },
        },
    })

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Enroute Order</Typography>
                <OrderList items={airports.map((a) => ({id: a.id, name: a.facilityId, order: a.facility.order,}))}
                           onSubmit={updateRadarOrder}/>
            </CardContent>
        </Card>
    );
}