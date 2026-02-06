'use client';
import React from 'react';
import {Button} from "@mui/material";
import {createAuthClient} from "better-auth/react";
import {genericOAuthClient} from "better-auth/client/plugins";
import {usePathname} from "next/navigation";
import {useRouter} from "next/navigation";

const authClient = createAuthClient({
    plugins: [
        genericOAuthClient(),
    ],
});

function LoginButton() {
    const pathname = usePathname();
    const router = useRouter();
    const session = authClient.useSession();

    if (session.data) {
        return (
            <Button variant="contained" color="inherit" onClick={() => authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        window.location.href = '/'
                    },
                },
            })}>
                Logout
            </Button>
        );
    } else {
        return (
            <Button variant="contained" color="inherit" onClick={() => authClient.signIn.oauth2({
                providerId: 'vatsim',
                callbackURL: pathname,
            })}>
                Login with VATSIM
            </Button>
        );
    }
}


export default LoginButton;