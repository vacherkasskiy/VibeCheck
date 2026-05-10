import { useAuth } from 'features/auth';
import { Link } from 'react-router-dom';
import { UserNavButton } from 'shared/ui/UserNavButton';
import styles from './styles.module.css';

export const AppHeader = () => {
	const { state } = useAuth();

	return (
		<header className={styles.header}>
			<Link to={state.isAuthenticated ? '/recommendations' : '/'} className={styles.brand}>
				<img
					src="/assets/vibecheck-favicon.png"
					alt="VibeCheck"
					className={styles.logo}
				/>
				<span className={styles.brandText}>VibeCheck</span>
			</Link>

			<div className={styles.actions}>
				{state.isAuthenticated ? (
					<UserNavButton />
				) : (
					<div className={styles.authLinks}>
						<Link to="/login" className={styles.navLink}>
							Войти
						</Link>
						<Link to="/register" className={styles.primaryLink}>
							Регистрация
						</Link>
					</div>
				)}
			</div>
		</header>
	);
};
