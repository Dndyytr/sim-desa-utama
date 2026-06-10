import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface EntranceItemProps {
    children: ReactNode;
    className?: string;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

export function EntranceItem({ children, className }: EntranceItemProps) {
    return (
        <motion.div className={className} variants={itemVariants}>
            {children}
        </motion.div>
    );
}
