'use client';
import React from 'react';
import {DefaultRadarConsolidation, Radar, RadarSector} from "@/generated/prisma/browser";
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Admin/Form/FormSaveButton";
import {createOrUpdateDefaultRadarConsolidation} from "@/actions/defaultRadarConsolidation";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

type RadarSectorWithRadars = RadarSector & {
    radar: Radar;
};

type Consolidation = DefaultRadarConsolidation & {
    primarySector: RadarSectorWithRadars;
    secondarySectors: RadarSectorWithRadars[];
};

export default function RadarConsolidationForm({consolidation, allSectors}: {
    consolidation?: Consolidation,
    allSectors: RadarSectorWithRadars[],
}) {

    const [primarySector, setPrimarySector] = React.useState<RadarSectorWithRadars | null>(consolidation?.primarySector || null);
    const [secondarySectors, setSecondarySectors] = React.useState<RadarSectorWithRadars[]>(consolidation?.secondarySectors || []);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        formData.set('id', consolidation?.id || '');
        formData.set('primarySector', primarySector?.id || '');
        formData.set('secondarySectors', JSON.stringify(secondarySectors.map((s) => s.id)));

        const {consolidation: newConsolidation, errors} = await createOrUpdateDefaultRadarConsolidation(formData);

        if (errors) {
            toast.error(errors.map((error) => error.message).join('. '));
            return;
        }

        if (consolidation) {
            toast.success(`Updated radar consolidation ${newConsolidation.name}`);
        } else {
            toast.success(`Created radar consolidation ${newConsolidation.name}`);
            router.push(`/admin/radar-consolidations`);
        }
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField required fullWidth variant="filled" label="Name" name="name"
                           defaultValue={consolidation?.name || ''}/>
                <Autocomplete
                    options={allSectors || []}
                    getOptionLabel={(option) => `${option.radar.facilityId} - ${option.identifier}`}
                    value={primarySector}
                    onChange={(event, newValue) => setPrimarySector(newValue)}
                    renderInput={(params) => <TextField {...params} label="Select Primary Sector" variant="outlined"/>}
                    sx={{mb: 2}}
                />
                <Autocomplete
                    multiple
                    options={allSectors || []}
                    disableCloseOnSelect
                    getOptionLabel={(option) => `${option.radar.facilityId} - ${option.identifier}`}
                    value={secondarySectors}
                    onChange={(event, newValue) => setSecondarySectors(newValue)}
                    renderInput={(params) => <TextField {...params} label="Select Secondary Sectors"
                                                        variant="outlined"/>}
                    sx={{mb: 2}}
                />
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </form>
    );

}