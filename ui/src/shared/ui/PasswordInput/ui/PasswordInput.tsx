import { useState } from 'react';
import styles from './styles.module.css';
import { Input } from '../../Input';

export interface PasswordInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	error?: string;
	showValidation?: boolean;
	onValidationChange?: (isValid: boolean) => void;
}

export const PasswordInput = ({
	label,
	value,
	onChange,
	required = false,
	error,
	showValidation = false,
	onValidationChange,
}: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [localError, setLocalError] = useState<string | undefined>(error);

	const togglePassword = () => {
		setShowPassword(!showPassword);
	};

	const validatePassword = (pwd: string): string | undefined => {
		if (required && pwd.length === 0) {
			return 'Обязательное поле';
		}
		if (pwd.length > 0 && pwd.length < 8) {
			return 'Минимум 8 символов';
		}
		if (pwd.length >= 8) {
			const hasUpperCase = /[A-Z]/.test(pwd);
			const hasLowerCase = /[a-z]/.test(pwd);
			const hasDigit = /\d/.test(pwd);
			const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

			if (!hasUpperCase) {
				return 'Хотя бы 1 заглавная буква';
			}
			if (!hasLowerCase) {
				return 'Хотя бы 1 строчная буква';
			}
			if (!hasDigit) {
				return 'Хотя бы 1 цифра';
			}
			if (!hasSpecialChar) {
				return 'Хотя бы 1 специальный символ';
			}
		}
		return undefined;
	};

	const handleChange = (newValue: string) => {
		onChange(newValue);
		if (showValidation) {
			const validationError = validatePassword(newValue);
			setLocalError(validationError);
			onValidationChange?.(!validationError);
		}
	};

	const validationRules = showValidation
		? [
				{ label: 'минимум 8 символов', isValid: value.length >= 8 },
				{ label: 'хотя бы 1 заглавная буква', isValid: /[A-Z]/.test(value) },
				{ label: 'хотя бы 1 цифра', isValid: /\d/.test(value) },
				{
					label: 'хотя бы 1 специальный символ',
					isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value),
				},
			]
		: [];

	return (
		<div className={styles.container}>
			<div className={styles.inputWrapper}>
				<Input
					label={label}
					type="password"
					value={value}
					onChange={(e: { target: { value: string; }; }) => handleChange(e.target.value)}
					required={required}
					error={localError}
					showPasswordToggle={true}
				/>
				<button type="button" className={styles.toggleButton} onClick={togglePassword}/>
					
				
			</div>
			{showValidation && validationRules.length > 0 && (
				<div className={styles.validation}>
					{validationRules.map((rule, index) => (
						<div
							key={index}
							className={`${styles.validationItem} ${rule.isValid ? styles.valid : ''}`}
						>
							<span className={styles.validationDot} />
							<span>{rule.label}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
};