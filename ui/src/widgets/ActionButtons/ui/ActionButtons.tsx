import { Button } from '@shared/ui';
import styles from './styles.module.css';

export const ActionButtons = () => {
	return (
		<div className={styles.container}>
			<Button variant="secondary" size="large" to="/login">
				Войти
			</Button>
			<Button variant="primary" size="large" to="/register">
				Зарегистрироваться
			</Button>
		</div>
	);
};