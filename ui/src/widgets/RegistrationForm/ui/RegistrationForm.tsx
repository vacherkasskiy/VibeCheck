import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockAuth } from 'shared/model/mockAuth';
import { AuthButton } from 'shared/ui/AuthButton';
import { InputField } from 'shared/ui/InputField';
import { PasswordInput } from 'shared/ui/PasswordInput';
import { ProgressBar } from 'shared/ui/ProgressBar/ui/ProgressBar';
// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { ProfileForm } from 'widgets/ProfileForm';
import styles from './styles.module.css';
 
// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { VerificationForm } from '../../VerificationForm';

export const RegistrationForm = () => {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');

	const STEPS = ['Email', 'Код', 'Профиль'];

	const validateEmail = (value: string): string => {
		if (!value) {
			return 'Обязательное поле';
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(value)) {
			return 'Неверный формат email';
		}
		return '';
	};

	const validatePassword = (value: string): boolean => {
		if (value.length < 8) return false;
		if (!/[A-Z]/.test(value)) return false;
		if (!/\d/.test(value)) return false;
		if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return false;
		return true;
	};

	const handleEmailChange = (value: string) => {
		setEmail(value);
		setEmailError(validateEmail(value));
		setGeneralError('');
	};

	const handlePasswordChange = (value: string) => {
		setPassword(value);
		if (value && !validatePassword(value)) {
			setPasswordError('Пароль не соответствует требованиям');
		} else {
			setPasswordError('');
		}
		if (confirmPassword && value !== confirmPassword) {
			setConfirmPasswordError('Пароли не совпадают');
		} else {
			setConfirmPasswordError('');
		}
	};

	const handleConfirmPasswordChange = (value: string) => {
		setConfirmPassword(value);
		if (value !== password) {
			setConfirmPasswordError('Пароли не совпадают');
		} else {
			setConfirmPasswordError('');
		}
	};

	const handleEmailSubmit = async () => {
		const emailValidationError = validateEmail(email);
		if (emailValidationError) {
			setEmailError(emailValidationError);
			return;
		}

		if (!validatePassword(password)) {
			setPasswordError('Пароль не соответствует требованиям');
			return;
		}

		if (password !== confirmPassword) {
			setConfirmPasswordError('Пароли не совпадают');
			return;
		}

		setIsLoading(true);
		setGeneralError('');

		try {
			const res = await mockAuth.registerInit({ email, password });
			if (res.ok) {
				setStep(2);
			} else if (res.data.code === 'EMAIL_EXISTS') {
				setEmailError('Пользователь с таким e-mail уже зарегистрирован. Попробуйте войти');
			} else {
				setGeneralError(res.data.message || 'Ошибка регистрации');
			}
		} catch {
			setGeneralError('Ошибка соединения. Проверьте интернет.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		try {
			const { data } = await mockAuth.googleUrl();
			if (data.url) {
				window.location.href = data.url;
			}
		} catch {
			setGeneralError('Ошибка при подключении Google');
		}
	};

	const handleBack = () => {
		if (step === 1) {
			navigate('/');
		} else {
			setStep(step - 1);
		}
	};

	const renderStep1 = () => (
		<>
			<div className={styles.header}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<img src="/assets/vibecheck-favicon.png" alt="VibeCheck" style={{ width: 64, height: 50, borderRadius: 6 }} />
				</div>
				<h1 className={styles.title}>Создать аккаунт</h1>
				<p className={styles.subtitle}>Введите почту и пароль для регистрации</p>
			</div>

			<InputField
				label="Email"
				type="email"
				value={email}
				onChange={handleEmailChange}
				placeholder="example@mail.ru"
				required
				error={emailError}
			/>

			<PasswordInput
				label="Пароль"
				value={password}
				onChange={handlePasswordChange}
				required
				error={passwordError}
				showValidation
			/>

			<PasswordInput
				label="Подтверждение пароля"
				value={confirmPassword}
				onChange={handleConfirmPasswordChange}
				required
				error={confirmPasswordError}
			/>

			{generalError && <div className={styles.generalError}>{generalError}</div>}

			<div className={styles.submitButton}>
				<AuthButton variant="submit" fullWidth onClick={handleEmailSubmit} disabled={isLoading}>
					{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
				</AuthButton>
			</div>

			<div className={styles.divider}>
				<span>Или продолжить с</span>
			</div>

			<AuthButton variant="google" onClick={handleGoogleLogin} fullWidth>
				Войти через Google
			</AuthButton>

			<div className={styles.registerLink}>
				<span>Уже есть аккаунт? </span>
				<Link to="/login">Войти</Link>
			</div>
		</>
	);

	const renderStep2 = () => (
		<VerificationForm
			email={email}
			onSuccess={() => setStep(3)}
			onBack={() => setStep(1)}
		/>
	);

	const renderStep3 = () => (
		<ProfileForm
			email={email}
			onSubmit={() => navigate('/flags')}
			onBack={() => setStep(2)}
		/>
	);

	return (
		<div className={styles.page}>
			<div className={styles.container}>
				<button type="button" className={styles.backButton} onClick={handleBack}>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M12 4L6 10L12 16"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<span>Назад</span>
				</button>

			

				<div className={styles.form}>
					<form>{step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}</form>
				</div>
				{step < 3 && <ProgressBar currentStep={step} totalSteps={3} steps={STEPS} />}
			</div>
		</div>
	);
};