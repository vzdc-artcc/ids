'use client';
import React, {SyntheticEvent, useEffect, useState} from 'react';
import {Airport, AirportRunway, FlowPreset, FlowPresetRunway} from "@/generated/prisma/client";
import {fetchAllAirports, updateFlow, updateLocalSplit, updateNotams, updateVatisFlag} from "@/actions/airport";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {toast} from "react-toastify";
import {socket} from "@/lib/socket";
import {fetchFlowPresetsForAirport} from "@/actions/flowPreset";

type AirportWithRunways = Airport & {
    runways: AirportRunway[];
};

type FlowPresetWithRunways = FlowPreset & {
    runways: FlowPresetRunwayWithAirportRunway[],
}

type FlowPresetRunwayWithAirportRunway = FlowPresetRunway & {
    runway: AirportRunway,
}

export default function AirportSettings() {

    const [allAirports, setAllAirports] = useState<AirportWithRunways[]>();
    const [flowPresets, setFlowPresets] = useState<FlowPresetWithRunways[]>();
    const [selectedFlowPreset, setSelectedFlowPreset] = useState<FlowPresetWithRunways | null>(null);
    const [selectedAirport, setSelectedAirport] = useState<AirportWithRunways | null>(null);
    const [runwaySettings, setRunwaySettings] = useState<{
        [key: string]: { inUseDepartureTypes: string[], inUseApproachTypes: string[] }
    }>(selectedAirport?.runways
        .reduce((acc, runway) => ({
            ...acc,
            [runway.id]: {
                inUseDepartureTypes: runway.inUseDepartureTypes,
                inUseApproachTypes: runway.inUseApproachTypes,
            },
        }), {}) || {});
    const [localSplit, setLocalSplit] = useState<string[]>(selectedAirport?.localSplit || []);
    const [notams, setNotams] = useState<string[]>(selectedAirport?.notams || []);

    useEffect(() => {
        if (!allAirports) fetchAllAirports().then(setAllAirports);
    }, [allAirports]);

    useEffect(() => {
        if (selectedAirport) {
            fetchFlowPresetsForAirport(selectedAirport.id).then(setFlowPresets);
        }
    }, [selectedAirport]);

    const handleAirportChange = (newValue: AirportWithRunways | null) => {
        setSelectedAirport(newValue);
        setSelectedFlowPreset(null);
        if (newValue) {
            setRunwaySettings(newValue.runways
                .reduce((acc, runway) => ({
                    ...acc,
                    [runway.id]: {
                        inUseDepartureTypes: runway.inUseDepartureTypes,
                        inUseApproachTypes: runway.inUseApproachTypes,
                    },
                }), {}));
            setLocalSplit(newValue.localSplit);
            setNotams(newValue.notams);
        } else {
            setRunwaySettings({});
            setLocalSplit([]);
            setNotams([]);
        }
    };

    const handleRunwayChange = (runwayId: string, type: 'inUseDepartureTypes' | 'inUseApproachTypes', values: string[]) => {
        setRunwaySettings((prev) => ({
            ...prev,
            [runwayId]: {
                ...prev[runwayId],
                [type]: values,
            },
        }));
    };

    const handleActivate = async () => {
        const {runways, errors} = await updateFlow(selectedAirport?.icao || '', runwaySettings);

        if (errors) {
            toast.error('There was an error updating the flow');
            return;
        }

        toast.success('Flow updated successfully');
        socket.emit(`${selectedAirport?.facilityId}-flow`, runways);
    }

    const saveLocalSplit = async () => {
        const {airport} = await updateLocalSplit(selectedAirport?.id || '', localSplit.filter(s => s.trim() !== ''));

        toast.success('Local Split updated successfully');
        socket.emit(`${airport.facilityId}-lcl-split`, airport.localSplit);
    }

    const saveNotams = async () => {
        const {airport} = await updateNotams(selectedAirport?.id || '', notams.filter(n => n.trim() !== ''));

        toast.success('NOTAMs updated successfully');
        socket.emit(`${airport.facilityId}-notam`, airport.notams);
    }

    const handleLocalSplitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSplit(event.target.value.split('\n'));
    };

    const handleNotamsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotams(event.target.value.split('\n'));
    };

    if (!allAirports) {
        return <CircularProgress/>;
    }

    const handleFlowPresetChange = (newFlow: FlowPresetWithRunways | null) => {
        if (newFlow) {
            const newRunwaySettings = newFlow.runways.reduce((acc, runway) => ({
                ...acc,
                [runway.runwayId]: {
                    inUseDepartureTypes: runway.departureTypes,
                    inUseApproachTypes: runway.approachTypes,
                },
            }), {});
            setRunwaySettings(newRunwaySettings);
        }
        setSelectedFlowPreset(newFlow);
    }

    const handleVatisChange = (e: SyntheticEvent, checked: boolean) => {
        if (!selectedAirport) return;
        updateVatisFlag(selectedAirport.icao, checked).then(() => {
            toast.success('Changed ATIS mode successfully');
            socket.emit(`${selectedAirport.icao}-vatis-integration`, !checked);
        });
    }

    return (
        <Stack direction="column" spacing={2} sx={{mx: 2}}>
            <Card>
                <CardContent>
                    <Autocomplete
                        options={allAirports}
                        getOptionLabel={(option) => option.icao}
                        value={selectedAirport}
                        onChange={(event, newValue) => handleAirportChange(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Airport" variant="outlined"/>}
                    />
                    <Button variant="contained" size="small" sx={{mt: 2,}} onClick={() => {
                        setSelectedAirport(null);
                        setAllAirports(undefined);
                    }}>Refresh Airports</Button>
                    <Typography>Use this if airport information is not in sync with what is in the IDS.</Typography>
                </CardContent>
            </Card>
            {selectedAirport && (
                <>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{selectedAirport.icao} Settings</Typography>
                            <Stack direction="column" spacing={2}>
                                <Grid size={{xs: 2}}>
                                    <FormControlLabel
                                        control={<Checkbox defaultChecked={selectedAirport.disableAutoAtis}
                                                           name="disableAutoAtis"/>}
                                        label="Disable vATIS Sync?" onChange={handleVatisChange}/>
                                </Grid>
                                <Autocomplete
                                    options={flowPresets || []}
                                    value={selectedFlowPreset}
                                    getOptionLabel={(option) => option.presetName}
                                    onChange={(event, newValue) => handleFlowPresetChange(newValue)}
                                    renderInput={(params) => <TextField {...params}
                                                                        label={'Select flow preset'}
                                                                        variant="filled"/>}
                                />
                                {selectedAirport.runways.map((runway) => (
                                    <Stack key={runway.id} direction="column" spacing={1}>
                                        <Typography variant="subtitle2">Runway {runway.runwayIdentifier}</Typography>
                                        <Autocomplete
                                            multiple
                                            options={runway.availableDepartureTypes}
                                            value={runwaySettings[runway.id]?.inUseDepartureTypes || []}
                                            onChange={(event, newValue) => handleRunwayChange(runway.id, 'inUseDepartureTypes', newValue)}
                                            renderInput={(params) => <TextField {...params}
                                                                                label={`Select RW${runway.runwayIdentifier} Departure Types`}
                                                                                variant="outlined"/>}
                                        />
                                        <Autocomplete
                                            multiple
                                            options={runway.availableApproachTypes}
                                            value={runwaySettings[runway.id]?.inUseApproachTypes || []}
                                            onChange={(event, newValue) => handleRunwayChange(runway.id, 'inUseApproachTypes', newValue)}
                                            renderInput={(params) => <TextField {...params}
                                                                                label={`Select RW${runway.runwayIdentifier} Approach Types`}
                                                                                variant="outlined"/>}
                                        />
                                    </Stack>
                                ))}
                                <Box>
                                    <Button variant="contained" onClick={handleActivate}>Save Flow</Button>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>{selectedAirport.icao} Information</Typography>
                            <TextField
                                label="Local Split"
                                placeholder="Separate each entry with a new line"
                                variant="outlined"
                                value={localSplit.join('\n')}
                                onChange={handleLocalSplitChange}
                                fullWidth
                                multiline
                                sx={{mb: 1,}}
                            />
                            <Button variant="contained" onClick={saveLocalSplit} sx={{mb: 2,}}>Save Local Split</Button>
                            <TextField
                                label="NOTAMs"
                                placeholder="Separate each NOTAM with a new line"
                                variant="outlined"
                                value={notams.join('\n')}
                                onChange={handleNotamsChange}
                                fullWidth
                                multiline
                                sx={{mb: 1,}}
                            />
                            <Button variant="contained" onClick={saveNotams}>Save NOTAMs</Button>
                        </CardContent>
                    </Card>
                </>
            )}
        </Stack>
    );
}