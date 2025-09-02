-- CreateTable
CREATE TABLE "ReleaseRequest" (
    "id" TEXT NOT NULL,
    "startedById" TEXT NOT NULL,
    "initTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initFacility" TEXT NOT NULL,
    "lastReplyById" TEXT,
    "callsign" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "aircraftType" TEXT,
    "freeText" TEXT,
    "releaseTime" TIMESTAMP(3),
    "replyTextHistory" TEXT[],

    CONSTRAINT "ReleaseRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReleaseRequest" ADD CONSTRAINT "ReleaseRequest_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseRequest" ADD CONSTRAINT "ReleaseRequest_lastReplyById_fkey" FOREIGN KEY ("lastReplyById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
