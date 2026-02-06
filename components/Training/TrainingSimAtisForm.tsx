'use client';
import React from 'react';
import Form from "next/form";
import {Stack, TextField} from "@mui/material";
import AirportSettings from "@/components/Viewer/AirportSettings";
import FormSaveButton from "@/components/Admin/Form/FormSaveButton";
import {toast} from "react-toastify";
import {updateAtisManual} from "@/actions/training";

export default function TrainingSimAtisForm() {

    const handleSubmit = async (formData: FormData) => {
        if (await updateAtisManual(formData)) {
            toast.success('ATIS data sent successfully');
        } else {
            toast.error('Failed to send ATIS data');
        }
    }

    return (
        <>
            <Form action={handleSubmit}>
                <Stack direction="column" spacing={2} sx={{border: 1, p: 2, mb: 2,}}>
                    <TextField variant="filled" label="ICAO" name="icao" fullWidth required/>
                    <TextField variant="filled" label="ATIS Letter" name="code" fullWidth required/>
                    <TextField variant="filled" label="Preset Name" name="preset" fullWidth required/>
                    <TextField variant="filled" label="ATIS Type" name="type" disabled value="COMBINED" fullWidth
                               required/>
                    <TextField variant="filled" label="Airport Conditions" name="conditions" fullWidth defaultValue=""/>
                    <TextField variant="filled" label="NOTAMs" name="notams" fullWidth defaultValue=""/>
                    <FormSaveButton/>
                </Stack>
            </Form>
            <AirportSettings/>
        </>

    );
}