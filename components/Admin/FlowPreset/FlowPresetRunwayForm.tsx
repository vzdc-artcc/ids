'use client';
import React, {useState} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField
} from "@mui/material";
import {Add} from "@mui/icons-material";
import {AirportRunway, FlowPresetAtisType, FlowPresetRunway} from "@/generated/prisma/browser";
import {toast} from "react-toastify";

export default function FlowPresetRunwayForm({atisType, allRunways, onSubmit}: {
    atisType: FlowPresetAtisType,
    allRunways: AirportRunway[],
    onSubmit: (runway: FlowPresetRunway) => void
}) {
    const [runway, setRunway] = useState<AirportRunway | undefined>();
    const [selectedDepartureTypes, setSelectedDepartureTypes] = useState<string[]>([]);
    const [selectedApproachTypes, setSelectedApproachTypes] = useState<string[]>([]);

    const handleSubmit = async () => {
        if (!runway || (!selectedDepartureTypes.length && !selectedApproachTypes.length)) {
            toast.error('All runway fields are required.');
            return;
        }

        onSubmit({
            id: runway.runwayIdentifier,
            flowPresetId: '',
            runwayId: runway.id,
            departureTypes: selectedDepartureTypes,
            approachTypes: selectedApproachTypes,
        });

        setRunway(undefined);
        setSelectedDepartureTypes([]);
        setSelectedApproachTypes([]);
    }

    return (
        <Stack direction="column" spacing={2}>
            <FormControl fullWidth>
                <InputLabel id="runway-select-label">Runway</InputLabel>
                <Select
                    labelId="runway-select-label"
                    variant="outlined"
                    id="runway-select"
                    value={runway?.id || ''}
                    label="Runway"
                    onChange={(e) => {
                        setSelectedDepartureTypes([]);
                        setSelectedApproachTypes([]);
                        setRunway(allRunways.find((r) => r.id === e.target.value));
                    }}
                >
                    {allRunways.map((runway) => (
                        <MenuItem key={runway.id} value={runway.id}>{runway.runwayIdentifier}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {runway && (atisType === "DEPARTURE" || atisType === "COMBINED") && (
                <Autocomplete
                    multiple
                    options={runway.availableDepartureTypes}
                    getOptionLabel={(option) => option}
                    value={runway.availableDepartureTypes.filter((u) => selectedDepartureTypes.includes(u))}
                    onChange={(event, newValue) => {
                        setSelectedDepartureTypes(newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            // eslint-disable-next-line react/jsx-key
                            <Chip {...getTagProps({index})} label={option}/>
                        ))
                    }
                    renderInput={(params) => <TextField {...params} label="Preset Departure Types"
                                                        helperText="These departure types will be automatically selected anytime this departure vATIS profile is activated."/>}
                />
            )}
            {runway && (atisType === "ARRIVAL" || atisType === "COMBINED") && (
                <Autocomplete
                    multiple
                    options={runway.availableApproachTypes}
                    getOptionLabel={(option) => option}
                    value={runway.availableApproachTypes.filter((u) => selectedApproachTypes.includes(u))}
                    onChange={(event, newValue) => {
                        setSelectedApproachTypes(newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            // eslint-disable-next-line react/jsx-key
                            <Chip {...getTagProps({index})} label={option}/>
                        ))
                    }
                    renderInput={(params) => <TextField {...params} label="Preset Approach Types"
                                                        helperText="These approach types will be automatically selected anytime this arrival vATIS profile is activated."/>}
                />
            )}
            <Box>
                <Button variant="contained" disabled={!runway} onClick={handleSubmit} startIcon={<Add/>}>Add to
                    List</Button>
            </Box>
        </Stack>
    );
}