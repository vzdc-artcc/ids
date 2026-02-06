'use client';
import React from 'react';
import {Button} from "@mui/material";
import {WifiOff} from "@mui/icons-material";
import {deleteConsolidation} from "@/actions/radarConsolidation";
import {toast} from "react-toastify";

export default function NavConsolidationDeleteButton({ id }: {id: string}) {

    const handleDelete = async () => {
        await deleteConsolidation(id);
        toast.success("Consolidation deleted successfully.");
    }

    return (
        <Button variant="contained" color="error" size="small" startIcon={<WifiOff />} onClick={handleDelete}>End session</Button>
    );
}