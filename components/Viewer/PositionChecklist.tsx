import React, {useState} from 'react';
import {Typography, Button, Stack} from "@mui/material";
import RadarChecklist from './RadarChecklist';
import LocalChecklist from './LocalChecklist';
import EnrouteChecklist from './EnrouteChecklist';

export default function PositionChecklist() {
    const [positionType, setPositionType] = useState<'radar' | 'local' | 'enroute'>('radar');

    return (
        <Stack spacing={2}>
            <Typography variant="h5">Position Relief Checklist</Typography>
            <Stack direction="row" spacing={2}>
                <Button variant={positionType === 'radar' ? 'contained' : 'outlined'}
                        onClick={() => setPositionType('radar')}>
                    Radar
                </Button>
                <Button variant={positionType === 'local' ? 'contained' : 'outlined'}
                        onClick={() => setPositionType('local')}>
                    Local
                </Button>
                <Button variant={positionType === 'enroute' ? 'contained' : 'outlined'}
                        onClick={() => setPositionType('enroute')}>
                    Enroute
                </Button>
            </Stack>
            {positionType === 'radar' ? <RadarChecklist/> : positionType === 'local' ? <LocalChecklist/> : <EnrouteChecklist/>}
        </Stack>
    );
}