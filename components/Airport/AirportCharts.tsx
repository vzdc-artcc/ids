'use client';
import React, {useEffect, useState} from 'react';
import {Box, Button, ButtonGroup, CircularProgress, Grid, Typography} from "@mui/material";
import {fetchCharts} from "@/actions/charts";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {toast} from "react-toastify";
import {AirportData, AtcData, ChartData, ChartsData} from "@/types";

export default function AirportCharts({icao}: { icao: string, }) {

    const [charts, setCharts] = useState<ChartsData>();
    const [airportData, setAirportData] = useState<AirportData>();
    const [atcData, setAtcData] = useState<AtcData>();
    const router = useRouter();
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const tv = searchParams.get('tv') || '1';

    useEffect(() => {
        setCharts(undefined);
        setAirportData(undefined);
        setAtcData(undefined);
        fetchCharts(icao).then((data) => {
            if (!data) {
                setCharts({});
                setAirportData(undefined);
                setAtcData(undefined);
                toast.info('No data found for this airport.');
                return;
            }

            setAirportData(data.airport_data);
            setAtcData(data.atcData);

            if (data.charts) {
                const {airport_diagram, general, departure, arrival, approach} = data.charts
                setCharts({
                    'APD': airport_diagram ? airport_diagram.map((chart: ChartData) => ({
                        name: chart.chart_name,
                        url: chart.pdf_url
                    })) : [],

                    'DP': departure ? departure.map((chart: ChartData) => ({
                        name: chart.chart_name,
                        url: chart.pdf_url
                    })) : [],
                    'STAR': arrival ? arrival.map((chart: ChartData) => ({
                        name: chart.chart_name,
                        url: chart.pdf_url
                    })) : [],
                    'GEN': general ? general.map((chart: ChartData) => ({
                        name: chart.chart_name,
                        url: chart.pdf_url
                    })) : [],
                    'IAP': approach ? approach.map((chart: ChartData) => ({
                        name: chart.chart_name,
                        url: chart.pdf_url
                    })) : [],
                });
            } else {
                setCharts({});
            }
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

    const chartsPerRunway: Record<string, { name: string, url: string, }[]> = {};

    if (charts) {
        const approachCharts = charts['IAP'] || [];
        approachCharts.forEach((chart) => {
            const words = chart.name.split(' ');
            let lastWord = words.pop();

            if (lastWord?.endsWith(')')) {
                while (!lastWord?.startsWith('(')) {
                    lastWord = words.pop();
                }
                lastWord = words.pop();
            }

            if (lastWord) {
                if (!chartsPerRunway[lastWord]) {
                    chartsPerRunway[lastWord] = [];
                }
                chartsPerRunway[lastWord].push(chart);
            }
        });
    }

    return (
        <Box>
            {!charts && !airportData && !atcData && <CircularProgress/>}
            {(airportData || (atcData && atcData.FACILITY_TYPE?.includes("ATCT"))) &&
                <Grid container columns={4} spacing={2} sx={{mb: 2, mx: 1,}}>
                    <Grid size={2}>
                        <Typography variant="subtitle2">{airportData?.airport_name || atcData?.FACILITY_NAME} <span
                            style={{color: 'red',}}>{airportData?.is_military ? '(MILITARY)' : ''}</span></Typography>
                        <Typography
                            variant="caption">{airportData?.city || atcData?.CITY}, {airportData?.state_full || atcData?.STATE_CODE}, {airportData?.country || atcData?.COUNTRY_CODE}</Typography>
                        <br/>
                        <Typography variant="caption" color="gold"><b>ATTENDANCE: {!!atcData ?
                            (atcData.TWR_HRS === '24' ? 'CONTINUOUS' : ((atcData.TWR_HRS?.trim()?.length || 0) > 0 ? atcData.TWR_HRS : 'NO TOWER'))
                            : 'Could not fetch attendance data.'}</b> {atcData?.TWR_CALL ? <span
                            style={{color: 'lime',}}>({`${atcData.TWR_CALL}${atcData.TWR_CALL.endsWith("TOWER") ? '' : ' TOWER'}`})</span> : ''}
                        </Typography>
                    </Grid>
                    {atcData &&
                        <Grid size={1}>
                            <Typography variant="caption" fontSize={9} color="cyan">DEP
                                PRIMARY: {atcData.PRIMARY_DEP_RADIO_CALL} ({atcData.DEP_P_PROVIDER}{getProviderType(atcData.DEP_P_PROV_TYPE_CD)})</Typography>
                            <br/>
                            <Typography variant="caption" fontSize={9} color="cyan">APCH
                                PRIMARY: {atcData.PRIMARY_APCH_RADIO_CALL} ({atcData.APCH_P_PROVIDER}{getProviderType(atcData.APCH_P_PROV_TYPE_CD)})</Typography>
                            <br/>
                            <Typography variant="caption" fontSize={8}
                                        color="text.secondary">{atcData.CTL_PRVDING_HRS == '24' ? '' : atcData.CTL_PRVDING_HRS}</Typography>
                        </Grid>}
                    {atcData && atcData.SECONDARY_DEP_RADIO_CALL &&
                        <Grid size={1}>
                            <Typography variant="caption" fontSize={9}>DEP
                                SECONDARY: {atcData.SECONDARY_DEP_RADIO_CALL} ({atcData.DEP_S_PROVIDER}{getProviderType(atcData.DEP_S_PROV_TYPE_CD)})</Typography>
                            <br/>
                            <Typography variant="caption" fontSize={9}>APCH
                                SECONDARY: {atcData.SECONDARY_APCH_RADIO_CALL} ({atcData.APCH_S_PROVIDER}{getProviderType(atcData.APCH_S_PROV_TYPE_CD)})</Typography>
                            <br/>
                            <Typography variant="caption" fontSize={8}
                                        color="text.secondary">{atcData.SECONDARY_CTL_PRVDING_HRS == '24' ? '' : atcData.SECONDARY_CTL_PRVDING_HRS}</Typography>
                        </Grid>}
                </Grid>
            }
            <Grid container columns={4}>
                {Object.entries(charts || {}).map(([code, charts]) => {
                    if (code === 'IAP') {
                        return (
                            <Grid key={icao + 'rwys'} size={4}>
                                <Grid container columns={5}>
                                    {Object.entries(chartsPerRunway).map(([runway, charts]) => (
                                        <Grid key={icao + runway} size={1} sx={{ border: 1, p: 1, textAlign: 'center', }}>
                                            <Typography color="hotpink" fontWeight="bold">{runway}</Typography>
                                            <ButtonGroup
                                                key={icao + 'charts' + code}
                                                variant="outlined"
                                                fullWidth
                                                orientation="vertical"
                                                size="small"
                                                color={getChartColor(code)}
                                            >
                                                {charts.map((chart) => (
                                                    <Button key={chart.url}
                                                            onClick={() => navigateToChart(chart.url, `${icao} / ${chart.name}`)}>{chart.name}</Button>
                                                ))}
                                            </ButtonGroup>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )
                    }
                    return (
                        <Grid key={icao + 'charts' + code} size={1} sx={{ borderLeft: 1, p: 1, textAlign: 'center', }}>
                            {/*<Typography variant="caption">{code}</Typography>*/}
                            <ButtonGroup
                                variant="outlined"
                                size="small"
                                color={getChartColor(code)}
                                orientation="vertical"
                                fullWidth
                            >
                                {charts.map((chart) => (
                                    <Button key={chart.url}
                                            onClick={() => navigateToChart(chart.url, `${icao} / ${chart.name}`)}>{chart.name}</Button>
                                ))}
                            </ButtonGroup>
                        </Grid>
                    )
                })}
            </Grid>
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

const getProviderType = (code: string | undefined) => {
    switch (code) {
        case 'A':
            return ' ATCT';
        case 'C':
            return ' ARTCC';
        case 'S':
            return ' SPECIAL';
        case 'T':
            return ' TRACON';
        default:
            return 'N/A';
    }
}