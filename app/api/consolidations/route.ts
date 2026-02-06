import prisma from "@/lib/prisma";

export async function GET() {

    const allConsolidations = await prisma.radarConsolidation.findMany({
        select: {
            primarySectorId: true,
            secondarySectors: {
                select: {
                    id: true,
                },
            },
        },
    });

    return Response.json(
        allConsolidations.flatMap((consolidation) => ({
            primarySectorId: consolidation.primarySectorId,
            secondarySectorIds: consolidation.secondarySectors.map((sector) => sector.id)
        })),
    );
}