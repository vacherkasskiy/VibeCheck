import styles from './styles.module.css';
import type { ReactNode } from 'react';

interface BadgeProps {
	icon?: string;
	variant: 'success' | 'danger';
	rotation?: number;
	size?: 'small' | 'medium' | 'large';
	children: ReactNode;
}

export const Badge = ({ icon, variant, rotation = 0, size = 'small', children }: BadgeProps) => {
	return (
		<div
			className={`${styles.badge} ${styles[variant]} ${styles[size]}`}
			style={{ transform: `rotate(${rotation}deg)` }}
		>
			<span className={styles.text}>{children}</span>
		</div>
	);
};
