export type ChartsData = Record<string, { name: string, url: string, }[]>;

export type AirportData = {
    city: string,
    state_abbr: string,
    state_full: string,
    country: string,
    icao_ident: string,
    faa_ident: string,
    airport_name: string,
    is_military: boolean,
    hours: string,
};

export type AtcData = {
    PRIMARY_APCH_RADIO_CALL?: string,
    APCH_P_PROVIDER?: string,
    APCH_P_PROV_TYPE_CD?: string,
    SECONDARY_APCH_RADIO_CALL?: string,
    APCH_S_PROVIDER?: string,
    APCH_S_PROV_TYPE_CD?: string,
    CTL_PRVDING_HRS?: string,

    PRIMARY_DEP_RADIO_CALL?: string,
    DEP_P_PROVIDER?: string,
    DEP_P_PROV_TYPE_CD?: string,
    SECONDARY_DEP_RADIO_CALL?: string,
    DEP_S_PROVIDER?: string,
    DEP_S_PROV_TYPE_CD?: string,
    SECONDARY_CTL_PRVDING_HRS?: string,

    FACILITY_NAME?: string,
    CITY?: string,
    STATE_CODE?: string,
    COUNTRY_CODE?: string,
    FACILITY_TYPE?: string,

    TWR_CALL?: string,
    TWR_HRS?: string,
};

export type ChartData = {
    chart_name: string,
    pdf_url: string,
};

export type ChartsFetchResponse = {
    airport_data?: AirportData,
    atcData?: AtcData,
    charts?: Record<string, ChartData[]>,
} | null;

