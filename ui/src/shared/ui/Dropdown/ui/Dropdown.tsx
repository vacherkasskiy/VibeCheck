import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';

export interface DropdownOption {
	value: string;
	label: string;
}

export interface DropdownProps {
	label: string;
	options: DropdownOption[];
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	error?: string;
	placeholder?: string;
}

export const Dropdown = ({
	label,
	options,
	value,
	onChange,
	required = false,
	error,
	placeholder = 'Выберите...',
}: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSelect = (optionValue: string) => {
		onChange(optionValue);
		setIsOpen(false);
	};

	return (
		<div className={styles.container} ref={dropdownRef}>
			<label className={styles.label}>
				{label}
				{required && <span className={styles.required}>*</span>}
			</label>
			<div
				className={`${styles.dropdown} ${error ? styles.error : ''} ${isOpen ? styles.open : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className={selectedOption ? styles.selected : styles.placeholder}>
					{selectedOption?.label || placeholder}
				</span>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
				>
					<path
						d="M5 7.5L10 12.5L15 7.5"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			{isOpen && (
				<div className={styles.options}>
					{options.map((option) => (
						<div
							key={option.value}
							className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
							onClick={() => handleSelect(option.value)}
						>
							{option.label}
						</div>
					))}
				</div>
			)}
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};