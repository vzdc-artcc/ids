'use client';
import React, {useEffect, useState} from 'react';
import {Radar} from "@/generated/prisma/client";
import {Autocomplete, Button, Card, CardContent, CircularProgress, Stack, TextField, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {socket} from "@/lib/socket";
import {fetchAllRadars, updateNotams} from "@/actions/radar";

export default function RadarSettings() {

    const [allRadars, setAllRadars] = useState<Radar[]>();
    const [selectedRadar, setSelectedRadar] = useState<Radar | null>(null);
    const [notams, setNotams] = useState<string[]>([]);

    useEffect(() => {
        if (!allRadars) fetchAllRadars().then(setAllRadars);
    }, [allRadars]);

    const handleRadarChange = (newValue: Radar | null) => {
        setSelectedRadar(newValue);
        setNotams(newValue?.notams || []);
    };

    const saveNotams = async () => {
        const radar = await updateNotams(selectedRadar?.id || '', notams.filter(n => n.trim() !== ''));

        toast.success('NOTAMs updated successfully');
        socket.emit(`${radar.facilityId}-notam`, radar.notams);
    }

    const handleNotamsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotams(event.target.value.split('\n'));
    };

    if (!allRadars) {
        return <CircularProgress/>;
    }

    return (
        <Stack direction="column" spacing={2} sx={{mx: 2}}>
            <Card>
                <CardContent>
                    <Autocomplete
                        options={allRadars}
                        getOptionLabel={(option) => option.facilityId}
                        value={selectedRadar}
                        onChange={(event, newValue) => handleRadarChange(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Radar" variant="outlined"/>}
                    />
                    <Button variant="contained" size="small" sx={{mt: 2}} onClick={() => {
                        setSelectedRadar(null);
                        setAllRadars(undefined);
                    }}>Refresh Radars</Button>
                    <Typography>Use this if radar information is not in sync with what is in the IDS.</Typography>
                </CardContent>
            </Card>
            {selectedRadar && (
                <>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{selectedRadar.facilityId} Information</Typography>
                            <TextField
                                label="NOTAMs"
                                placeholder="Separate each NOTAM with a new line"
                                variant="outlined"
                                value={notams.join('\n')}
                                onChange={handleNotamsChange}
                                fullWidth
                                multiline
                                sx={{mb: 1}}
                            />
                            <Button variant="contained" onClick={saveNotams}>Save NOTAMs</Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </Stack>
    );
}