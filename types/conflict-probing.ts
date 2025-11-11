export type Aircraft = {
    callsign: string;
    latitude: number;
    longitude: number;
    altitude: number;
    ground_speed: number;
    heading: number;
    departure: string;
    arrival: string;
    route: string;
    cruising_altitude: number;
    vertical_speed: number;
    route_lat_lon: Waypoint[];
    current_route_segment: Waypoint[];
    current_route_segment_deviation_nm: number;
    p_latitude: number;
    p_longitude: number;
    p_altitude: number;
    p_steps: PredictionPoint[];
}
export type Waypoint = {
    name: string;
    latitude: number;
    longitude: number;
}
export type PredictionPoint = {
    latitude: number;
    longitude: number;
    altitude: number;
    mins: number;
}
export type AlertAircraft = Aircraft & {
    conflicting_callsign: string;
    conflict_time_minutes_ahead: number;
    conflict_level: 'YELLOW' | 'RED';
}

export type ConflictProbingResponse = {
    alerts: AlertAircraft[];
    non_alerts: Aircraft[];
    timestamp: number;
}

export type ConflictProbingConfigResponse = Record<string, any>;