/* eslint-disable @conarti/feature-sliced/public-api */
/* eslint-disable @conarti/feature-sliced/layers-slices */
import { passwordReset } from 'features/auth/model/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from 'shared/assets/Logo';
import { AuthButton } from 'shared/ui/AuthButton';
import { InputField } from 'shared/ui/InputField';
import { Modal } from 'shared/ui/Modal';
import { PasswordInput } from 'shared/ui/PasswordInput';
import { VerificationForm } from 'widgets/VerificationForm';
import styles from './styles.module.css';

export const ForgotPasswordForm = () => {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);
	const [email, setEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [confirmPasswordError, setConfirmPasswordError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');
	const [showErrorModal, setShowErrorModal] = useState(false);

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
		setNewPassword(value);
		if (value && !validatePassword(value)) {
			setPasswordError(
				'Пароль должен содержать минимум 8 символов, заглавную букву, цифру и спецсимвол',
			);
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
		if (value !== newPassword) {
			setConfirmPasswordError('Пароли не совпадают');
		} else {
			setConfirmPasswordError('');
		}
	};

	const handleSubmit = async () => {
		const emailValidationError = validateEmail(email);
		if (emailValidationError) {
			setEmailError(emailValidationError);
			return;
		}

		if (!newPassword) {
			setPasswordError('Обязательное поле');
			return;
		}
		if (!validatePassword(newPassword)) {
			setPasswordError(
				'Пароль должен содержать минимум 8 символов, заглавную букву, цифру и спецсимвол',
			);
			return;
		}

		if (!confirmPassword) {
			setConfirmPasswordError('Обязательное поле');
			return;
		}
		if (newPassword !== confirmPassword) {
			setConfirmPasswordError('Пароли не совпадают');
			return;
		}

		setIsLoading(true);
		setGeneralError('');
		setEmailError('');
		setPasswordError('');
		setConfirmPasswordError('');

		try {
			await passwordReset({ email });
			setStep(2);
		} catch (err: any) {
			let msg =
				err.response?.data?.message ||
				'Не удалось отправить код сброса. Проверьте соединение и попробуйте снова.';
			setGeneralError(msg);
			setShowErrorModal(true);
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		if (step === 1) {
			navigate('/login');
		} else {
			setStep(step - 1);
		}
	};

	const handleCloseModal = () => {
		setShowErrorModal(false);
		setGeneralError('');
	};

	const renderStep1 = () => (
		<>
			<div className={styles.header}>
				<div className={styles.logoContainer}>
					<Logo className={styles.logo} />
				</div>
				<h1 className={styles.title}>Сбросить пароль</h1>
				<p className={styles.subtitle}>
					Введите почту и новый пароль. Код будет отправлен на email.
				</p>
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
				label="Новый пароль"
				value={newPassword}
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
				<AuthButton variant="submit" fullWidth onClick={handleSubmit} disabled={isLoading}>
					{isLoading ? 'Отправка...' : 'Отправить код'}
				</AuthButton>
			</div>

			<div className={styles.loginLink}>
				<span>Вспомнили пароль? </span>
				<button type="button" onClick={() => navigate('/login')} className={styles.link}>
					Войти
				</button>
			</div>
		</>
	);

	const renderStep2 = () => (
		<VerificationForm
			email={email}
			password={newPassword}
			mode="reset"
			onBack={() => setStep(1)}
			onSuccess={() => navigate('/login')}
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

				<div className={styles.form}>{step === 1 ? renderStep1() : renderStep2()}</div>
			</div>

			<Modal isOpen={showErrorModal} onClose={handleCloseModal}>
				<div className={styles.errorModal}>
					<h3>Ошибка</h3>
					<p className={styles.generalError}>{generalError}</p>
					<AuthButton variant="submit" fullWidth onClick={handleCloseModal}>
						OK
					</AuthButton>
				</div>
			</Modal>
		</div>
	);
};

export default ForgotPasswordForm;
