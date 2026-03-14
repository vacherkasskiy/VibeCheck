import { forwardRef } from 'react';
import styles from './styles.module.css';

export interface SelectOption {
	value: string;
	label: string;
}

export interface SelectProps {
	label?: string;
	options: SelectOption[];
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			options,
			value,
			onChange,
			placeholder = 'Выберите...',
			error,
			required,
			disabled,
			className = '',
		},
		ref
	) => {
		const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
			onChange?.(e.target.value);
		};

		return (
			<div className={`${styles.container} ${className}`}>
				{label && (
					<label className={styles.label}>
						{label}
						{required && <span className={styles.required}>*</span>}
					</label>
				)}
				<div className={`${styles.selectWrapper} ${error ? styles.error : ''}`}>
					<select
						ref={ref}
						value={value}
						onChange={handleChange}
						disabled={disabled}
						className={styles.select}
					>
						<option value="" disabled>
							{placeholder}
						</option>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<span className={styles.arrow}>▼</span>
				</div>
				{error && <span className={styles.errorText}>{error}</span>}
			</div>
		);
	}
);

Select.displayName = 'Select';