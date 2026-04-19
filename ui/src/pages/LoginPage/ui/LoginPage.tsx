import { CenterGlow } from 'shared/ui/CenterGlow';
import { AuthForm } from 'widgets/AuthForm';
import styles from './styles.module.css';

export const LoginPage = () => {
	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.container}>
				<AuthForm />
			</div>
		</div>
	);
};

export default LoginPage;
