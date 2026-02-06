'use client';
import React, {useState} from 'react';
import {AirportRunway} from "@/generated/prisma/browser";
import {Box, Button, Stack, TextField} from "@mui/material";
import {Add} from "@mui/icons-material";
import {toast} from "react-toastify";

export default function AirportRunwayForm({onSubmit}: { onSubmit: (runway: AirportRunway) => void }) {

    const [runwayIdentifier, setRunwayIdentifier] = useState('');
    const [availableDepartureTypes, setAvailableDepartureTypes] = useState('');
    const [availableApproachTypes, setAvailableApproachTypes] = useState('');

    const handleSubmit = async () => {

        if (!runwayIdentifier || !availableDepartureTypes || !availableApproachTypes) {
            toast.error('All runway fields are required');
            return;
        }

        onSubmit({
            id: '',
            runwayIdentifier,
            availableDepartureTypes: availableDepartureTypes.split(',').map((type) => type.trim()),
            availableApproachTypes: availableApproachTypes.split(',').map((type) => type.trim()),
            inUseApproachTypes: [],
            inUseDepartureTypes: [],
            airportId: '',
        });

        setRunwayIdentifier('');
        setAvailableDepartureTypes('');
        setAvailableApproachTypes('');
    }

    return (
        <Stack direction="column" spacing={2}>
            <TextField fullWidth variant="filled" label="Runway Identifier" value={runwayIdentifier}
                       onChange={(e) => setRunwayIdentifier(e.target.value)}/>
            <TextField fullWidth variant="filled" label="Available Departure Types"
                       helperText="Seperate with a comma (,)" value={availableDepartureTypes}
                       onChange={(e) => setAvailableDepartureTypes(e.target.value)}/>
            <TextField fullWidth variant="filled" label="Available Approach Types"
                       helperText="Seperate with a comma (,)" value={availableApproachTypes}
                       onChange={(e) => setAvailableApproachTypes(e.target.value)}/>
            <Box>
                <Button variant="contained" onClick={handleSubmit} startIcon={<Add/>}>Add to List</Button>
            </Box>
        </Stack>
    );
}