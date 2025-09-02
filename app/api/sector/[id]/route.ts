import prisma from "@/lib/db";
import {NextRequest} from "next/server";

export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    const sector = await prisma.radarSector.findUnique({
        where: {
            id,
        }
    });

    return Response.json(sector);
}