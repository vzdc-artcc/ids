'use client';
import React, {useState} from 'react';
import {Radar} from "@/generated/prisma/browser";
import {Autocomplete, Checkbox, Chip, FormControlLabel, Grid, Switch, TextField} from "@mui/material";
import FormSaveButton from "@/components/Admin/Form/FormSaveButton";
import {createOrUpdateRadar} from "@/actions/radar";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function RadarForm({radar, hidden}: { radar?: Radar, hidden?: boolean }) {

    const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>(radar?.atcPrefixes || []);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        formData.set('id', radar?.id || '');
        formData.set('atcPrefixes', JSON.stringify(selectedPrefixes));
        const {errors} = await createOrUpdateRadar(formData);
        if (errors) {
            toast.error(errors.map((error) => error.message).join('. '));
            return;
        }
        if (radar) {
            toast.success(`Updated radar facility ${formData.get('identifier')}`);
        } else {
            toast.success(`Created radar facility ${formData.get('identifier')}`);
            router.push('/admin/radars');
        }
    }

    return (
        <form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid size={{xs: 2, lg: 1,}}>
                    <TextField required fullWidth variant="filled" label="Facility" name="identifier"
                               defaultValue={radar?.identifier || ''} helperText="This must be unique."/>
                </Grid>
                <Grid size={{xs: 2, lg: 1,}}>
                    <TextField required fullWidth variant="filled" label="Name" name="name"
                               defaultValue={radar?.name || ''}/>
                </Grid>
                <Grid size={{xs: 2,}}>
                    <TextField required fullWidth variant="filled" label="SOP Link" name="sopLink"
                               defaultValue={radar?.sopLink || ''}
                               helperText="Must be a full URL (https://vzdc.org/publications/sop.pdf)."/>
                </Grid>
                <Grid size={{xs: 2, lg: 1,}}>
                    <FormControlLabel name="isEnrouteFacility"
                                      control={<Switch defaultChecked={radar?.isEnrouteFacility}/>}
                                      label="Is enroute facility?"/>
                </Grid>
                <Grid size={{xs: 2, lg: 1,}}>
                    <Autocomplete
                        multiple
                        options={[]}
                        value={selectedPrefixes}
                        freeSolo
                        renderTags={(value: readonly string[], getTagProps) =>
                            value.map((option: string, index: number) => {
                                const {key, ...tagProps} = getTagProps({index});
                                return (
                                    <Chip variant="filled" label={option} key={key} {...tagProps} />
                                );
                            })
                        }
                        onChange={(event, value) => {
                            setSelectedPrefixes(value.map((v) => v.toUpperCase()));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                name="atcPrefixes"
                                variant="filled"
                                helperText="Online ATC starting with these prefixes will be associated with this radar facility (Ex. RDU, PCT, IAD)."
                                label="ATC Prefixes"
                                placeholder="Prefixes (type and press ENTER after each one)"
                            />
                        )}
                    />
                </Grid>
                <Grid size={{xs: 2}}>
                    <FormControlLabel control={<Checkbox defaultChecked={hidden} name="isHidden"/>}
                                      label="Hidden from facility picker?"/>
                </Grid>
                <Grid size={{xs: 2,}}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>
    );
}