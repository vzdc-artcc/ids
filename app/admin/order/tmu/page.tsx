import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import OrderList from "@/components/Admin/Order/OrderList";
import prisma from "@/lib/prisma";
import {updateTmuOrder} from "@/actions/tmu";

export default async function Page() {

    const airports = await prisma.tmuNotice.findMany({
        select: {
            id: true,
            message: true,
            order: true,
        },
        orderBy: {
            order: 'asc',
        },
    })

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>TMU Order</Typography>
                <OrderList items={airports.map((a) => ({id: a.id, name: a.message, order: a.order,}))}
                           onSubmit={updateTmuOrder}/>
            </CardContent>
        </Card>
    );
}