'use client';
import React, {useState} from 'react';
import {Box, Button, Card, CardContent, Checkbox, Divider, FormControlLabel, Typography} from "@mui/material";
import {Download} from "@mui/icons-material";
import {saveAs} from "file-saver";
import {toast} from "react-toastify";
import {importConfigFile} from "@/actions/config";

export default function Page() {

    const [agree, setAgree] = useState(false);
    const [loading, setLoading] = useState(false);

    const downloadExportFile = () => {
        setLoading(true);
        saveAs('/api/export');
        setLoading(false);
    }

    const submitConfigFile = async (formData: FormData) => {

        setLoading(true);

        if ((formData.get('config') as File).size === 0) {
            toast.error("No file selected");
            return;
        }

        const configFile = formData.get('config') as File;
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const zip = new Uint8Array(event.target?.result as ArrayBuffer);
                console.log(zip);
                importConfigFile(zip).then(() => {
                    toast.success("Configuration imported successfully");
                }).catch(() => {
                    toast.error("Error importing configuration, make sure it is unchanged from the export.");
                }).finally(() => {
                    setLoading(false);
                    setAgree(false);
                });
            } catch (e) {
                console.log(e);
                toast.error("Error parsing JSON file");
                setLoading(false);
            }
        };

        reader.onerror = () => {
            toast.error("Error reading file");
            setLoading(false);
        };

        reader.readAsArrayBuffer(configFile);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Import/Export Configuration</Typography>
                <Typography variant="h6" gutterBottom>Export Configuration</Typography>
                <Button variant="contained" size="large" loading={loading} startIcon={<Download/>}
                               onClick={downloadExportFile}>Download</Button>
                <Typography>Export the current configuration to a zip file. This will take a FEW MINUTES to process. <b>!!
                    DO NOT CLICK MULTIPLE TIMES !!</b></Typography>
                <Divider sx={{my: 2,}}/>
                <Typography variant="h6" gutterBottom>Import Configuration</Typography>
                <form action={submitConfigFile}>
                    <Box>
                        <input type="file" accept=".zip" name="config"/>
                        <Box sx={{color: 'red', my: 2,}}>
                            <Typography variant="h5" gutterBottom>THIS ACTION WILL DELETE THE EXISTING CONFIGURATION
                                PERMANENTLY:</Typography>
                            <Typography>ALL Airports</Typography>
                            <Typography>ALL Airport Runways</Typography>
                            <Typography>ALL Radar Facilities</Typography>
                            <Typography>ALL Radar Sectors</Typography>
                            <Typography>ALL Flow Presets</Typography>
                            <Typography>ALL Flow Preset Runways</Typography>
                            <Typography>ALL Default Radar Consolidations</Typography>
                            <Typography>ALL Airspace Diagrams</Typography>
                        </Box>
                        <FormControlLabel
                            control={<Checkbox name="agree" value={agree} onChange={(e, v) => setAgree(v)}/>}
                            label="Do you understand EVERYTHING above?"/>
                        <Button type="submit" variant="contained" color="error" loading={loading}
                                       disabled={!agree}>Activate
                            Configuration</Button>
                    </Box>
                </form>

            </CardContent>
        </Card>
    );
}