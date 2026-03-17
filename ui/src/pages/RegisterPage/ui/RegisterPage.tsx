import { CenterGlow } from 'shared/ui/CenterGlow';
import { RegistrationForm } from 'widgets/RegistrationForm';
import styles from './styles.module.css';

export const RegisterPage = () => {
	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.container}>
				<RegistrationForm />
			</div>
		</div>
	);
};

export default RegisterPage;