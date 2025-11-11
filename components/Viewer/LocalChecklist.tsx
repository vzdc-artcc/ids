import React from 'react';
import {Typography, List, ListItem, Checkbox, FormControlLabel} from "@mui/material";

export default function LocalChecklist() {
    return (
        <div>
            <Typography variant="h6">Local Checklist</Typography>
            <List>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Review cab staffing"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Review staffed ATC above the tower"/>
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
                    <FormControlLabel control={<Checkbox/>} label="Current ATIS, observation and special airfield notes"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Non-standard conditions"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Note aircraft with clearances/TDLS"/>
                </ListItem>
                <ListItem>
                    <FormControlLabel control={<Checkbox/>} label="Review all traffic"/>
                </ListItem>
            </List>
        </div>
    );
}