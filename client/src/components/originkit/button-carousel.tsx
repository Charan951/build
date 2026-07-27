"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    useEffect,
    useRef,
    useState,
    useCallback,
    type CSSProperties,
} from "react";

type ImageValue = string | { src?: string; srcSet?: string; alt?: string };
export interface CarouselItem {
    buttonImage?: ImageValue;
    image?: ImageValue;
    label?: string;
    cardContent?: React.ReactNode;
}

interface FontValue {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSize?: number | string;
    fontStyle?: string;
    letterSpacing?: number | string;
    lineHeight?: number | string;
}

const srcOf = (v?: ImageValue): string =>
    typeof v === "string" ? v : v?.src || "";

export interface KlarnaCarouselProps {
    items?: CarouselItem[];
    cardRadius?: number;
    imageWidth?: number;
    imageHeight?: number;
    buttonCount?: number;
    buttonSize?: number;
    buttonRadius?: number;
    curve?: number;
    gap?: number;
    labelShow?: boolean;
    labelX?: number;
    labelY?: number;
    labelColor?: string;
    labelFont?: FontValue;
    backgroundColor?: string;
    style?: CSSProperties;
    renderCardContent?: (item: CarouselItem, index: number) => React.ReactNode;
}

function modIdx(i: number, n: number) {
    return ((i % n) + n) % n;
}

function easeCubicInOut(p: number) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export default function KlarnaCarousel(props: KlarnaCarouselProps) {
    const {
        items = [],
        cardRadius = 20,
        imageWidth = 360,
        imageHeight = 520,
        buttonCount = 5,
        buttonSize = 44,
        buttonRadius = 22,
        curve = 5,
        gap = 24,
        labelShow = true,
        labelX = 0,
        labelY = 0,
        labelColor = "#000000",
        labelFont = {
            fontFamily: "Inter",
            fontWeight: 700,
            fontSize: 20,
            lineHeight: "1.3em",
            letterSpacing: "0em",
        },
        backgroundColor = "transparent",
        renderCardContent,
    } = props;

    const list = items;
    const M = list.length;

    const posRef = useRef(0);
    const [posDisplay, setPosDisplay] = useState(0);
    const rafRef = useRef<number | null>(null);
    const animRef = useRef({ startPos: 0, targetPos: 0, startTime: 0 });
    const [dir, setDir] = useState(1);

    const active = M > 0 ? modIdx(Math.round(posDisplay), M) : 0;

    const half = Math.floor(Math.min(Math.max(1, buttonCount), M) / 2);
    const buffer = half + 1;

    const cardRadiusPx =
        (Math.max(0, Math.min(20, cardRadius)) / 20) * 24;
    const buttonRadiusPx =
        (Math.max(0, Math.min(20, buttonRadius)) / 20) * (buttonSize / 2);
    const t = Math.max(0.0001, Math.min(10, curve) / 10);
    const step = buttonSize + gap;
    const dPsi = M > 0 ? ((Math.PI * 2) / M) * t : 0;
    const R = dPsi > 0 ? step / (2 * Math.sin(dPsi / 2)) : 0;
    const baseTop = buttonSize * 0.9;
    const fadeInner = Math.max(0, half - 0.4);
    const fadeEnd = half + 0.6;
    const maxPsi = Math.min(Math.PI, fadeEnd * dPsi);
    const stripHeight =
        baseTop + R * (1 - Math.cos(maxPsi)) + buttonSize / 2 + 16;

    const select = useCallback(
        (itemIdx: number) => {
            if (M === 0) return;
            const currentActive = modIdx(Math.round(posRef.current), M);
            if (itemIdx === currentActive) return;

            let delta = itemIdx - Math.round(posRef.current);
            delta = ((delta % M) + M) % M;
            if (delta > M / 2) delta -= M;
            setDir(Math.sign(delta));

            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            animRef.current = {
                startPos: posRef.current,
                targetPos: posRef.current + delta,
                startTime: performance.now(),
            };

            const DURATION = 320;
            function tick(now: number) {
                const { startPos, targetPos, startTime } = animRef.current;
                const progress = Math.min(1, (now - startTime) / DURATION);
                posRef.current =
                    startPos + (targetPos - startPos) * easeCubicInOut(progress);
                setPosDisplay(posRef.current);
                if (progress < 1) {
                    rafRef.current = requestAnimationFrame(tick);
                } else {
                    posRef.current = targetPos;
                    setPosDisplay(targetPos);
                    rafRef.current = null;
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        },
        [M]
    );

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    if (M === 0) return null;

    const center = Math.round(posDisplay);
    const renderItems: number[] = [];
    const seen = new Set<number>();
    for (let s = -buffer; s <= buffer; s++) {
        const idx = modIdx(center + s, M);
        if (!seen.has(idx)) {
            seen.add(idx);
            renderItems.push(idx);
        }
    }

    function getVisualSlot(itemIdx: number): number {
        let slot = itemIdx - posDisplay;
        slot = slot % M;
        if (slot > M / 2) slot -= M;
        if (slot < -M / 2) slot += M;
        return slot;
    }

    function slotStyle(slot: number) {
        const angle = slot * dPsi;
        const x = R * Math.sin(angle);
        const y = R * (1 - Math.cos(angle));
        const deg = (angle * 180) / Math.PI;
        const absSlot = Math.abs(slot);
        const depth = Math.max(0, 1 - (0.55 * absSlot) / Math.max(1, half));
        const scale = 0.55 + 0.45 * depth;
        const opacity =
            absSlot <= fadeInner
                ? 1
                : absSlot >= fadeEnd
                  ? 0
                  : 1 - (absSlot - fadeInner) / (fadeEnd - fadeInner);
        const zIndex = Math.round(depth * 100) + (absSlot < 0.5 ? 100 : 0);
        return { x, y, deg, scale, opacity, zIndex };
    }

    const imgSweep = 260,
        imgDip = 150;
    const imageVariants = {
        enter: (d: number) => ({
            x: d * imgSweep,
            y: imgDip,
            opacity: 0,
            scale: 0.82,
            rotate: d * 8,
        }),
        center: { x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 },
        exit: (d: number) => ({
            x: -d * imgSweep,
            y: imgDip,
            opacity: 0,
            scale: 0.82,
            rotate: -d * 8,
        }),
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                overflow: "hidden",
                boxSizing: "border-box",
                background: backgroundColor,
                padding: "16px 0",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: imageWidth,
                    minHeight: imageHeight,
                    flex: "0 0 auto",
                    borderRadius: cardRadiusPx,
                    overflow: "visible",
                    background: backgroundColor,
                }}
            >
                <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                    <motion.div
                        key={active}
                        custom={dir}
                        variants={imageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        {renderCardContent ? (
                            renderCardContent(list[active], active)
                        ) : list[active]?.cardContent ? (
                            list[active].cardContent
                        ) : srcOf(list[active]?.image) ? (
                            <img
                                src={srcOf(list[active]?.image)}
                                alt=""
                                draggable={false}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    borderRadius: cardRadiusPx,
                                }}
                            />
                        ) : null}
                    </motion.div>
                </AnimatePresence>
            </div>

            {labelShow && (
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={`label-${active}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            flex: "0 0 auto",
                            maxWidth: "100%",
                            textAlign: "center",
                            color: labelColor,
                            transform: `translate(${labelX}px, ${labelY}px)`,
                            fontFamily: labelFont?.fontFamily,
                            fontWeight: labelFont?.fontWeight as any,
                            fontSize: labelFont?.fontSize,
                            fontStyle: labelFont?.fontStyle,
                            letterSpacing: labelFont?.letterSpacing,
                            lineHeight: labelFont?.lineHeight,
                        }}
                    >
                        {list[active]?.label ?? ""}
                    </motion.div>
                </AnimatePresence>
            )}

            {M > 1 && (
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        paddingTop: "12px",
                    }}
                >
                    {list.map((item, itemIdx) => {
                        const isActive = itemIdx === active;
                        const labelText = item?.label || `Plan ${itemIdx + 1}`;

                        return (
                            <button
                                key={itemIdx}
                                type="button"
                                onClick={() => select(itemIdx)}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "9999px",
                                    fontSize: "13px",
                                    fontWeight: isActive ? 900 : 700,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    background: isActive ? "#CDFB47" : "#FFFFFF",
                                    color: "#0F1412",
                                    border: isActive ? "2px solid #0F1412" : "1px solid rgba(15,20,18,0.15)",
                                    boxShadow: isActive ? "0 10px 25px rgba(205,251,71,0.5)" : "0 2px 8px rgba(0,0,0,0.05)",
                                    transform: isActive ? "scale(1.05)" : "scale(1)",
                                }}
                            >
                                {labelText}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
