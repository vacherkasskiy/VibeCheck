import { forwardRef, useState } from 'react';
import styles from './styles.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
	showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			helperText,
			showPasswordToggle = false,
			className = '',
			type = 'text',
			...props
		},
		ref
	) => {
		const [showPassword, setShowPassword] = useState(false);

		const togglePassword = () => {
			setShowPassword(!showPassword);
		};

		const inputType =
			showPasswordToggle && showPassword ? 'text' : type;

		return (
			<div className={`${styles.container} ${className}`}>
				{label && (
					<label className={styles.label}>
						{label}
						{props.required && <span className={styles.required}>*</span>}
					</label>
				)}
				<div className={`${styles.inputWrapper} ${error ? styles.error : ''}`}>
					<input
						ref={ref}
						type={inputType}
						className={styles.input}
						{...props}
					/>
					{showPasswordToggle && (
						<button
							type="button"
							className={styles.passwordToggle}
							onClick={togglePassword}
						>
							{showPassword ? '🙈' : '👁️'}
						</button>
					)}
				</div>
				{error && <span className={styles.errorText}>{error}</span>}
				{helperText && !error && (
					<span className={styles.helperText}>{helperText}</span>
				)}
			</div>
		);
	}
);

Input.displayName = 'Input';