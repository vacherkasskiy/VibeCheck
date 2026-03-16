import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { User } from 'entities/user';

interface ProfileHeaderProps {
	user: User;
	onEditProfile: () => void;
}

export const ProfileHeader = ({ user, onEditProfile }: ProfileHeaderProps) => {
	return (
		<div className={styles.container}>
			<div className={styles.mainInfo}>
				<div className={styles.avatarSection}>
					{user.avatarUrl ? (
						<img src={user.avatarUrl} alt={user.nickname} className={styles.avatar} />
					) : (
						<div className={styles.avatarPlaceholder}>
							{user.nickname.charAt(0).toUpperCase()}
						</div>
					)}
					<div className={styles.userInfo}>
						<h1 className={styles.nickname}>{user.nickname}</h1>
						<p className={styles.email}>{user.email}</p>
						<div className={styles.levelSection}>
							<span className={styles.levelLabel}>{user.levelLabel}</span>
							<div className={styles.progressBar}>
								<div
									className={styles.progressFill}
									style={{ width: `${user.levelProgress}%` }}
								/>
							</div>
							<span className={styles.levelText}>Уровень {user.level}</span>
						</div>
					</div>
				</div>

				<Button
					onClick={onEditProfile}
					variant="secondary"
					size="small"
					className={styles.editButton}
				>
					Редактировать профиль
				</Button>
			</div>

			<div className={styles.details}>
				<div className={styles.detailItem}>
					<span className={styles.detailLabel}>Образование</span>
					<span className={styles.detailValue}>{user.education}</span>
				</div>
				<div className={styles.detailItem}>
					<span className={styles.detailLabel}>Опыт</span>
					<span className={styles.detailValue}>{user.experience}</span>
				</div>
				<div className={styles.detailItem}>
					<span className={styles.detailLabel}>Специализация</span>
					<span className={styles.detailValue}>{user.expertise}</span>
				</div>
			</div>
		</div>
	);
};
