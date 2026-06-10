import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface HoverCardProps {
    children: ReactNode;
    className?: string;
}

export function HoverCard({ children, className }: HoverCardProps) {
    return (
        <motion.div
            className={className}
            whileHover={{
                y: -3,
                boxShadow: '0 8px 25px rgba(0,0,0,0.07)',
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
        >
            {children}
        </motion.div>
    );
}
