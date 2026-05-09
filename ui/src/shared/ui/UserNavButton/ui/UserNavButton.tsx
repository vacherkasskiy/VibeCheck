import { useAuth } from 'features/auth';
import { Flag, Info, LogOut, PencilLine, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface UserNavButtonProps {
	avatarUrl?: string | null;
	nickname?: string;
	onClick?: () => void;
}

export const UserNavButton = ({ avatarUrl, nickname, onClick }: UserNavButtonProps) => {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsOpen(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	const handleButtonClick = () => {
		if (onClick) {
			onClick();
		} else {
			setIsOpen((prev) => !prev);
		}
	};

	const navigateTo = (path: string) => {
		setIsOpen(false);
		navigate(path);
	};

	const handleLogout = async () => {
		setIsOpen(false);
		await logout();
		navigate('/login');
	};

	if (!avatarUrl && !nickname) {
		return null;
	}

	return (
		<div className={styles.wrapper} ref={containerRef}>
			<button
				className={styles.button}
				onClick={handleButtonClick}
				type="button"
				aria-haspopup="menu"
				aria-expanded={isOpen}
			>
				<img
					src={avatarUrl || '/assets/avatars/avatar1.png'}
					alt={nickname || 'Пользователь'}
					className={styles.avatar}
				/>
				<span className={styles.nickname}>{nickname || 'Пользователь'}</span>
			</button>

			{isOpen && !onClick && (
				<div className={styles.menu} role="menu">
					<button
						className={styles.menuItem}
						onClick={() => navigateTo('/profile')}
						type="button"
						role="menuitem"
					>
						<User size={22} strokeWidth={2.2} />
						<span>Профиль</span>
					</button>
					<button
						className={styles.menuItem}
						onClick={() => navigateTo('/flags')}
						type="button"
						role="menuitem"
					>
						<Flag size={22} strokeWidth={2.2} />
						<span>Редактировать флаги</span>
					</button>
					<button
						className={styles.menuItem}
						onClick={() => navigateTo('/profile/edit')}
						type="button"
						role="menuitem"
					>
						<PencilLine size={22} strokeWidth={2.2} />
						<span>Редактировать профиль</span>
					</button>
					<button
						className={styles.menuItem}
						onClick={() => navigateTo('/')}
						type="button"
						role="menuitem"
					>
						<Info size={22} strokeWidth={2.2} />
						<span>О сервисе</span>
					</button>
					<button
						className={`${styles.menuItem} ${styles.logoutItem}`}
						onClick={handleLogout}
						type="button"
						role="menuitem"
					>
						<LogOut size={22} strokeWidth={2.2} />
						<span>Выйти</span>
					</button>
				</div>
			)}
		</div>
	);
};
