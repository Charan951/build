"use client";

import {
    useState,
    useEffect,
    useCallback,
    useRef,
    type CSSProperties,
} from "react";
const useIsStaticRenderer = () => false;

export interface CoverflowSlide {
    image?: { src?: string; srcSet?: string; alt?: string };
    title?: string;
    subtitle?: string;
    badge?: string;
    description?: string;
    slug?: string;
    linkUrl?: string;
}

type AutoplayDir = "leftToRight" | "rightToLeft";
type TitleCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface Smooth3DSlideshowProps {
    slides?: CoverflowSlide[];
    cardWidth?: number;
    cardHeight?: number;
    radius?: number;
    tilt?: number;
    sideTilt?: number;
    gap?: number;
    opacity?: number;
    transition?: any;
    autoplay?: boolean;
    autoplayDirection?: AutoplayDir;
    showTitle?: boolean;
    titleFont?: CSSProperties;
    titleColor?: string;
    titlePosition?: {
        position?: TitleCorner;
        paddingLeft?: number;
        paddingRight?: number;
        paddingTop?: number;
        paddingBottom?: number;
    };
    style?: CSSProperties;
    onSlideChange?: (index: number) => void;
}

const DEFAULT_SLIDES: CoverflowSlide[] = [
    {
        image: {
            src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
        },
        title: "Enterprise ERP & SaaS",
        subtitle: "Multi-tenant business management solution",
    },
    {
        image: {
            src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
        },
        title: "Hospital & Healthcare ERP",
        subtitle: "Patient management & OPD automation system",
    },
    {
        image: {
            src: "https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop",
        },
        title: "Multi-Vendor E-Commerce",
        subtitle: "Complete retail ecosystem with seller app & logistics",
    },
];

const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
const DEPTH = 240;

function cssTransition(t: any): { dur: number; ease: string } {
    const dur = t && typeof t.duration === "number" ? t.duration : 0.6;
    let ease = "cubic-bezier(0.22, 1, 0.36, 1)";
    const e = t?.ease;
    if (Array.isArray(e) && e.length === 4) {
        ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`;
    } else if (typeof e === "string") {
        const map: Record<string, string> = {
            linear: "linear",
            easeIn: "ease-in",
            easeOut: "ease-out",
            easeInOut: "ease-in-out",
        };
        ease = map[e] || "ease";
    }
    return { dur, ease };
}

export default function CoverflowGallery(props: Smooth3DSlideshowProps) {
    const COMPONENT_DEFAULTS = {
        cardWidth: 460,
        cardHeight: 320,
        radius: 6,
        tilt: 14,
        sideTilt: 8,
        gap: 9,
        opacity: 60,
        autoplay: false,
        autoplayDirection: "rightToLeft" as AutoplayDir,
        transition: {
            type: "tween",
            duration: 0.6,
            delay: 2.5,
            ease: [0.22, 1, 0.36, 1],
        },
        showTitle: true,
        titleColor: "#ffffff",
        titlePosition: {
            position: "bottomLeft" as TitleCorner,
            paddingLeft: 22,
            paddingRight: 22,
            paddingTop: 24,
            paddingBottom: 24,
        },
    };

    props = { ...COMPONENT_DEFAULTS, ...props };
    const {
        slides = DEFAULT_SLIDES,
        cardWidth = 460,
        cardHeight = 320,
        radius = 6,
        tilt = 14,
        sideTilt = 8,
        gap = 9,
        opacity = 60,
        transition,
        autoplay = false,
        autoplayDirection = "rightToLeft",
        showTitle = true,
        titleFont,
        titleColor = "#ffffff",
        titlePosition,
        style,
        onSlideChange,
    } = props;

    const tp = titlePosition || {};
    const corner: TitleCorner = tp.position || "bottomLeft";
    const isTop = corner === "topLeft" || corner === "topRight";
    const isRight = corner === "topRight" || corner === "bottomRight";
    const padLeft = tp.paddingLeft ?? 22;
    const padRight = tp.paddingRight ?? 22;
    const padTop = tp.paddingTop ?? 24;
    const padBottom = tp.paddingBottom ?? 24;

    const isStatic = useIsStaticRenderer();
    const list = slides && slides.length ? slides : DEFAULT_SLIDES;
    const n = list.length;

    const loop = true;
    const [active, setActive] = useState(0);

    useEffect(() => {
        setActive((a) => Math.max(0, Math.min(n - 1, a)));
    }, [n]);

    useEffect(() => {
        if (onSlideChange) {
            onSlideChange(active);
        }
    }, [active, onSlideChange]);

    const moveDur =
        transition && typeof transition.duration === "number"
            ? transition.duration
            : 0.6;
    const lockRef = useRef(false);
    const lock = useCallback(() => {
        lockRef.current = true;
        window.setTimeout(
            () => {
                lockRef.current = false;
            },
            Math.max(50, moveDur * 1000)
        );
    }, [moveDur]);

    const step = useCallback(
        (dir: number) => {
            if (lockRef.current) return;
            lock();
            setActive((a) => (((a + dir) % n) + n) % n);
        },
        [n, lock]
    );

    const handleCardClick = useCallback(
        (i: number) => {
            if (isStatic || lockRef.current) return;
            lock();
            setActive(i);
        },
        [isStatic, lock]
    );

    const delay =
        transition && typeof transition.delay === "number"
            ? transition.delay
            : 2.5;
    useEffect(() => {
        if (isStatic || !autoplay || n < 2) return;
        const ms = Math.max(0.3, delay) * 1000;
        const dir = autoplayDirection === "leftToRight" ? -1 : 1;
        const id = window.setInterval(() => step(dir), ms);
        return () => window.clearInterval(id);
    }, [isStatic, autoplay, autoplayDirection, delay, n, step]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                step(1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                step(-1);
            }
        },
        [step]
    );

    const { dur, ease } = cssTransition(transition);
    const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`;

    const effectiveRadius =
        (Math.max(0, Math.min(20, radius)) / 20) *
        (Math.min(cardWidth, cardHeight) / 2);
    const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;

    const rootStyle: CSSProperties = {
        ...(style || {}),
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 320,
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: `${PERSPECTIVE}px`,
        overflow: "hidden",
        outline: "none",
    };

    return (
        <div
            style={rootStyle}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            onKeyDown={isStatic ? undefined : onKeyDown}
        >
            <div
                style={{
                    position: "relative",
                    width: cardWidth,
                    height: cardHeight,
                    transformStyle: "preserve-3d",
                }}
            >
                {list.map((slide, i) => {
                    let rel = i - active;
                    if (loop) {
                        if (rel > n / 2) rel -= n;
                        if (rel < -n / 2) rel += n;
                    }
                    const ax = Math.abs(rel);
                    const visible = ax <= MAX_VISIBLE;
                    const isActive = rel === 0;
                    const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
                    const tx = rel * (gap * 30);
                    const tz = -ax * DEPTH;
                    const ry = -rel * tilt;
                    const rz = rel * sideTilt;
                    const src = slide.image?.src || "";

                    const cardStyle: CSSProperties = {
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: cardWidth,
                        height: cardHeight,
                        borderRadius: effectiveRadius,
                        overflow: "hidden",
                        transformStyle: "preserve-3d",
                        transformOrigin: "center center",
                        transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
                        transition: transitionCss,
                        opacity: visible ? 1 : 0,
                        cursor: isActive ? "default" : "pointer",
                        pointerEvents: visible && !isStatic ? "auto" : "none",
                        backgroundColor: "#1a1a1a",
                        boxShadow: isActive
                            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(205, 251, 71, 0.2)"
                            : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        border: isActive
                            ? "2px solid #CDFB47"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                    };

                    return (
                        <div
                            key={i}
                            style={cardStyle}
                            onClick={
                                isStatic ? undefined : () => handleCardClick(i)
                            }
                            aria-label={slide.title}
                            aria-hidden={!visible}
                        >
                            {src ? (
                                <img
                                    src={src}
                                    alt={slide.image?.alt || slide.title || ""}
                                    draggable={false}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                        userSelect: "none",
                                    }}
                                />
                            ) : null}

                            {showTitle && (
                                <>
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: isTop
                                                ? "linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)"
                                                : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)",
                                            pointerEvents: "none",
                                        }}
                                    />

                                    <div
                                        style={{
                                            position: "absolute",
                                            left: padLeft,
                                            right: padRight,
                                            [isTop ? "top" : "bottom"]: isTop
                                                ? padTop
                                                : padBottom,
                                            textAlign: isRight
                                                ? "right"
                                                : "left",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {slide.badge && (
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    padding: "4px 10px",
                                                    borderRadius: "12px",
                                                    background: "#CDFB47",
                                                    color: "#0F1412",
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    marginBottom: 8,
                                                    letterSpacing: "0.05em",
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                {slide.badge}
                                            </span>
                                        )}
                                        <h3
                                            style={{
                                                color: titleColor,
                                                fontSize: 22,
                                                fontWeight: 800,
                                                lineHeight: "1.2em",
                                                letterSpacing: "-0.02em",
                                                whiteSpace: "pre-line",
                                                textShadow:
                                                    "0 2px 10px rgba(0,0,0,0.6)",
                                                margin: 0,
                                                ...(titleFont || {}),
                                            }}
                                        >
                                            {slide.title}
                                        </h3>
                                        {slide.subtitle && (
                                            <p
                                                style={{
                                                    color: "#d1d5db",
                                                    fontSize: 13,
                                                    fontWeight: 500,
                                                    marginTop: 4,
                                                    margin: 0,
                                                    opacity: 0.9,
                                                }}
                                            >
                                                {slide.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}

                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "#000000",
                                    opacity: isActive ? 0 : dim,
                                    transition: `opacity ${dur}s ${ease}`,
                                    pointerEvents: "none",
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
