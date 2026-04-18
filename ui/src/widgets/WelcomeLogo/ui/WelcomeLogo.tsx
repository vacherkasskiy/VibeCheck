import VibeCheckTitle from '@shared/assets/VibecheckTitle';
import styles from './styles.module.css';

export const WelcomeLogo = () => {
	return (
		<div className={styles.logoContainer}>
			<div className={styles.logo}>
				<VibeCheckTitle
					className={styles.title}
					aria-label="VibeCheck"
					preserveAspectRatio="xMidYMid meet"
				/>
			</div>
		</div>
	);
};
