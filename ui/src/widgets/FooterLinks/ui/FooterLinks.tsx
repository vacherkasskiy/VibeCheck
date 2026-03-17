import styles from './styles.module.css';

export const FooterLinks = () => {
	return (
		<footer className={styles.footer}>
			<nav className={styles.nav}>
				<a href="/privacy" className={styles.link}>
					Политика конфиденциальности
				</a>
				<span className={styles.separator}>•</span>
				<a href="/help" className={styles.link}>
					Справка
				</a>
			</nav>
		</footer>
	);
};