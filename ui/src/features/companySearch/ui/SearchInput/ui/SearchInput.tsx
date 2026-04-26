import styles from './styles.module.css';
import type { FC, ChangeEvent } from 'react';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export const SearchInput: FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder = 'Поиск компании',
	className = '',
}) => {
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className={`${styles.searchContainer} ${className}`}>
			<svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
				<circle cx="11" cy="11" r="8" stroke="#9aa0a6" strokeWidth="2" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#9aa0a6" strokeWidth="2" />
			</svg>
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={handleChange}
				className={styles.searchInput}
			/>
		</div>
	);
};
