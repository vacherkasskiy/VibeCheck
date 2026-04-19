import { AuthButton } from '@shared/ui/AuthButton';
import { InputField } from '@shared/ui/InputField';
import { PasswordInput } from '@shared/ui/PasswordInput';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from 'shared/assets/Logo';
import styles from './styles.module.css';

export const AuthForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');

	const navigate = useNavigate();

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

	const handleEmailChange = (value: string) => {
		setEmail(value);
		setEmailError(validateEmail(value));
		setGeneralError('');
	};

	const handlePasswordChange = (value: string) => {
		setPassword(value);
		setPasswordError('');
		setGeneralError('');
	};

	const handleSubmit = async () => {
		const emailValidationError = validateEmail(email);
		if (emailValidationError) {
			setEmailError(emailValidationError);
			return;
		}

		if (!password) {
			setPasswordError('Обязательное поле');
			return;
		}

		setIsLoading(true);
		setGeneralError('');

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('refreshToken', data.refreshToken);
				navigate('/flags');
			} else if (data.code === 'ACCOUNT_BLOCKED') {
				setGeneralError('Ваш аккаунт был заблокирован');
			} else {
				setGeneralError(data.message || 'Ошибка входа');
			}
		} catch {
			setGeneralError('Ошибка соединения. Проверьте интернет.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	return (
		<>
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

			<div className={styles.formContainer}>
				<div className={styles.header}>
					<div className={styles.logoContainer}>
						<Logo className={styles.logo} />
					</div>
					<h1 className={styles.title}>Войти</h1>
					<p className={styles.subtitle}>Введите почту и пароль</p>
				</div>

				<div className={styles.form}>
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
					/>

					{generalError && <div className={styles.generalError}>{generalError}</div>}

					<AuthButton
						variant="submit"
						fullWidth
						onClick={handleSubmit}
						disabled={isLoading || !email}
					>
						{isLoading ? 'Вход...' : 'Войти'}
					</AuthButton>

					<Link to="/forgot-password" className={styles.forgotLink}>
						Забыли пароль?
					</Link>

					<p className={styles.footerText}>
						Ещё нет аккаунта?{' '}
						<Link to="/register" className={styles.footerLink}>
							Создать аккаунт
						</Link>
					</p>
				</div>
			</div>
		</>
	);
};

export default AuthForm;
