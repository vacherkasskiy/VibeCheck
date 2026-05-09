import styles from './styles.module.css';

export interface InputFieldProps {
	label: string;
	type?: 'text' | 'email' | 'tel' | 'number' | 'date';
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
	maxLength?: number;
	mask?: string;
	onBlur?: () => void;
	disabled?: boolean;
	readOnly?: boolean;
}

export const InputField = ({
	label,
	type = 'text',
	value,
	onChange,
	placeholder,
	required = false,
	error,
	maxLength,
	onBlur,
	disabled = false,
	readOnly = false,
}: InputFieldProps) => {
	return (
		<div className={styles.container}>
			<label className={styles.label}>
				{label}
				{required && <span className={styles.required}>*</span>}
			</label>
			<input
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				maxLength={maxLength}
				onBlur={onBlur}
				disabled={disabled}
				readOnly={readOnly}
				className={`${styles.input} ${error ? styles.error : ''}`}
			/>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};
