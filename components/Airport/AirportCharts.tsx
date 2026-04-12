'use client';
import React, {useEffect, useState} from 'react';
import {Box, Button, ButtonGroup, CircularProgress, Typography} from "@mui/material";
import {fetchCharts} from "@/actions/charts";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {toast} from "react-toastify";

export default function AirportCharts({icao}: { icao: string, }) {

    const [charts, setCharts] = useState<Record<string, { name: string, url: string, }[]>>();
    const [airportData, setAirportData] = useState<{
        city: string,
        state_abbr: string,
        state_full: string,
        country: string,
        icao_ident: string,
        faa_ident: string,
        airport_name: string,
        is_military: boolean,
        hours: string,
    }>();
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const tv = searchParams.get('tv') || '1';

    useEffect(() => {
        setCharts(undefined);
        fetchCharts(icao).then((data) => {

            if (!data || !data.airport_data) {
                setCharts({});
                setAirportData(undefined);
                toast.info('No charts found for this airport.');
                return;
            }

            type ChartData = {
                chart_name: string,
                pdf_url: string,
            };

            const { airport_diagram, general, departure, arrival, approach } = data.charts
            setAirportData(data.airport_data);

            setCharts({
                'APD': airport_diagram ? airport_diagram.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'GEN': general ? general.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'DP': departure ? departure.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'STAR': arrival ? arrival.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'IAP': approach ? approach.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
            });
        });
    }, [icao]);

    const navigateToChart = (url: string, name: string) => {
        const current = new URLSearchParams(searchParams.toString());
        current.set(`viewer${tv}`, 'url');
        current.set(`url${tv}`, url);
        current.set(`urlName${tv}`, name);
        router.push(`${pathName}?${current.toString()}#${tv === '1' ? 'viewer' : `viewer${tv}`}`, {
            scroll: false,
        });
    };

    return (
        <Box>
            {!charts && !airportData && <CircularProgress/>}
            {airportData && <Box sx={{mb: 2, mx: 1,}}>
                <Typography variant="subtitle2">{airportData.airport_name} <span
                    style={{color: 'red',}}>{airportData.is_military ? '(MILITARY)' : ''}</span></Typography>
                <Typography
                    variant="caption">{airportData.city}, {airportData.state_full}, {airportData.country}</Typography>
                <br/>
                <Typography variant="caption" color="gold"
                            fontWeight="bold">ATTENDANCE: {airportData.hours === '24' ? 'CONTINUOUS' : (airportData.hours?.trim().length > 0 ? airportData.hours : 'NO TOWER')}</Typography>
            </Box>}
            {Object.entries(charts || {}).map(([code, charts]) => (
                <ButtonGroup
                    key={icao + 'charts' + code}
                    variant="outlined"
                    size="small"
                    color={getChartColor(code)}
                    sx={{mb: 2, flexWrap: 'wrap', 
                        '& .MuiButtonGroup-middleButton,.MuiButtonGroup-firstButton, .MuiButtonGroup-lastButton': {
                            borderRightColor: "var(--variant-outlinedBorder)",
                            borderTopRightRadius: "inherit",
                            borderBottomRightRadius: "inherit",
                            borderTopLeftRadius: 'inherit',
                            borderBottomLeftRadius: 'inherit',
                            marginLeft: 0,
                            marginBottom: '5px',
                            marginRight: '5px'
                        },
                        marginLeft:'5px'}}
                >
                    {charts.map((chart) => (
                        <Button key={chart.url}
                                onClick={() => navigateToChart(chart.url, `${icao} / ${chart.name}`)}>{chart.name}</Button>
                    ))}
                </ButtonGroup>
            ))}
        </Box>
    );

}

export const getChartColor = (chartCode: string) => {
    switch (chartCode) {
        case 'APD':
            return 'info';
        case 'DP':
            return 'error';
        case 'STAR':
            return 'success';
        case 'IAP':
            return 'warning';
        case 'GEN':
            return 'secondary';
        default:
            return 'inherit';
    }
}