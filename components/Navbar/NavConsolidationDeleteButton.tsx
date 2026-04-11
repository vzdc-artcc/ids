'use client';
import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {DeleteForever} from "@mui/icons-material";
import {deleteConsolidation} from "@/actions/radarConsolidation";
import {toast} from "react-toastify";

export default function NavConsolidationDeleteButton({ id }: {id: string}) {

    const handleDelete = async () => {
        await deleteConsolidation(id);
        toast.success("Consolidation deleted successfully.");
    }

    return (
        <Tooltip title="Close Position">
            <IconButton color="error" size="small" onClick={handleDelete} sx={{ml: 1,}}><DeleteForever
                fontSize="inherit"/></IconButton>
        </Tooltip>
    );
}