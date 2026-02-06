import {DefaultRadarConsolidation, Radar, RadarConsolidation, RadarSector, User} from "@/generated/prisma/client";

export type Consolidation = RadarConsolidation & {
    primarySector: RadarSectorWithRadar;
    secondarySectors: RadarSectorWithRadar[];
    user: User;
}

export type RadarSectorWithRadar = RadarSector & {
    radar: Radar;
}

export type DefaultRadarConsolidationWithSectors = DefaultRadarConsolidation & {
    primarySector: RadarSectorWithRadar;
    secondarySectors: RadarSectorWithRadar[];
}