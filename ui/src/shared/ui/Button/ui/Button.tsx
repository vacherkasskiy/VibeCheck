import { Link } from 'react-router-dom';
import styles from './styles.module.css';

export interface ButtonProps {
	children: React.ReactNode;
	variant?: 'primary' | 'secondary';
	size?: 'large' | 'medium' | 'small';
	as?: 'button' | 'link';
	href?: string;
	to?: string;
	onClick?: () => void;
	className?: string;
	fullWidth?: boolean;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
}

export const Button = ({
	children,
	variant = 'primary',
	size = 'large',
	as = 'button',
	href,
	to,
	onClick,
	className = '',
	fullWidth = false,
	type = 'button',
	disabled = false,
}: ButtonProps) => {
	const classNames = [
		styles.button,
		styles[variant],
		styles[size],
		fullWidth ? styles.fullWidth : '',
		className,
	]
		.filter(Boolean)
		.join(' ');

	const content = <span className={styles.content}>{children}</span>;

	if (as === 'link' && href) {
		return (
			<a href={href} className={classNames} onClick={onClick}>
				{content}
			</a>
		);
	}

	if (to) {
		return (
			<Link to={to} className={classNames} onClick={onClick}>
				{content}
			</Link>
		);
	}

	return (
		<button
			type={type}
			className={classNames}
			onClick={onClick}
			disabled={disabled}
		>
			{content}
		</button>
	);
};