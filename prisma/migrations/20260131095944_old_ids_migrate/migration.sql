-- CreateEnum
CREATE TYPE "FlowPresetAtisType" AS ENUM ('COMBINED', 'DEPARTURE', 'ARRIVAL');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "LogModel" AS ENUM ('AIRPORT', 'AIRPORT_RUNWAY', 'FLOW_PRESET', 'FLOW_PRESET_RUNWAY', 'RADAR', 'RADAR_SECTOR', 'RADAR_CONSOLIDATION', 'DEFAULT_RADAR_CONSOLIDATION', 'AIRSPACE_DIAGRAM', 'TMU_NOTICE', 'IMPORT', 'EXPORT', 'FRONTEND_ARP_SET', 'FRONTEND_RDR_SET', 'FRONTEND_RDR_CONSOL');

-- CreateTable
CREATE TABLE "TmuNotice" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TmuNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "hiddenFromPicker" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL,
    "icao" TEXT NOT NULL,
    "iata" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "localSplit" TEXT[],
    "notams" TEXT[],
    "sopLink" TEXT NOT NULL,
    "primaryRadarId" TEXT,
    "disableAutoAtis" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirportRunway" (
    "id" TEXT NOT NULL,
    "runwayIdentifier" TEXT NOT NULL,
    "availableDepartureTypes" TEXT[],
    "availableApproachTypes" TEXT[],
    "inUseDepartureTypes" TEXT[],
    "inUseApproachTypes" TEXT[],
    "airportId" TEXT NOT NULL,

    CONSTRAINT "AirportRunway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowPreset" (
    "id" TEXT NOT NULL,
    "presetName" TEXT NOT NULL,
    "atisType" "FlowPresetAtisType" NOT NULL,
    "airportId" TEXT NOT NULL,

    CONSTRAINT "FlowPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowPresetRunway" (
    "id" TEXT NOT NULL,
    "flowPresetId" TEXT NOT NULL,
    "runwayId" TEXT NOT NULL,
    "departureTypes" TEXT[],
    "approachTypes" TEXT[],

    CONSTRAINT "FlowPresetRunway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Radar" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "atcPrefixes" TEXT[],
    "radarSplit" TEXT[],
    "notams" TEXT[],
    "isEnrouteFacility" BOOLEAN NOT NULL,
    "sopLink" TEXT NOT NULL,

    CONSTRAINT "Radar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadarSector" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT false,
    "radarId" TEXT NOT NULL,
    "defaultRadarConsolidationId" TEXT,

    CONSTRAINT "RadarSector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadarConsolidation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "primarySectorId" TEXT NOT NULL,

    CONSTRAINT "RadarConsolidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultRadarConsolidation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primarySectorId" TEXT NOT NULL,

    CONSTRAINT "DefaultRadarConsolidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirspaceDiagram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "airportId" TEXT,
    "sectorId" TEXT,

    CONSTRAINT "AirspaceDiagram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "model" "LogModel" NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseRequest" (
    "id" TEXT NOT NULL,
    "startedById" TEXT NOT NULL,
    "initTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initFacility" TEXT NOT NULL,
    "initState" TEXT NOT NULL,
    "callsign" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "aircraftType" TEXT,
    "freeText" TEXT,
    "releaseTime" TIMESTAMP(3),
    "released" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "userId" TEXT,

    CONSTRAINT "ReleaseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FacilityToTmuNotice" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FacilityToTmuNotice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_allRadars" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_allRadars_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_borderingSectors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_borderingSectors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_secondarySectors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_secondarySectors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_defaultSecondarySectors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_defaultSecondarySectors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Airport_icao_key" ON "Airport"("icao");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_iata_key" ON "Airport"("iata");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_facilityId_key" ON "Airport"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "Radar_identifier_key" ON "Radar"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Radar_facilityId_key" ON "Radar"("facilityId");

-- CreateIndex
CREATE UNIQUE INDEX "RadarConsolidation_primarySectorId_key" ON "RadarConsolidation"("primarySectorId");

-- CreateIndex
CREATE INDEX "_FacilityToTmuNotice_B_index" ON "_FacilityToTmuNotice"("B");

-- CreateIndex
CREATE INDEX "_allRadars_B_index" ON "_allRadars"("B");

-- CreateIndex
CREATE INDEX "_borderingSectors_B_index" ON "_borderingSectors"("B");

-- CreateIndex
CREATE INDEX "_secondarySectors_B_index" ON "_secondarySectors"("B");

-- CreateIndex
CREATE INDEX "_defaultSecondarySectors_B_index" ON "_defaultSecondarySectors"("B");

-- AddForeignKey
ALTER TABLE "Airport" ADD CONSTRAINT "Airport_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Airport" ADD CONSTRAINT "Airport_primaryRadarId_fkey" FOREIGN KEY ("primaryRadarId") REFERENCES "Radar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirportRunway" ADD CONSTRAINT "AirportRunway_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "Airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowPreset" ADD CONSTRAINT "FlowPreset_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "Airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowPresetRunway" ADD CONSTRAINT "FlowPresetRunway_flowPresetId_fkey" FOREIGN KEY ("flowPresetId") REFERENCES "FlowPreset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowPresetRunway" ADD CONSTRAINT "FlowPresetRunway_runwayId_fkey" FOREIGN KEY ("runwayId") REFERENCES "AirportRunway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Radar" ADD CONSTRAINT "Radar_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarSector" ADD CONSTRAINT "RadarSector_radarId_fkey" FOREIGN KEY ("radarId") REFERENCES "Radar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarConsolidation" ADD CONSTRAINT "RadarConsolidation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadarConsolidation" ADD CONSTRAINT "RadarConsolidation_primarySectorId_fkey" FOREIGN KEY ("primarySectorId") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultRadarConsolidation" ADD CONSTRAINT "DefaultRadarConsolidation_primarySectorId_fkey" FOREIGN KEY ("primarySectorId") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirspaceDiagram" ADD CONSTRAINT "AirspaceDiagram_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "Airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AirspaceDiagram" ADD CONSTRAINT "AirspaceDiagram_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseRequest" ADD CONSTRAINT "ReleaseRequest_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseRequest" ADD CONSTRAINT "ReleaseRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityToTmuNotice" ADD CONSTRAINT "_FacilityToTmuNotice_A_fkey" FOREIGN KEY ("A") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacilityToTmuNotice" ADD CONSTRAINT "_FacilityToTmuNotice_B_fkey" FOREIGN KEY ("B") REFERENCES "TmuNotice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allRadars" ADD CONSTRAINT "_allRadars_A_fkey" FOREIGN KEY ("A") REFERENCES "Airport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allRadars" ADD CONSTRAINT "_allRadars_B_fkey" FOREIGN KEY ("B") REFERENCES "Radar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_borderingSectors" ADD CONSTRAINT "_borderingSectors_A_fkey" FOREIGN KEY ("A") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_borderingSectors" ADD CONSTRAINT "_borderingSectors_B_fkey" FOREIGN KEY ("B") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondarySectors" ADD CONSTRAINT "_secondarySectors_A_fkey" FOREIGN KEY ("A") REFERENCES "RadarConsolidation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_secondarySectors" ADD CONSTRAINT "_secondarySectors_B_fkey" FOREIGN KEY ("B") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_defaultSecondarySectors" ADD CONSTRAINT "_defaultSecondarySectors_A_fkey" FOREIGN KEY ("A") REFERENCES "DefaultRadarConsolidation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_defaultSecondarySectors" ADD CONSTRAINT "_defaultSecondarySectors_B_fkey" FOREIGN KEY ("B") REFERENCES "RadarSector"("id") ON DELETE CASCADE ON UPDATE CASCADE;
