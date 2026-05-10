import styles from './styles.module.css';

export const FooterLinks = () => {
	return (
		<footer className={styles.footer}>
			<nav className={styles.nav}>
				<a href="/about" className={styles.link}>
					О сервисе
				</a>
				<span className={styles.separator}>•</span>
				<a href="mailto:vvfedotov@edu.hse.ru" className={styles.link}>
					Почта для связи: vvfedotov@edu.hse.ru
				</a>
			</nav>
		</footer>
	);
};
