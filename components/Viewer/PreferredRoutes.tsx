"use client";
import React, {useState} from 'react';
import {PreferredRoute} from "@/types";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import PrdForm from "@/components/Prd/PrdForm";
import {getRoutes} from "@/actions/prd";

export default function PreferredRoutes({startAirport}: { startAirport?: string, }) {

    const [routes, setRoutes] = useState<PreferredRoute[]>();

    const submit = async (origin: string, dest?: string) => {
        if (origin.length === 4 && origin.toUpperCase().startsWith('K')) {
            origin = origin.slice(1);
        }

        if (dest && dest.length === 4 && dest.toUpperCase().startsWith('K')) {
            dest = dest.slice(1);
        }

        const data = await getRoutes(origin, dest);
        setRoutes(data);
    }

    return (
        <>
            <Typography variant="h4" textAlign="center" gutterBottom>Preferred Routes Database</Typography>
            <PrdForm onSubmit={submit} startAirport={startAirport}/>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Origin</TableCell>
                            <TableCell>Destination</TableCell>
                            <TableCell>Route</TableCell>
                            <TableCell>Hours (1)</TableCell>
                            <TableCell>Hours (2)</TableCell>
                            <TableCell>Hours (3)</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Area</TableCell>
                            <TableCell>Altitude</TableCell>
                            <TableCell>Aircraft</TableCell>
                            <TableCell>Flow</TableCell>
                            <TableCell>Sequence</TableCell>
                            <TableCell>Departure ARTCC</TableCell>
                            <TableCell>Arrival ARTCC</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {routes && routes.length === 0 && <Typography>No PRD routes found.</Typography>}
                        {routes && routes.map((route, idx) => (
                            <TableRow key={idx}>
                                <TableCell>{route.origin}</TableCell>
                                <TableCell>{route.destination}</TableCell>
                                <TableCell><b>{route.route}</b></TableCell>
                                <TableCell>{route.hours1}</TableCell>
                                <TableCell>{route.hours2}</TableCell>
                                <TableCell>{route.hours3}</TableCell>
                                <TableCell>{route.type}</TableCell>
                                <TableCell>{route.area}</TableCell>
                                <TableCell>{route.altitude}</TableCell>
                                <TableCell>{route.aircraft}</TableCell>
                                <TableCell>{route.flow}</TableCell>
                                <TableCell>{route.seq}</TableCell>
                                <TableCell>{route.d_artcc}</TableCell>
                                <TableCell>{route.a_artcc}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </>
    );
}