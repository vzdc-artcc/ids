'use client';
import React from 'react';
import {useRouter} from "next/navigation";
import {Edit} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";

export default function EditButton({id, label, editUrl,}: { id: string, label: string, editUrl: string }) {

    const router = useRouter();

    return (
        <GridActionsCellItem
            key={id}
            icon={<Edit/>}
            label={label}
            onClick={() => router.push(editUrl)}
        />
    );
}