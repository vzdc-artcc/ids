'use client';
import React from 'react';
import Form from "next/form";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";
import {Button, Stack, TextField} from "@mui/material";

export default function MessageForm({ onSubmit }: { onSubmit: () => void }) {

    const sendMessage = (formData: FormData) => {
        socket.emit(`msg-${(formData.get('dest') as string).toUpperCase()}`, formData.get('message'));
        toast.success(`Message sent.`);
        onSubmit();
    }

    return (
        <Form action={sendMessage}>
            <Stack direction="column" spacing={1}>
                <TextField name="dest" variant="filled" label="Facility or CID" required fullWidth />
                <TextField name="message" variant="filled" label="Message" required fullWidth multiline rows={4} />
                <Button variant="contained" type="submit">Send</Button>
            </Stack>
        </Form>
    );
}