'use client';
import React, {useState} from 'react';
import {AirportRunway, FlowPreset, FlowPresetAtisType, FlowPresetRunway} from "@/generated/prisma/browser";
import {Box, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography} from "@mui/material";
import FlowPresetRunwayForm from "@/components/Admin/FlowPreset/FlowPresetRunwayForm";
import {Delete, Edit} from "@mui/icons-material";
import FormSaveButton from "@/components/Admin/Form/FormSaveButton";
import {createOrUpdateFlowPreset} from "@/actions/flowPreset";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import EditFlowPresetRunwayDialog from '@/components/Admin/FlowPreset/EditFlowPresetRunwayDialog';

export default function FlowPresetForm({icao, preset, currentRunways, allRunways,}: {
    icao: string,
    preset?: FlowPreset;
    currentRunways?: FlowPresetRunway[];
    allRunways: AirportRunway[];
}) {

    const [runways, setRunways] = useState<FlowPresetRunway[]>(currentRunways || []);
    const [atisType, setAtisType] = useState<FlowPresetAtisType>("COMBINED");
    const [editRunway, setEditRunway] = useState<FlowPresetRunway | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        formData.set('id', preset?.id || '');
        formData.set('atisType', atisType);
        formData.set('runways', JSON.stringify(runways));
        formData.set('icao', icao);
        const {errors} = await createOrUpdateFlowPreset(formData);
        if (errors) {
            toast.error(errors.map((error) => error.message).join('. '));
            return;
        }

        if (preset) {
            toast.success(`Updated flow preset ${preset.presetName}`);
        } else {
            toast.success(`Created flow preset`);
            router.push('/admin/flow-presets');
        }
    }

    const handleEditRunway = (runway: FlowPresetRunway) => {
        setEditRunway(runway);
        setIsEditDialogOpen(true);
    };

    const handleSaveRunway = (updatedRunway: FlowPresetRunway) => {
        setRunways(runways.map((runway) => runway.id === updatedRunway.id ? updatedRunway : runway));
    };

    return (
        <form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid size={{xs: 2}}>
                    <TextField required fullWidth variant="filled" label="vATIS Preset Name" name="presetName"
                               defaultValue={preset?.presetName || ''}
                               helperText="This is the name of the vATIS profile to tie this flow preset to."/>
                </Grid>
                <Grid size={{xs: 2}}>
                    <FormControl fullWidth>
                        <InputLabel id="atis-type-select-label">vATIS Type</InputLabel>
                        <Select
                            labelId="atis-type-select-label"
                            id="atis-type-select"
                            variant="outlined"
                            value={atisType}
                            label="vATIS Type"
                            onChange={(e) => {
                                setAtisType(e.target.value as FlowPresetAtisType);
                                setRunways([]);
                            }}
                        >
                            {Object.values(FlowPresetAtisType).map((type) => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs: 2, lg: 1,}}>
                    <Typography variant="h6">Saved Preset Runways</Typography>
                    {runways.length === 0 && <Typography>No runways have been added yet.</Typography>}
                    {runways.map((runway, index) => (
                        <Box key={index} sx={{mb: 1,}}>
                            <Typography>{runway.id}
                                <IconButton onClick={() => handleEditRunway(runway)}><Edit/></IconButton>
                                <IconButton onClick={() => {
                                    setRunways(runways.filter((r) => r.id !== runway.id));
                                }}><Delete/></IconButton>
                            </Typography>
                            <Typography variant="subtitle2">Preset Departure
                                Types: {runway.departureTypes.join(', ')}</Typography>
                            <Typography variant="subtitle2">Preset Approach
                                Types: {runway.approachTypes.join(', ')}</Typography>
                        </Box>
                    ))}
                </Grid>
                <Grid size={{xs: 2, lg: 1,}}>
                    <FlowPresetRunwayForm atisType={atisType} allRunways={allRunways}
                                          onSubmit={(runway) => setRunways([...(runways || []), runway])}/>
                </Grid>
                <Grid size={{xs: 2,}}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
            <EditFlowPresetRunwayDialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveRunway}
                runway={editRunway}
                allRunways={allRunways}
            />
        </form>
    );
}