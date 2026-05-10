import { useState } from 'react';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { RegistrationForm } from 'widgets/RegistrationForm';
import styles from './styles.module.css';

export const RegisterPage = () => {
	const [isProfileStep, setIsProfileStep] = useState(false);

	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={`${styles.container} ${isProfileStep ? styles.profileContainer : ''}`}>
				<RegistrationForm onStepChange={(step) => setIsProfileStep(step === 3)} />
			</div>
		</div>
	);
};

export default RegisterPage;
