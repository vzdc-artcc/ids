'use client';
import React, {useState} from 'react';
import {Airport, AirportRunway, Radar} from '@prisma/client';
import {
    Autocomplete,
    Box,
    Checkbox,
    Chip,
    FormControlLabel,
    Grid2,
    IconButton,
    TextField,
    Typography
} from '@mui/material';
import {Delete, Edit} from '@mui/icons-material';
import AirportRunwayForm from '@/components/Admin/Airport/AirportRunwayForm';
import {createOrUpdateAirport} from '@/actions/airport';
import {useRouter} from 'next/navigation';
import {toast} from 'react-toastify';
import FormSaveButton from '@/components/Admin/Form/FormSaveButton';
import EditRunwayDialog from '@/components/Admin/Airport/EditRunwayDialog';

export default function AirportForm({airport, hidden, currentRunways, currentRadars, primaryRadar, allRadars}: {
    airport?: Airport,
    hidden?: boolean,
    currentRunways?: AirportRunway[],
    currentRadars?: Radar[],
    primaryRadar?: Radar,
    allRadars: Radar[],
}) {
    const [icao, setIcao] = useState(airport?.icao || '');
    const [iata, setIata] = useState(airport?.iata || '');
    const [sopLink, setSopLink] = useState(airport?.sopLink || '');
    const [runways, setRunways] = useState(currentRunways || []);
    const [radars, setRadars] = useState(currentRadars?.map((radar) => radar.id) || []);
    const [primary, setPrimary] = useState(primaryRadar);
    const [editRunway, setEditRunway] = useState<AirportRunway | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        formData.set('id', airport?.id || '');
        formData.set('icao', icao || '');
        formData.set('iata', iata || '');
        formData.set('sopLink', sopLink || '');
        formData.set('runways', JSON.stringify(runways));
        formData.set('primaryRadar', primary?.id || '');
        formData.set('radars', JSON.stringify(radars));
        const {errors} = await createOrUpdateAirport(formData);
        if (errors) {
            toast.error(errors.map((error) => error.message).join('. '));
            return;
        }
        if (airport) {
            toast.success(`Updated airport ${icao}`);
        } else {
            toast.success(`Created airport ${icao}`);
            router.push('/admin/airports');
        }
    };

    const handleEditRunway = (runway: AirportRunway) => {
        setEditRunway(runway);
        setIsEditDialogOpen(true);
    };

    const handleSaveRunway = (updatedRunway: AirportRunway) => {
        setRunways(runways.map((runway) => runway.runwayIdentifier === updatedRunway.runwayIdentifier ? updatedRunway : runway));
    };

    return (
        <form action={handleSubmit}>
            <Grid2 container columns={2} spacing={2}>
                <Grid2 size={{xs: 2, md: 1}}>
                    <TextField required fullWidth variant="filled" label="ICAO" value={icao}
                               onChange={(e) => setIcao(e.target.value.toUpperCase())}/>
                </Grid2>
                <Grid2 size={{xs: 2, md: 1}}>
                    <TextField required fullWidth variant="filled" label="IATA" value={iata}
                               onChange={(e) => setIata(e.target.value.toUpperCase())}
                               helperText="This will also serve as the facility ID."/>
                </Grid2>
                <Grid2 size={{xs: 2}}>
                    <TextField required fullWidth variant="filled" label="SOP Link" value={sopLink}
                               onChange={(e) => setSopLink(e.target.value)}
                               helperText="Must be a full URL (https://vzdc.org/publications/sop.pdf)."/>
                </Grid2>
                <Grid2 size={{xs: 2, md: 1}}>
                    <Typography variant="h6">Saved Runways</Typography>
                    {runways.length === 0 && <Typography>No runways have been added yet.</Typography>}
                    {runways.map((runway, index) => (
                        <Box key={index} sx={{mb: 1}}>
                            <Typography>{runway.runwayIdentifier}
                                <IconButton onClick={() => handleEditRunway(runway)}><Edit/></IconButton>
                                <IconButton onClick={() => {
                                    setRunways(runways.filter((r) => r.runwayIdentifier !== runway.runwayIdentifier));
                                }}><Delete/></IconButton>
                            </Typography>
                            <Typography variant="subtitle2">Available Departure
                                Types: {runway.availableDepartureTypes.join(', ')}</Typography>
                            <Typography variant="subtitle2">Available Approach
                                Types: {runway.availableApproachTypes.join(', ')}</Typography>
                        </Box>
                    ))}
                </Grid2>
                <Grid2 size={{xs: 2, md: 1}}>
                    <Typography variant="h6">New Runway</Typography>
                    <AirportRunwayForm onSubmit={(runway) => setRunways([...(runways || []), runway])}/>
                </Grid2>
                <Grid2 size={{xs: 2}}>
                    <Autocomplete
                        options={allRadars}
                        getOptionLabel={(option) => option.identifier}
                        value={primary}
                        onChange={(event, newValue) => {
                            setPrimary(newValue || undefined);
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                // eslint-disable-next-line react/jsx-key
                                <Chip {...getTagProps({index})} label={option.identifier}/>
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Primary Radar Facility"
                                                            helperText="This is the facility immediately above this airport.  Assume no consolidations."/>}
                    />
                </Grid2>
                <Grid2 size={{xs: 2}}>
                    <Autocomplete
                        multiple
                        options={allRadars}
                        getOptionLabel={(option) => option.identifier}
                        value={allRadars.filter((u) => radars.includes(u.id))}
                        onChange={(event, newValue) => {
                            setRadars(newValue.map((radar) => radar.id));
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                // eslint-disable-next-line react/jsx-key
                                <Chip {...getTagProps({index})} label={option.identifier}/>
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Attached Radar Facilities"
                                                            helperText="This can be updated at any time, so don't worry if you haven't created any radar facilities yet."/>}
                    />
                </Grid2>
                <Grid2 size={{xs: 2}}>
                    <FormControlLabel control={<Checkbox defaultChecked={hidden} name="isHidden"/>}
                                      label="Hidden from facility picker?"/>
                </Grid2>
                <Grid2 size={{xs: 2}}>
                    <FormSaveButton/>
                    <Typography variant="subtitle2" sx={{mt: 1,}}>Any invalid runway departure types or approach types
                        using in flow presets for this airport will be removed.</Typography>
                </Grid2>
            </Grid2>
            <EditRunwayDialog
                open={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSaveRunway}
                runway={editRunway}
            />
        </form>
    );
}