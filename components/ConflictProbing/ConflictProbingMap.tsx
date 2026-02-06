'use client';
import React from 'react';
import {Aircraft, AlertAircraft, ConflictProbingConfigResponse} from "@/types/conflict-probing";
import {Box, Tooltip} from "@mui/material";
import {FeatureCollection} from "geojson";
import Map, {Layer, Marker, Source} from "react-map-gl/maplibre";
import {AirplanemodeActive, Circle, Close} from "@mui/icons-material";
import 'maplibre-gl/dist/maplibre-gl.css';

export type MapOptions = {
    showAlertsOnly: boolean;
    showPredictions: boolean;
    showNonAlertDatablocks: boolean;
    showCurrentFlightLevel: boolean
    showFlightPlanAltitude: boolean;
    showVerticalSpeed: boolean;
    showGroundSpeed: boolean;
    showNextWaypoint: boolean;
}

export default function ConflictProbingMap({alerts, nonAlerts, config, mapOptions}: {
    alerts: AlertAircraft[];
    nonAlerts: Aircraft[],
    config: ConflictProbingConfigResponse,
    mapOptions: MapOptions
}) {

    const bottomLeft: [number, number] = config['BOTTOM_LEFT_LIMIT'];
    const topRight: [number, number] = config['TOP_RIGHT_LIMIT'];

    const sw: [number, number] = [bottomLeft[1], bottomLeft[0]];
    const ne: [number, number] = [topRight[1], topRight[0]];
    const se = [ne[0], sw[1]];
    const nw = [sw[0], ne[1]];

    const maskGeoJson: FeatureCollection = {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90],
                    ], [
                        sw, se, ne, nw, sw
                    ]],
                },
            },
        ],
    };


    const alertPoints = alerts.map((aircraft) => (
        <div key={`alert-aircraft-${aircraft.callsign}`}>
            {aircraft.p_steps
                // .filter((s) => Math.tan(s.mins) < 0.25)
                .map((step, i) => (
                    <Marker
                        key={`ac-${aircraft.callsign}-step-${step.mins || i}`}
                        longitude={step.longitude}
                        latitude={step.latitude}
                        anchor="center"
                    >
                        {Math.abs(aircraft.conflict_time_minutes_ahead - step.mins) < 1 ?
                            <Tooltip title={`AT ${step.altitude}`}>
                                <Close sx={{color: 'mediumpurple', fontSize: 20,}}/>
                            </Tooltip> :
                            <Circle sx={{color: aircraft.conflict_level === 'RED' ? 'red' : 'orange', fontSize: 3,}}/>
                        }
                    </Marker>
                ))}
            <Marker
                key={`ac-${aircraft.callsign}`}
                longitude={aircraft.longitude}
                latitude={aircraft.latitude}
                anchor="center"
            >
                <Box sx={{position: 'relative', pointerEvents: 'none'}}>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            lineHeight: 0,
                        }}
                    >
                        <AirplanemodeActive sx={{
                            color: aircraft.conflict_level === 'RED' ? 'red' : 'orange',
                            fontSize: 15,
                            transform: `rotate(${aircraft.heading}deg)`
                        }}/>
                    </Box>

                    {getDataBlockInformation(aircraft, mapOptions, aircraft.conflict_level)}
                </Box>
            </Marker>
        </div>
    ));

    const nonAlertPoints = nonAlerts.map((aircraft) => (
        <div key={`nonalert-aircraft-${aircraft.callsign}`}>
            {mapOptions.showPredictions && aircraft.p_steps
                .filter((s) => s.mins % 2 < 1)
                .map((step, i) => (
                    <Marker
                        key={`ac-${aircraft.callsign}-step-${step.mins || i}`}
                        longitude={step.longitude}
                        latitude={step.latitude}
                        anchor="center"
                    >
                        <Circle sx={{color: 'green', fontSize: 2,}}/>
                    </Marker>
                ))}
            <Marker
                key={`ac-${aircraft.callsign}`}
                longitude={aircraft.longitude}
                latitude={aircraft.latitude}
                anchor="center"
            >
                <Box sx={{position: 'relative', pointerEvents: 'none'}}>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            lineHeight: 0,
                        }}
                    >
                        <AirplanemodeActive
                            sx={{color: 'cyan', fontSize: 15, transform: `rotate(${aircraft.heading}deg)`}}/>
                    </Box>

                    {getDataBlockInformation(aircraft, mapOptions)}
                </Box>
            </Marker>
        </div>
    ));

    const pointsToShow = mapOptions.showAlertsOnly ? alertPoints : [...alertPoints, ...nonAlertPoints];

    return (
        <Box sx={{position: 'absolute', width: '100%', left: 0, height: '60vh',}}>
            <Map
                style={{width: '100%', height: '100%'}}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                initialViewState={{
                    longitude: (sw[0] + ne[0]) / 2,
                    latitude: (sw[1] + ne[1]) / 2,
                    zoom: 3,
                }}
            >
                <Source id="mask" type="geojson" data={maskGeoJson}>
                    <Layer
                        id="mask-layer"
                        type="fill"
                        paint={{
                            'fill-color': 'rgba(0,0,0,0.8)',
                            'fill-opacity': 0.6,
                        }}
                    />
                </Source>
                {pointsToShow}

                <Marker
                    longitude={sw[0]}
                    latitude={sw[1] - 0.5}
                    anchor="top-left"
                >
                    <Box
                        sx={{
                            color: 'hotpink',
                            fontSize: 15,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            userSelect: 'none',
                        }}
                    >
                        &copy; {new Date().getFullYear()} Virtual Washington ARTCC (vzdc.org). All rights reserved.
                        <br/>
                        Created by <b>Aneesh Reddy</b> and <b>Christos Savvopoulos</b>.
                        <br/>
                        <span style={{color: 'red',}}><b>FOR VATSIM USE ONLY</b></span>
                    </Box>
                </Marker>
            </Map>
        </Box>
    );
}

const formatVerticalSpeed = (vs: number) => (vs < 0 ? `▼ ${Math.abs(vs)}` : `▲ ${vs}`);

const getDataBlockInformation = (aircraft: Aircraft | AlertAircraft, mapOptions: MapOptions, alert?: string) => {
    if (!mapOptions.showNonAlertDatablocks && !alert) return <></>;

    return (
        <Box
            component="span"
            sx={{
                ml: 1,
                transform: 'translateY(-50%)',
                position: 'relative',
                top: '50%',
                color: 'limegreen',
                fontSize: 12,
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                display: 'inline-block',
                lineHeight: 1,
                '& br': {lineHeight: 1},
            }}
        >
            <span style={{color: alert && (alert === 'RED' ? 'red' : 'orange')}}>{aircraft.callsign}</span>


            {(mapOptions.showCurrentFlightLevel || mapOptions.showVerticalSpeed) && <br/>}
            {mapOptions.showCurrentFlightLevel && `FL${Math.floor(aircraft.altitude / 100)}`} {mapOptions.showVerticalSpeed && `${mapOptions.showCurrentFlightLevel ? '| ' : ''}${formatVerticalSpeed(aircraft.vertical_speed)} fpm`}

            {mapOptions.showFlightPlanAltitude && <br/>}
            {mapOptions.showFlightPlanAltitude && `CRZ FL${Math.floor(aircraft.cruising_altitude / 100)}`}

            {mapOptions.showGroundSpeed && <br/>}
            {mapOptions.showGroundSpeed && `${aircraft.ground_speed} kt`}

            {mapOptions.showNextWaypoint && <br/>}
            {mapOptions.showNextWaypoint && aircraft.current_route_segment[1].name}

        </Box>
    )
}