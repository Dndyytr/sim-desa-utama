import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface EntranceContainerProps {
    children: ReactNode;
    stagger?: number;
    className?: string;
    once?: boolean;
    delay?: number;
}

const containerVariants = (stagger: number, delay: number): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: stagger,
            delayChildren: delay,
        },
    },
});

export function EntranceContainer({
    children,
    stagger = 0.05,
    className,
    once = true,
    delay = 0,
}: EntranceContainerProps) {
    return (
        <motion.div
            className={className}
            variants={containerVariants(stagger, delay)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: '-30px' }}
        >
            {children}
        </motion.div>
    );
}
