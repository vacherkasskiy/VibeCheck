import styles from './styles.module.css';

export const PersonalRecIcon = () => (
	<svg className={styles.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
		<circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
		<path d="M16 24L22 30L34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
	</svg>
);

export const FlagsIcon = () => (
	<svg className={styles.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8 40L8 8C8 6.89543 8.89543 6 10 6L30 6C31.1046 6 32 6.89543 32 8L32 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
		<path d="M32 28L20 20L32 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		<circle cx="14" cy="32" r="4" fill="currentColor"/>
		<circle cx="26" cy="38" r="4" fill="currentColor"/>
	</svg>
);

export const ConfidentIcon = () => (
	<svg className={styles.icon} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M24 4L6 16V32L24 44L42 32V16L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
		<path d="M24 20V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
		<path d="M18 24H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
	</svg>
);
