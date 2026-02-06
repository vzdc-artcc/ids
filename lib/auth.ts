import { betterAuth } from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import {genericOAuth} from "better-auth/plugins";

const {VATSIM_CLIENT_ID, VATSIM_CLIENT_SECRET, DEV_MODE, VATUSA_FACILITY} = process.env;
const VATSIM_BASE_URL = DEV_MODE === 'true' ? 'https://auth-dev.vatsim.net' : 'https://auth.vatsim.net';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            cid: {
                type: "string",
                required: true,
                input: false,
            },
            rating: {
                type: "number",
                required: true,
            },
            fullName: {
                type: "string",
                required: false,
            },
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
            division: {
                type: "string",
                required: false,
            },
            artcc: {
                type: "string",
                required: false,
            },
        },
    },
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "vatsim",
                    clientId: VATSIM_CLIENT_ID || "",
                    clientSecret: VATSIM_CLIENT_SECRET || "",
                    authorizationUrl: `${VATSIM_BASE_URL}/oauth/authorize`,
                    tokenUrl: `${VATSIM_BASE_URL}/oauth/token`,
                    scopes: ["email", "vatsim_details", "full_name", ],
                    getUserInfo: async (tokens) => {
                        const response = await fetch(`${VATSIM_BASE_URL}/api/user`, {
                            headers: {
                                Authorization: `Bearer ${tokens.accessToken}`,
                            },
                        });
                        const { data } = await response.json();

                        if (!DEV_MODE) {
                            const res = await fetch(`https://api.vatusa.net/v2/user/${data.cid}`);
                            const userData = await res.json();
                            if (userData.data.facility !== VATUSA_FACILITY && !userData.data.visiting_facilities.map((f: {facility: string}) => f.facility).includes(VATUSA_FACILITY)) {
                                throw new Error('User is not a member of the ARTCC.');
                            }
                        }

                        return {
                            id: data.cid.toString(),
                            emailVerified: false,
                            name: data.personal.name_full,
                            cid: data.cid,
                            rating: data.vatsim.rating.id,
                            fullName: data.personal.name_full,
                            firstName: data.personal.name_first,
                            lastName: data.personal.name_last,
                            email: data.personal.email,
                            division: data.vatsim.division.id,
                            artcc: data.vatsim.subdivision.id || 'UNKNOWN',
                        };
                    },
                },
            ],
        }),
    ],
});