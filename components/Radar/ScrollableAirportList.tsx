"use client";

import React, {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {Box, type BoxProps} from '@mui/material';

type ScrollableAirportListProps = {
    children: ReactNode;
    maxHeight: number;
    sx?: BoxProps['sx'];
};

export default function ScrollableAirportList({children, maxHeight, sx}: ScrollableAirportListProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const lastShadowRef = useRef({top: false, bottom: false});
    const [showTopShadow, setShowTopShadow] = useState(false);
    const [showBottomShadow, setShowBottomShadow] = useState(false);

    const syncShadow = useCallback(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const hasOverflow = container.scrollHeight > container.clientHeight + 1;
        const isAtTop = container.scrollTop <= 1;
        const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

        const nextTopShadow = hasOverflow && !isAtTop;
        const nextBottomShadow = hasOverflow && !isAtBottom;

        if (
            lastShadowRef.current.top === nextTopShadow &&
            lastShadowRef.current.bottom === nextBottomShadow
        ) {
            return;
        }

        lastShadowRef.current = {top: nextTopShadow, bottom: nextBottomShadow};
        setShowTopShadow(nextTopShadow);
        setShowBottomShadow(nextBottomShadow);
    }, []);

    const scheduleShadowUpdate = useCallback(() => {
        if (rafRef.current !== null) {
            return;
        }

        rafRef.current = window.requestAnimationFrame(() => {
            rafRef.current = null;
            syncShadow();
        });
    }, [syncShadow]);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef.current;

        if (!container || !content) {
            return;
        }

        const observer = new ResizeObserver(scheduleShadowUpdate);
        scheduleShadowUpdate();

        observer.observe(container);
        observer.observe(content);

        return () => {
            if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            observer.disconnect();
        };
    }, [maxHeight, scheduleShadowUpdate]);

    return (
        <Box
            ref={containerRef}
            onScroll={scheduleShadowUpdate}
            sx={{
                overflowY: 'auto',
                maxHeight,
                boxShadow: [
                    showTopShadow ? 'inset 0 25px 25px -25px rgba(255, 255, 255, 0.7)' : null,
                    showBottomShadow ? 'inset 0 -25px 25px -25px rgba(255, 255, 255, 0.7)' : null,
                ].filter(Boolean).join(', ') || 'none',
                ...sx,
            }}
        >
            <Box ref={contentRef}>
                {children}
            </Box>
        </Box>
    );
}


