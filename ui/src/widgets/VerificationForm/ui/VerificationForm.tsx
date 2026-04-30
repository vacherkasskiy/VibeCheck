/* eslint-disable @conarti/feature-sliced/absolute-relative */
import {
	completeCurrentOnboardingStep,
	getActualOnboardingStep,
	registerConfirm,
	registerResend,
	passwordConfirm,
	passwordResetResend,
} from 'features/auth';
import { useState, useEffect } from 'react';
import { Button } from 'shared/ui/Button/';
import { InputField } from 'shared/ui/InputField';
import styles from './styles.module.css';
import { useAuth } from '../../../features/auth';

interface VerificationFormProps {
	email: string;
	password: string;
	mode?: 'register' | 'reset';
	onSuccess: () => void;
	onBack: () => void;
}

export const VerificationForm = ({
	email,
	password,
	mode,
	onSuccess,
	onBack,
}: VerificationFormProps) => {
	const { dispatch } = useAuth();
	const [code, setCode] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [canResend, setCanResend] = useState(false);
	const [timer, setTimer] = useState(60);
	const [generalError, setGeneralError] = useState('');

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		} else {
			setCanResend(true);
		}
	}, [timer]);

	const validateCode = (value: string): string => {
		if (!value) {
			return 'Обязательное поле';
		}
		const codeRegex = /^\d{6}$/;
		if (!codeRegex.test(value)) {
			return 'Код должен содержать ровно 6 цифр';
		}
		return '';
	};

	const handleCodeChange = (value: string) => {
		const numericValue = value.replace(/\D/g, '').slice(0, 6);
		setCode(numericValue);
		setError(validateCode(numericValue));
		setGeneralError('');
	};

	const handleSubmit = async () => {
		const validationError = validateCode(code);
		if (validationError) {
			setError(validationError);
			return;
		}

		setIsLoading(true);
		setGeneralError('');

		try {
			if (mode === 'reset') {
				const data = await passwordConfirm(code);
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('refreshToken', data.refreshToken);
				dispatch({ type: 'SET_TOKENS', payload: data });
				onSuccess();
			} else {
				const data = await registerConfirm(code);
				localStorage.setItem('accessToken', data.accessToken);
				localStorage.setItem('refreshToken', data.refreshToken);
				dispatch({ type: 'SET_TOKENS', payload: data });
				await getActualOnboardingStep().catch(() => null);
				await completeCurrentOnboardingStep().catch(() => undefined);
				onSuccess();
			}
		} catch (err: any) {
			setGeneralError(err.response?.data?.message || 'Неверный код');
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		setResendLoading(true);
		setGeneralError('');

		try {
			if (mode === 'reset') {
				await passwordResetResend({ email, newPassword: password });
			} else {
				await registerResend({ login: email, password });
			}
			setTimer(60);
			setCanResend(false);
			setCode('');
			setError('');
		} catch (err: any) {
			setGeneralError('Не удалось отправить код');
		} finally {
			setResendLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<img
						src="/assets/vibecheck-favicon.png"
						alt="VibeCheck"
						style={{ width: 64, height: 50, borderRadius: 6 }}
					/>
				</div>
				<h1 className={styles.title}>Создать аккаунт</h1>
				<p className={styles.subtitle}>
					Введите код верификации, отправленный на почту <br />
					<span className={styles.email}>{email}</span>
				</p>
			</div>

			<InputField
				label="Код верификации"
				value={code}
				onChange={handleCodeChange}
				placeholder="000000"
				required
				error={error}
				maxLength={6}
			/>

			{generalError && <div className={styles.generalError}>{generalError}</div>}

			<div className={styles.timer}>
				{!canResend ? (
					<span>Повторная отправка возможна через {timer} сек.</span>
				) : (
					<button
						type="button"
						className={styles.resendButton}
						onClick={handleResend}
						disabled={resendLoading}
					>
						{resendLoading ? 'Отправка...' : 'Не пришел код? Отправить код повторно'}
					</button>
				)}
			</div>

			<div className={styles.submitButton}>
				<Button
					variant="primary"
					size="large"
					fullWidth
					onClick={handleSubmit}
					disabled={isLoading}
				>
					{isLoading ? 'Проверка...' : 'Отправить код'}
				</Button>
			</div>
		</div>
	);
};
