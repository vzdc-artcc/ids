import React from 'react';
import {Typography, List, ListItem, Checkbox, FormControlLabel} from "@mui/material";

export default function RadarChecklist() {
    return (
        <div>
            <Typography variant="h6">Radar Checklist</Typography>
            <List>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Review staffed ATC above/below"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Status of automatic departures"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Traffic management initatives"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="NOTAMS, SAA/SUA, IDS"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Landing direction at controlled airports"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Weather (VFR/MVFR/IFR) & visual approach use"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Low altimeter *at facilities owning FL180/ABV airspace*"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Non-standard conditions"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Note aircraft with clearances on ground"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Note any active point outs"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Review all airborne traffic"/>
                </ListItem>
            </List>
        </div>
    );
}