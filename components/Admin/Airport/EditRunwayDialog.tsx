'use client';
import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import {AirportRunway} from '@/generated/prisma/client';

interface EditRunwayDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (runway: AirportRunway) => void;
    runway: AirportRunway | null;
}

const EditRunwayDialog: React.FC<EditRunwayDialogProps> = ({open, onClose, onSave, runway}) => {
    const [runwayIdentifier, setRunwayIdentifier] = useState(runway?.runwayIdentifier || '');
    const [availableDepartureTypes, setAvailableDepartureTypes] = useState(runway?.availableDepartureTypes.join(', ') || '');
    const [availableApproachTypes, setAvailableApproachTypes] = useState(runway?.availableApproachTypes.join(', ') || '');

    const handleSave = () => {
        if (runway) {
            onSave({
                ...runway,
                runwayIdentifier,
                availableDepartureTypes: availableDepartureTypes.split(',').map(type => type.trim()),
                availableApproachTypes: availableApproachTypes.split(',').map(type => type.trim()),
            });
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Edit Runway</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    variant="filled"
                    label="Runway Identifier"
                    value={runwayIdentifier}
                    onChange={(e) => setRunwayIdentifier(e.target.value)}
                    margin="dense"
                />
                <TextField
                    fullWidth
                    variant="filled"
                    label="Available Departure Types"
                    helperText="Separate with a comma (,)"
                    value={availableDepartureTypes}
                    onChange={(e) => setAvailableDepartureTypes(e.target.value)}
                    margin="dense"
                />
                <TextField
                    fullWidth
                    variant="filled"
                    label="Available Approach Types"
                    helperText="Separate with a comma (,)"
                    value={availableApproachTypes}
                    onChange={(e) => setAvailableApproachTypes(e.target.value)}
                    margin="dense"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">Cancel</Button>
                <Button onClick={handleSave} color="primary">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditRunwayDialog;