import styles from './styles.module.css';
import { Button } from '../../Button';

export interface AuthButtonProps {
	children: React.ReactNode;
	variant: 'google' | 'submit';
	onClick?: () => void;
	fullWidth?: boolean;
	disabled?: boolean;
}

export const AuthButton = ({
	children,
	variant,
	onClick,
	fullWidth = false,
	disabled = false,
}: AuthButtonProps) => {
	if (variant === 'google') {
		return (
			<button
				type="button"
				className={`${styles.googleButton} ${fullWidth ? styles.fullWidth : ''}`}
				onClick={onClick}
				disabled={disabled}
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path
						d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
						fill="#4285F4"
					/>
					<path
						d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45c-.89.62-2.05 1-3.46 1-2.64 0-4.88-1.79-5.68-4.2H1.07v2.52A10 10 0 0 0 10 20z"
						fill="#34A853"
					/>
					<path
						d="M4.32 11.93A6.13 6.13 0 0 1 4 10.5c0-.67.12-1.31.32-1.93V6.05H1.07A10 10 0 0 0 0 10c0 1.64.39 3.19 1.07 4.95l3.25-2.52z"
						fill="#FBBC05"
					/>
					<path
						d="M10 3.88c1.49 0 2.83.51 3.88 1.52l2.78-2.78C14.96.99 12.7 0 10 0A10 10 0 0 0 1.07 6.05l3.25 2.52C5.12 4.67 7.36 3.88 10 3.88z"
						fill="#EA4335"
					/>
				</svg>
				<span>{children}</span>
			</button>
		);
	}

	return (
		<Button
			variant="primary"
			size="medium"
			fullWidth={fullWidth}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</Button>
	);
};
