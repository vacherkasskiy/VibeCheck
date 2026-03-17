import styles from './styles.module.css';
import type { FC } from 'react';

interface SpinnerProps {
	className?: string;
}

export const Spinner: FC<SpinnerProps> = ({ className }) => (
	<div className={`${styles.spinnerContainer} ${className || ''}`}>
		<div className={styles.spinner} />
	</div>
);
