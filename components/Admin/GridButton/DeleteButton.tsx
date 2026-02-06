import React, {useState} from 'react';
import {GridActionsCellItem} from "@mui/x-data-grid";
import {toast} from "react-toastify";
import {Delete} from "@mui/icons-material";

export default function DeleteButton<T>({label, warningMessage, id, deleteFunction, onSuccess}: {
    label: string,
    warningMessage?: string,
    id: T,
    deleteFunction: (key: T) => Promise<void>,
    onSuccess: () => void
}) {
    const [clicked, setClicked] = useState(false);

    const handleDelete = async () => {
        if (clicked) {
            await deleteFunction(id);
            onSuccess();
        } else {
            if (warningMessage) {
                toast(warningMessage, {type: 'warning'});
            }
            setClicked(true);
        }
    }

    return (
        <GridActionsCellItem
            icon={<Delete color={clicked ? "warning" : "inherit"}/>}
            label={label}
            onClick={handleDelete}
        />
    );
}