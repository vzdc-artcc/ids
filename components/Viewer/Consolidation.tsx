'use client';
import React, {useEffect, useState} from 'react';
import {DefaultRadarConsolidation, Radar, RadarConsolidation, RadarSector, User} from "@prisma/client";
import {
    createConsolidation,
    deleteConsolidation,
    fetchAllConsolidations,
    updateConsolidation
} from "@/actions/radarConsolidation";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Divider,
    FormControlLabel,
    TextField,
    Typography
} from "@mui/material";
import {fetchAllRadarSectors} from "@/actions/radarSector";
import {toast} from "react-toastify";
import {socket} from "@/lib/socket";
import {Delete, Edit} from "@mui/icons-material";
import {fetchAllDefaultRadarConsolidations} from "@/actions/defaultRadarConsolidation";
import {useSession} from 'next-auth/react';
import {fetchAllUsers} from '@/actions/user';

export type Consolidation = RadarConsolidation & {
    primarySector: RadarSectorWithRadar;
    secondarySectors: RadarSectorWithRadar[];
    user: User;
}

type RadarSectorWithRadar = RadarSector & {
    radar: Radar;
}

type DefaultRadarConsolidationWithSectors = DefaultRadarConsolidation & {
    primarySector: RadarSectorWithRadar;
    secondarySectors: RadarSectorWithRadar[];
}

export default function Consolidation({ onlyMe, onCreateSuccess }: {onlyMe?: boolean, onCreateSuccess?: () => void}) {

    const session = useSession();
    const [allUsers, setAllUsers] = useState<{id: string, firstName: string | null, lastName: string | null, fullName: string | null, cid: string}[]>();
    const [selectedUser, setSelectedUser] = useState<{id: string, firstName: string | null, lastName: string | null, fullName: string | null, cid: string} | null>();
    const [allRadarConsolidations, setAllRadarConsolidations] = useState<Consolidation[]>();
    const [yourConsolidation, setYourConsolidation] = useState<Consolidation | null>();
    const [allRadarSectors, setAllRadarSectors] = useState<RadarSectorWithRadar[]>();
    const [allDefaultConsolidations, setAllDefaultConsolidations] = useState<DefaultRadarConsolidationWithSectors[]>();
    const [primarySector, setPrimarySector] = useState<RadarSectorWithRadar | null>(yourConsolidation?.primarySector || null);
    const [secondarySectors, setSecondarySectors] = useState<RadarSectorWithRadar[]>([]);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [consolidateAllSectors, setConsolidateAllSectors] = useState<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const [all, sectors, defaults, users] = await Promise.all([
                    fetchAllConsolidations(),
                    fetchAllRadarSectors(),
                    fetchAllDefaultRadarConsolidations(),
                    fetchAllUsers(),
                ]);

                if (!isMounted) return;

                setAllRadarConsolidations(all);
                setYourConsolidation(all.find((consolidation) => consolidation.user.id === (selectedUser?.id || session.data?.user?.id)) || null);
                setAllRadarSectors(sectors);
                setAllDefaultConsolidations(defaults);
                setAllUsers(users);

                if (!selectedUser && session.data?.user) {
                    setSelectedUser(session.data.user as User);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error loading consolidation data:', error);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [session, selectedUser]);

    const handleEditToggle = (id: string | null, consolidation?: Consolidation) => {
        if (consolidation) {
            setPrimarySector(consolidation.primarySector);
            setSecondarySectors(consolidation.secondarySectors);
        } else {
            setPrimarySector(null);
            setSecondarySectors([]);
        }
        setEditMode(id);
    };

    const handleSave = async () => {

        if (yourConsolidation && editMode === null) {
            const {error} = await updateConsolidation(yourConsolidation.id, yourConsolidation.primarySector.id, [...yourConsolidation.secondarySectors, ...secondarySectors].map(sector => sector.id));
            if (error) {
                toast.error(error);
                return;
            }
            toast.success('Consolidation updated successfully');
        } else {
            if (!selectedUser) {
                toast.error('Controller is required');
                return;
            }
            if (!primarySector) {
                toast.error('Primary sector is required');
                return;
            }
            if (secondarySectors.some(sector => sector.id === primarySector.id)) {
                toast.error('Primary sector cannot be a secondary sector');
                return;
            }

            if (editMode) {
                const {error} = await updateConsolidation(editMode, primarySector.id, secondarySectors.map(sector => sector.id));
                if (error) {
                toast.error(error);
                    return;
                }
                toast.success('Consolidation updated successfully');
            } else {
                const {error} = await createConsolidation(selectedUser.id, primarySector.id, secondarySectors.map(sector => sector.id), consolidateAllSectors);
                onCreateSuccess?.()
            if (error) {
                toast.error(error);
                return;
            }
                toast.success('Consolidation created successfully');
            }
        }
        fetchAllConsolidations().then((all) => {
            setAllRadarConsolidations(all);
        }).catch((error) => {
            console.error('Error fetching consolidations:', error);
        });
        if (!yourConsolidation) {
            setPrimarySector(null);
        }
        setSecondarySectors([]);
        setEditMode(null);
        setConsolidateAllSectors(false);
        socket.emit('radar-consolidation');
    };

    const handleDelete = async (id: string) => {
        await deleteConsolidation(id);
        toast.success('Consolidation deleted successfully');
        fetchAllConsolidations().then((all) => {
            setAllRadarConsolidations(all);
        }).catch((error) => {
            console.error('Error fetching consolidations:', error);
        });
        socket.emit('radar-consolidation');
    };

    const handleDefaultConsolidationSelect = (newValue: DefaultRadarConsolidationWithSectors | null) => {
        if (newValue) {
            setPrimarySector(newValue.primarySector);
            setSecondarySectors(newValue.secondarySectors);
        }
    };

    return (
        <Box sx={{mx: 2}}>
            { !allUsers || !allDefaultConsolidations || !allRadarSectors || !allRadarConsolidations ? <CircularProgress color="inherit"/> : null }
            { !onlyMe && <Card sx={{mb: 2}}>
                <CardContent>
                    <Typography variant="h6">Active Radar Consolidations</Typography>
                    <Button variant="contained" size="small"
                            onClick={() => fetchAllConsolidations().then((all) => setAllRadarConsolidations(all)).catch((error) => console.error('Error fetching consolidations:', error))} sx={{mt: 1,}}>Refresh
                        Consolidations</Button>
                    <Typography variant="subtitle1" gutterBottom>Use this if consolidations have changed while this tab
                        was open.</Typography>
                    {(!allRadarConsolidations || !allRadarSectors) && <CircularProgress/>}
                    {allRadarConsolidations?.map((consolidation, index) => (
                        <Box key={index} sx={{mb: 2}}>
                            <Typography
                                variant="subtitle2">{consolidation.primarySector.identifier} - {consolidation.user.fullName}</Typography>
                            <Divider/>
                            {editMode === consolidation.id ? (
                                <>
                                    <Autocomplete
                                        options={allRadarSectors || []}
                                        getOptionLabel={(option) => `${option.radar.facilityId} - ${option.identifier}`}
                                        value={primarySector}
                                        onChange={(event, newValue) => setPrimarySector(newValue)}
                                        renderInput={(params) => <TextField {...params} label="Select Primary Sector"
                                                                            variant="outlined"
                                                                            helperText="This is the sector you are logged into VATSIM as."/>}
                                        sx={{mb: 2}}
                                    />
                                    <Autocomplete
                                        multiple
                                        options={allRadarSectors || []}
                                        disableCloseOnSelect
                                        getOptionLabel={(option) => `${option.radar.facilityId} - ${option.identifier}`}
                                        value={secondarySectors}
                                        onChange={(event, newValue) => setSecondarySectors(newValue)}
                                        renderInput={(params) => <TextField {...params} label="Select Secondary Sectors"
                                                                            variant="outlined"
                                                                            helperText="Leave blank if you are only assuming the FULLY DECONSOLIDATED version of the primary sector. (Ex. K -> K)."/>}
                                        sx={{mb: 2}}
                                    />
                                    <Button variant="contained" onClick={handleSave} sx={{mr: 2}}>
                                        Save
                                    </Button>
                                    <Button variant="contained" onClick={() => handleEditToggle(null)}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {consolidation.secondarySectors.length === 0 &&
                                        <Typography variant="body2">FULLY DE-CONSOLIDATED</Typography>}
                                    {consolidation.secondarySectors.map((sector, index) => (
                                        <Typography key={index} variant="body2">{sector.identifier}</Typography>
                                    ))}
                                    <Box sx={{mt: 1,}}>
                                        <Button variant="outlined" color="inherit" size="small" startIcon={<Edit/>}
                                                onClick={() => handleEditToggle(consolidation.id, consolidation)}
                                                sx={{mr: 2}}>
                                            Edit
                                        </Button>
                                        <Button variant="outlined" color="inherit" size="small" startIcon={<Delete/>}
                                                onClick={() => handleDelete(consolidation.id)}>
                                            Delete/Offline
                                        </Button>
                                    </Box>

                                </>
                            )}
                        </Box>
                    ))}
                </CardContent>
            </Card> }
            {!editMode && allRadarSectors && <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>New Radar Consolidation</Typography>
                    <Autocomplete
                        options={allUsers || []}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                        value={selectedUser}
                        onChange={(event, newValue) => setSelectedUser(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Controller" variant="outlined"/>}
                        sx={{mb: 2}}
                    />
                    <Autocomplete
                        options={allRadarSectors || []}
                        getOptionLabel={(option) => `${option.radar.facilityId} - ${option.identifier}`}
                        disabled={!!yourConsolidation}
                        value={yourConsolidation?.primarySector || primarySector}
                        onChange={(event, newValue) => setPrimarySector(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Primary Sector" variant="outlined"
                                                            helperText="This is the sector you are logged into VATSIM as."/>}
                        sx={{mb: 2}}
                    />
                    <Autocomplete
                        multiple
                        options={allRadarSectors || []}
                        disableCloseOnSelect
                        getOptionLabel={(option) => `${option.radar.facilityId} - ${option.identifier}`}
                        value={secondarySectors}
                        onChange={(event, newValue) => setSecondarySectors(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Secondary Sectors"
                                                            variant="outlined"
                                                            helperText="Leave blank if you are only assuming the FULLY DECONSOLIDATED version of the primary sector. (Ex. K -> K).  Also, if you already have a consolidation, the new secondary sectors will be added to the ones you already have."/>}
                        sx={{mb: 2}}
                    />
                    <Autocomplete
                        options={allDefaultConsolidations || []}
                        getOptionLabel={(option) => option.name}
                        onChange={(event, newValue) => handleDefaultConsolidationSelect(newValue)}
                        renderInput={(params) => <TextField {...params} label="Select Default Consolidation"
                                                            variant="outlined"
                                                            helperText="Select a default consolidation to pre-fill the primary and secondary sectors."/>}
                        sx={{mb: 2}}
                    />
                    <FormControlLabel control={<Checkbox
                        checked={consolidateAllSectors}
                        onChange={(event, checked) => setConsolidateAllSectors(checked)}
                    />}
                                      label="Claim ALL unassigned sectors?  You only use this is you are working an enroute position."/>
                    <Divider sx={{my: 2,}}/>
                    <Button variant="contained" onClick={handleSave}>
                        Create
                    </Button>
                </CardContent>
            </Card>}
        </Box>
    );
}