import prisma from "@/lib/prisma";
import {NextRequest} from "next/server";

export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    const radar = await prisma.radar.findUnique({
        where: {
            id,
        },
        include: {
            sectors: true,
        },
    });

    return Response.json(radar);
}