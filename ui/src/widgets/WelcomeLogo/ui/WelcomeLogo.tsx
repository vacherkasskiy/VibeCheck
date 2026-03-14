import VibeCheckTitle from '@shared/assets/images/VibecheckTitle.svg';
import styles from './styles.module.css';

export const WelcomeLogo = () => {
	return (
		<div className={styles.logoContainer}>
			<div className={styles.logo}>
				<VibeCheckTitle className={styles.title} />
			</div>
		</div>
	);
};
