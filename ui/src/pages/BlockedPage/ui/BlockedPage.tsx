import { CenterGlow, HeaderGlow } from 'shared/ui';
import styles from './styles.module.css';

export const BlockedPage = () => {
	return (
		<div className={styles.page}>
			<HeaderGlow />
			<CenterGlow />
			<div className={styles.card}>
				<p className={styles.eyebrow}>Доступ ограничен</p>
				<h1 className={styles.title}>Ваш аккаунт заблокирован</h1>
				<p className={styles.text}>
					Вход в сервис временно недоступен. Чтобы узнать причину блокировки, напишите на почту для связи.
				</p>
				<div className={styles.contactBlock}>
					<span className={styles.contactLabel}>Почта для связи</span>
					<a href="mailto:vvfedotov@edu.hse.ru" className={styles.contactLink}>
						vvfedotov@edu.hse.ru
					</a>
				</div>
			</div>
		</div>
	);
};

export default BlockedPage;
