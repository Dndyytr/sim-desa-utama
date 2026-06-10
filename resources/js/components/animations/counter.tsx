import {
    // motion,
    useInView,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
    from?: number;
    to: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function AnimatedCounter({
    from = 0,
    to,
    suffix = '',
    prefix = '',
    className,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-40px' });
    const [display, setDisplay] = useState(from);

    const count = useMotionValue(from);
    const spring = useSpring(count, { stiffness: 55, damping: 14 });
    const rounded = useTransform(spring, Math.round);

    useMotionValueEvent(rounded, 'change', (v) => setDisplay(v));

    useEffect(() => {
        if (isInView) {
            count.set(from);
            requestAnimationFrame(() => count.set(to));
        }
    }, [isInView, to, from, count]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {display}
            {suffix}
        </span>
    );
}
