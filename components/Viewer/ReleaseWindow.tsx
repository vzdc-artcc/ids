'use client';
import React, {useState} from 'react';
import Form from "next/form";
import {Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";
import {createReleaseRequest} from "@/actions/release";
import {toast} from "react-toastify";
import {socket} from "@/lib/socket";
import {ReleaseRequestAircraftState} from "@/types";

export default function ReleaseWindow({ facilityId, onSubmit }: { facilityId: string, onSubmit?: () => void }) {

    const [initState, setInitState] = useState("PUSH");
    const [aircraftType, setAircraftType] = useState('J');

    const handleSubmit = async (formData: FormData) => {
        const { request, errors }  = await createReleaseRequest(facilityId || formData.get('origin') as string, formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('\n'));
            return;
        }

        socket.emit('new-release-request', request.id);
        toast.success(`${request.callsign} FROM ${request.origin} -> ${request.destination}`);
        onSubmit?.();
        setInitState("PUSH");
        setAircraftType('J');
    }

    return (
        <Box sx={{ mx: 2, }}>
            <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">Departure Release Request</Typography>
            <Typography textAlign="center" sx={{ mb: 2, }}>Use <b>only</b> during periods of high traffic volume or if instructed to do so by event staff or overlying ATC.</Typography>
            <Form action={handleSubmit}>
                <Grid container columns={6} spacing={1}>
                    <Grid size={2}>
                        <TextField
                            variant="filled"
                            label="RELEASE"
                            placeholder="Callsign"
                            name="callsign"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid size={2}>
                        <TextField
                            variant="filled"
                            label="TO"
                            placeholder="Destination"
                            name="destination"
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid size={2}>
                        <TextField
                            variant="filled"
                            label="FROM"
                            placeholder="Origin"
                            name="origin"
                            defaultValue={facilityId}
                            required
                            fullWidth
                            helperText={!facilityId ? "TMU IDS ONLY: Include the facility ID of the origin (ZDC, PCT, KDCA, etc.) to have it pair to the appropriate facility." : '' }
                        />
                    </Grid>

                    <Grid size={2}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel id="status-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                name="initState"
                                value={initState}
                                onChange={e => setInitState(e.target.value)}
                                required
                            >
                                {Object.values(ReleaseRequestAircraftState).filter((item) => {
                                    return isNaN(Number(item));
                                }).map((state) => (
                                    <MenuItem key={state} value={state}>{state}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={2}>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel id="aircraft-type-label">A/C Type</InputLabel>
                            <Select
                                labelId="aircraft-type-label"
                                name="aircraftType"
                                value={aircraftType}
                                onChange={e => setAircraftType(e.target.value)}
                                required
                            >
                                <MenuItem value="J">JET</MenuItem>
                                <MenuItem value="P">PROPELLER</MenuItem>
                                <MenuItem value="H">HEAVY</MenuItem>
                                <MenuItem value="S">SUPER</MenuItem>
                                <MenuItem value="FPL">OTHER</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={2}>
                        <TextField
                            variant="filled"
                            label="Free Text or NON-STANDARD departure runway (optional)"
                            helperText="Use only if there will be an impact to release time."
                            name="freeText"
                            fullWidth
                        />
                    </Grid>
                    <Grid size={6}>
                        <Button type="submit" size="large" variant="contained" sx={{ width: '100%', }}>
                            Submit
                        </Button>
                        <Typography variant="subtitle2" gutterBottom>**Text will be auto-capitalized upon submission.</Typography>
                    </Grid>
                </Grid>
            </Form>
        </Box>

    );
}