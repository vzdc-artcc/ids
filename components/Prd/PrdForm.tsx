"use client";
import React, {useState} from 'react';
import {Button, Stack, TextField} from "@mui/material";

function PrdForm({startAirport, onSubmit}: {
    startAirport?: string,
    onSubmit: (origin: string, dest?: string) => Promise<void>,
}) {

    const [origin, setOrigin] = useState<string>(startAirport || '');
    const [dest, setDest] = useState('');

    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(origin, dest).then();
        }}>
            <Stack direction="row" spacing={4}>
                <TextField
                    variant="filled"
                    label="Origin"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    fullWidth
                />
                <TextField
                    variant="filled"
                    label="Destination"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    fullWidth
                />
            </Stack>

            <Button type="submit" variant="contained" sx={{width: '100%', marginTop: '1rem',}}>Search</Button>
        </form>
    );
}

export default PrdForm;