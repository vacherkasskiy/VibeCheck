import { CenterGlow } from 'shared/ui/CenterGlow';
import { AppHeader } from 'widgets/AppHeader';
import { ForgotPasswordForm } from 'widgets/ForgotPasswordForm';
import styles from './styles.module.css';

export const ForgotPasswordPage = () => {
	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.headerWrap}>
				<AppHeader />
			</div>
			<div className={styles.container}>
				<ForgotPasswordForm />
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
