import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface UserNavButtonProps {
	avatarUrl?: string | null;
	nickname?: string;
	onClick?: () => void;
}

export const UserNavButton = ({ avatarUrl, nickname, onClick }: UserNavButtonProps) => {
	const navigate = useNavigate();

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else {
			navigate('/profile');
		}
	};

	if (!avatarUrl && !nickname) {
		return null;
	}

	return (
		<button className={styles.userNavButton} onClick={handleClick}>
			<img
				src={avatarUrl || '/assets/avatars/avatar1.png'}
				alt={nickname || 'User'}
				className={styles.avatar}
			/>
			<span className={styles.nickname}>{nickname || 'Пользователь'}</span>
		</button>
	);
};
