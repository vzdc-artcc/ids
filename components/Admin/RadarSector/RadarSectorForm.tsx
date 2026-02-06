'use client';
import React from 'react';
import {Radar, RadarSector} from "@/generated/prisma/browser";
import {Autocomplete, Chip, Grid, TextField} from "@mui/material";
import FormSaveButton from "@/components/Admin/Form/FormSaveButton";
import {toast} from "react-toastify";
import {createOrUpdateRadarSector} from "@/actions/radarSector";
import {useRouter} from 'next/navigation';

export default function RadarSectorForm({radarSector, borderingSectors, radar, allRadars, allRadarSectors,}: {
    radarSector?: RadarSector,
    borderingSectors?: RadarSector[],
    radar: Radar,
    allRadars: Radar[],
    allRadarSectors: RadarSector[]
}) {

    const [sectors, setSectors] = React.useState<string[]>(borderingSectors?.map((s) => s.id) || []);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        formData.set('id', radarSector?.id || '');
        formData.set('radarId', radar.id);
        formData.set('borderingSectors', JSON.stringify(sectors));

        const {errors} = await createOrUpdateRadarSector(formData);

        if (errors) {
            toast.error(errors.map((error) => error.message).join('. '));
            return;
        }

        if (radarSector) {
            toast.success(`Updated radar sector ${formData.get('identifier')}`);
        } else {
            toast.success(`Created radar sector ${formData.get('identifier')}`);
        }
        router.push(`/admin/radars/${formData.get('radarId')}/sectors`);
    }

    return (
        <form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid size={{xs: 2, lg: 1,}}>
                    <TextField required fullWidth variant="filled" label="Identifier" name="identifier"
                               defaultValue={radarSector?.identifier || ''}/>
                </Grid>
                <Grid size={{xs: 2, lg: 1,}}>
                    <TextField required fullWidth variant="filled" label="Frequency" name="frequency"
                               defaultValue={radarSector?.frequency || ''} helperText="XXX.XXX Ex. 119.850"/>
                </Grid>
                <Grid size={{xs: 2,}}>
                    <Autocomplete
                        multiple
                        options={allRadarSectors}
                        getOptionLabel={(option) => `${getRadarFromSector(option, allRadars)?.identifier} - ${option.identifier}`}
                        value={allRadarSectors.filter((u) => sectors.includes(u.id))}
                        onChange={(event, newValue) => {
                            setSectors(newValue.map((radar) => radar.id));
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                // eslint-disable-next-line react/jsx-key
                                <Chip {...getTagProps({index})}
                                      label={`${getRadarFromSector(option, allRadars)?.identifier} - ${option.identifier}`}/>
                            ))
                        }
                        renderInput={(params) => <TextField {...params} label="Bordering Radar Sectors"
                                                            helperText="This can include sectors outside of this facility (Ex. A PCT sector can border a ZDC sector).  This can be updated at any time.  Include only the sectors this one border WHEN FULLY DECONSOLIDATED."/>}
                    />
                </Grid>
                <Grid size={{xs: 2,}}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>
    );

}

const getRadarFromSector = (sector: RadarSector, radars: Radar[]) => {
    return radars.find((r) => r.id === sector.radarId);
}