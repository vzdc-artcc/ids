'use client';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";

export const shouldKeepReleaseRequest = (rr: ReleaseRequestWithAll) => {
    if (!rr.released) return true;
    const now = new Date();
    switch (rr.condition) {
        case 'window':
            if (!rr.releaseTime) return true;
            return now.getTime() <= new Date(rr.releaseTime.getTime() + 1000*60*10).getTime();
        case 'before':
            if (!rr.releaseTime) return true;
            return new Date(now.getTime() - 1000*60*5).getTime() <= rr.releaseTime.getTime();
        case 'after':
            return rr.releaseTime;
        default:
            return false;
    }
}