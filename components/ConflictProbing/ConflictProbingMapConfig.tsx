import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import {MapOptions} from "@/components/ConflictProbing/ConflictProbingMap";
import {Card, CardContent} from "@mui/material";

export default function ConflictProbingMapConfig({config, onChange}: {
    config: MapOptions,
    onChange: (newConfig: MapOptions) => void
}) {

    const booleanKeys = Object.keys(config).filter(
        (k) => typeof (config as Record<string, boolean>)[k] === 'boolean'
    ) as string[];

    const labelize = (key: string) =>
        key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase());

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Map options
                </Typography>
                <FormGroup>
                    {booleanKeys.map((key) => {
                        const checked = Boolean((config as Record<string, boolean>)[key]);
                        return (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Checkbox
                                        checked={checked}
                                        onChange={() =>
                                            onChange({
                                                ...(config as Record<string, boolean>),
                                                [key]: !checked
                                            } as MapOptions)
                                        }
                                        size="small"
                                    />
                                }
                                label={labelize(key)}
                            />
                        );
                    })}
                </FormGroup>
            </CardContent>
        </Card>

    );

}