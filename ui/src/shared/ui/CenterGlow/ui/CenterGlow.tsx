import styles from './styles.module.css';
import CenterGlowSvg from '../../../assets/images/CenterGlow.svg';

export const CenterGlow = () => {
	return (
		<div className={styles.centerGlow}>
			<CenterGlowSvg className={styles.glowImage} aria-hidden="true" />
		</div>
	);
};
