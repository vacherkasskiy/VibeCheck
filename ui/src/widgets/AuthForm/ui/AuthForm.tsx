import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockAuth } from 'shared/model/mockAuth';
import { AuthButton } from 'shared/ui/AuthButton';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { InputField } from 'shared/ui/InputField';
import { PasswordInput } from 'shared/ui/PasswordInput';
import styles from './styles.module.css';

export const AuthForm = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');

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

	const validatePassword = (value: string): string => {
		if (!value) {
			return 'Обязательное поле';
		}
		return '';
	};

	const handlePasswordChange = (value: string) => {
		setPassword(value);
		setPasswordError(validatePassword(value));
		setGeneralError('');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const emailValidationError = validateEmail(email);
		const passwordValidationError = validatePassword(password);

		setEmailError(emailValidationError);
		setPasswordError(passwordValidationError);

		if (emailValidationError || passwordValidationError) {
			return;
		}

		setIsLoading(true);
		setGeneralError('');

		try {
			const { ok, data } = await mockAuth.login({ email, password });
			if (ok && data.accessToken && data.refreshToken) {
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('refreshToken', data.refreshToken);
				window.location.href = '/';
			} else if (data.code === 'ACCOUNT_BLOCKED') {
				setGeneralError('Ваш аккаунт был заблокирован');
			} else if (data.code === 'ACCOUNT_UNVERIFIED') {
				setGeneralError('Аккаунт не подтвержден');
			} else {
				setGeneralError(data.message || 'Не удалось войти. Попробуйте позже.');
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

	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.container}>
				<Link to="/" className={styles.backButton}>
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
				</Link>

				<div className={styles.form}>
					<div className={styles.header}>
						<img
							src="/assets/vibecheck-favicon.png"
							alt="VibeCheck"
							className={styles.logo}
						/>
						<h1 className={styles.title}>Войти</h1>
						<p className={styles.subtitle}>Введите почту и пароль</p>
					</div>

					<form onSubmit={handleSubmit}>
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

						<div className={styles.submitButton}>
							<AuthButton variant="submit" fullWidth disabled={isLoading}>
								{isLoading ? 'Вход...' : 'Войти'}
							</AuthButton>
						</div>

						<div className={styles.forgotPassword}>
							<a href="/forgot-password">Забыли пароль?</a>
						</div>

						<div className={styles.divider}>
							<span>Или войти с помощью</span>
						</div>

						<AuthButton variant="google" onClick={handleGoogleLogin} fullWidth>
							Войти через Google
						</AuthButton>

						<div className={styles.registerLink}>
							<span>Ещё нет аккаунта? </span>
							<Link to="/register">Создать аккаунт</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};
