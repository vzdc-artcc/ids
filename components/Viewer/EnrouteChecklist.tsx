import React from 'react';
import {Typography, List, ListItem, Checkbox, FormControlLabel} from "@mui/material";

export default function EnrouteChecklist() {
    return (
        <div>
            <Typography variant="h6">Local Checklist</Typography>
            <List>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Sectorization (ABV/BLW)"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Traffic management initatives"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="NOTAMS/SUA"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Landing directions (BWI, DCA, IAD, RIC, RDU, CLT)"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Weather (VFR/MVFR/IFR)"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Low altimeter areas"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Aircraft with clearance on ground"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Active point outs"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Review airborne traffic"/>
                </ListItem>
            </List>
        </div>
    );
}