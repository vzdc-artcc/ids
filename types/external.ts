export type AtisUpdate = {
    facility: string,
    preset: string,
    atisLetter: string,
    atisType: string,
    airportConditions: string,
    notams: string,
    timestamp: Date,
    version: string,
}

export type PreferredRoute = {
    origin: string,
    route: string,
    destination: string,
    hours1?: string,
    hours2?: string,
    hours3?: string,
    type?: string,
    area?: string,
    altitude?: string,
    aircraft?: string,
    flow?: string,
    seq?: number,
    d_artcc: string,
    a_artcc: string,
}