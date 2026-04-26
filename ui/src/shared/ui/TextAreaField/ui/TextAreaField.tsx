import styles from './styles.module.css';
import type { FC } from 'react';

export interface TextAreaFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	error?: string;
	maxLength?: number;
	onBlur?: () => void;
}

export const TextAreaField: FC<TextAreaFieldProps> = ({
	label,
	value,
	onChange,
	placeholder,
	required = false,
	error,
	maxLength = 500,
	onBlur,
}) => {
	const charCount = value.length;

	return (
		<div className={styles.container}>
			<label className={styles.label}>
				{label}
				{required && <span className={styles.required}>*</span>}
			</label>
			<div className={styles.textareaWrapper}>
				<textarea
					rows={8}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					maxLength={maxLength}
					onBlur={onBlur}
					className={`${styles.textarea} ${error ? styles.error : ''}`}
				/>
				<div className={styles.charCounter}>
					{charCount}/{maxLength}
				</div>
			</div>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};
