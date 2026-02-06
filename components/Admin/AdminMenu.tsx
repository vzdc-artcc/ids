import {Card, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Typography} from '@mui/material';
import Link from 'next/link';
import React from 'react';
import {
    AirplanemodeActive,
    CellTower,
    FileOpen,
    GridView,
    Home,
    ImportExport,
    ListAlt,
    PieChart,
    Radar
} from "@mui/icons-material";

export default function AdminMenu() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" textAlign="center">I.D.S. Management</Typography>
                <List>
                    <Link href="/admin" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Home/>
                            </ListItemIcon>
                            <ListItemText primary="Overview"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/airports" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <AirplanemodeActive/>
                            </ListItemIcon>
                            <ListItemText primary="Airports"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/flow-presets" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <FileOpen/>
                            </ListItemIcon>
                            <ListItemText primary="Flow Presets"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/radars" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Radar/>
                            </ListItemIcon>
                            <ListItemText primary="Radar Facilities"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/radar-consolidations" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <GridView/>
                            </ListItemIcon>
                            <ListItemText primary="Default Consolidations"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/airspaces" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <PieChart/>
                            </ListItemIcon>
                            <ListItemText primary="Airspace Diagrams"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/tmu" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <CellTower/>
                            </ListItemIcon>
                            <ListItemText primary="T.M.U. Notices"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/admin/file" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <ImportExport/>
                            </ListItemIcon>
                            <ListItemText primary="Import/Export"/>
                        </ListItemButton>
                    </Link>

                    <Link href="/admin/logs" style={{textDecoration: 'none', color: 'inherit',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <ListAlt/>
                            </ListItemIcon>
                            <ListItemText primary="Logs"/>
                        </ListItemButton>
                    </Link>
                </List>
            </CardContent>
        </Card>
    );
}