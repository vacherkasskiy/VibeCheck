import styles from './styles.module.css';
import HeaderGlowSvg from '../../../assets/HeaderGlow';

export const HeaderGlow = () => {
	return (
		<div className={styles.headerGlow}>
			<HeaderGlowSvg className={styles.glowImage} aria-hidden="true" />
		</div>
	);
};
