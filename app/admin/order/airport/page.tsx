import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import OrderList from "@/components/Admin/Order/OrderList";
import {updateAirportOrder} from "@/actions/airport";
import prisma from "@/lib/prisma";

export default async function Page() {

    const airports = await prisma.airport.findMany({
        select: {
            id: true,
            icao: true,
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
                <Typography variant="h5" gutterBottom>Airport Order</Typography>
                <OrderList items={airports.map((a) => ({id: a.id, name: a.icao, order: a.facility.order,}))}
                           onSubmit={updateAirportOrder}/>
            </CardContent>
        </Card>
    );
}