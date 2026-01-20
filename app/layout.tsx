import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import React from "react";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v14-appRouter";
import {Roboto} from "next/font/google";
import {ThemeProvider} from "@mui/material/styles";
import theme from "@/theme/theme";
import Navbar from "@/components/Navbar/Navbar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Container, Typography} from "@mui/material";
import {ToastContainer} from "react-toastify";
import {Metadata} from "next";
import prisma from "@/lib/db";
import {Consolidation} from "@/components/Viewer/Consolidation";
import Script from "next/script"

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-roboto',
});

export const metadata: Metadata = {
    title: 'vZDC IDS',
    description: 'vZDC IDS',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const session = await getServerSession(authOptions);

    const myRadarConsolidation = await prisma.radarConsolidation.findFirst({
        where: {
            userId: session?.user.id || '',
        },
        include: {
            primarySector: {
                include: {
                    radar: true,
                },
            },
            secondarySectors: true,
            user: true,
        }
    });

  return (
    <html lang="en">
    <body className={roboto.variable}>
    <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
            <Navbar session={session} activeConsol={myRadarConsolidation as Consolidation}/>
            <Container maxWidth="xl" sx={{display: {xs: 'inherit', lg: 'none'},}}>
                <Typography variant="h6" textAlign="center">The I.D.S. is not made for smaller screen sizes. Please
                    increase your screen size or zoom out to access the IDS.</Typography>
            </Container>
            <Container maxWidth="xl" sx={{display: {xs: 'none', lg: 'inherit'},}}>
                {children}
            <Script
                src="https://rybbit.vzdc.org/api/script.js"
                data-site-id={process.env.NEXT_PUBLIC_RYBBIT_SITE_ID}
                strategy="afterInteractive"
            />
            </Container>
            <ToastContainer theme="dark" autoClose={1000} />
        </ThemeProvider>
    </AppRouterCacheProvider>
      </body>
    </html>
  );
}
