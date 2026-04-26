import { useEffect, type ReactNode } from 'react';
import styles from './styles.module.css';

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	className?: string;
}

export const Modal = ({ isOpen, onClose, children, className = '' }: ModalProps) => {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className={styles.overlay} onClick={handleBackdropClick}>
			<div className={`${styles.modal} ${className}`}>{children}</div>
		</div>
	);
};
