import {Card, CardContent, List, ListItemButton, ListItemText, ListSubheader, Typography} from "@mui/material";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

const TRAINING_MODE = process.env.TRAINING_MODE === 'true';

export default async function Home() {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return <Typography variant="h6" textAlign="center" sx={{mt: 4,}}>Only members of the ARTCC can access the
            IDS.</Typography>
    }

    const airports = await prisma.facility.findMany({
        where: {
            airport: {
                isNot: null,
            },
            hiddenFromPicker: false,
        },
        orderBy: {
            order: 'asc',
        },
    });

    const radars = await prisma.facility.findMany({
        where: {
            radar: {
                isEnrouteFacility: false,
            },
            hiddenFromPicker: false,
        },
        orderBy: {
            order: 'asc',
        },
    });

    const enroutes = await prisma.facility.findMany({
        where: {
            radar: {
                isEnrouteFacility: true,
            },
            hiddenFromPicker: false,
        },
        orderBy: {
            order: 'asc',
        },
    });

    return (
        <Card sx={{mt: 2, width: '100%',}}>
            <CardContent>
                <Typography variant="h5" textAlign="center" gutterBottom>Facility Picker</Typography>
                <List
                    sx={{
                        '& ul': {padding: 0},
                    }}
                    subheader={<li/>}
                >
                    <Link href={`/app/tmu`}
                          style={{color: 'limegreen', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemText primary="IDS TMU"/>
                        </ListItemButton>
                    </Link>
                    <Link href={`/app/conflict-probing`}
                          style={{color: 'red', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemText primary="CONFLICT PROBING"/>
                        </ListItemButton>
                    </Link>
                    {TRAINING_MODE && <Link href={`/training/atis`}
                                            style={{color: 'hotpink', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemText primary="TRAINER ATIS"/>
                        </ListItemButton>
                    </Link>}
                    <li>
                        <ul>
                            <ListSubheader>Airports</ListSubheader>
                            {airports.map((item) => (
                                <Link key={item.id} href={`/app/airport/${item.id}`}
                                      style={{color: 'inherit', textDecoration: 'none',}}>
                                    <ListItemButton>
                                        <ListItemText primary={item.id}/>
                                    </ListItemButton>
                                </Link>
                            ))}
                        </ul>
                    </li>

                    <li>
                        <ul>
                            <ListSubheader>Radars</ListSubheader>
                            {radars.map((item) => (
                                <Link key={item.id} href={`/app/radar/${item.id}`}
                                      style={{color: 'inherit', textDecoration: 'none',}}>
                                    <ListItemButton>
                                        <ListItemText primary={item.id}/>
                                    </ListItemButton>
                                </Link>
                            ))}
                        </ul>
                    </li>

                    <li>
                        <ul>
                            <ListSubheader>Enroutes</ListSubheader>
                            {enroutes.map((item) => (
                                <Link key={item.id} href={`/app/radar/${item.id}`}
                                      style={{color: 'inherit', textDecoration: 'none',}}>
                                    <ListItemButton>
                                        <ListItemText primary={item.id}/>
                                    </ListItemButton>
                                </Link>
                            ))}
                        </ul>
                    </li>
                </List>
            </CardContent>
        </Card>
    );
}