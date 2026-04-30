import { FileText, Flag, Flame, Star, Trophy, Rocket, Award } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './styles.module.css';
import type { Achievement } from 'entities/user';

interface AchievementsModalProps {
	isOpen: boolean;
	onClose: () => void;
	achievements: Achievement[];
}

export const AchievementsModal = ({ isOpen, onClose, achievements }: AchievementsModalProps) => {
	const sortedAchievements = [...achievements].sort((a, b) => {
		const statusWeight = { Completed: 0, InProgress: 1, NotStarted: 2 };
		return (statusWeight[a.status ?? 'NotStarted'] ?? 2) - (statusWeight[b.status ?? 'NotStarted'] ?? 2);
	});

	const formatDate = (dateString: string | number | Date) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	const getAchievementMeta = (achievement: Achievement) => {
		if (achievement.status === 'Completed' && achievement.unlockedAt) {
			return `Получено: ${formatDate(achievement.unlockedAt)}`;
		}
		if (achievement.progressTarget && achievement.progressTarget > 0) {
			return `Прогресс: ${achievement.progressCurrent ?? 0}/${achievement.progressTarget}`;
		}
		if (achievement.status === 'NotStarted') {
			return 'Не начато';
		}
		return 'В процессе';
	};

	const getAchievementIcon = (type: string) => {
		switch (type) {
			case 'review':
				return <FileText size={32} color="white" />;
			case 'flag':
				return <Flag size={32} color="white" />;
			case 'activity':
				return <Flame size={32} color="white" />;
			case 'ranking':
				return <Star size={32} color="white" />;
			case 'special':
				return <Rocket size={32} color="white" />;
			default:
				return <Award size={32} color="white" />;
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>
						<Trophy size={28} /> Все достижения
					</h2>
					<button className={styles.closeButton} onClick={onClose} type="button">
						✕
					</button>
				</div>

				<div className={styles.achievementsList}>
					{sortedAchievements.map((achievement) => (
						<div
							key={achievement.id}
							className={`${styles.achievementItem} ${
								achievement.status === 'Completed'
									? styles.achievementCompleted
									: styles.achievementUncompleted
							}`}
						>
							<div
								className={styles.achievementIcon}
								style={{ backgroundColor: achievement.color }}
							>
								{achievement.iconUrl ? (
									<img src={achievement.iconUrl} alt={achievement.name} />
								) : (
									getAchievementIcon(achievement.type)
								)}
							</div>
							<div className={styles.achievementInfo}>
								<h3 className={styles.achievementName}>{achievement.name}</h3>
								<p className={styles.achievementDescription}>
									{achievement.description}
								</p>
								<span className={styles.achievementDate}>
									{getAchievementMeta(achievement)}
								</span>
								{achievement.status !== 'Completed' && (
									<div className={styles.achievementProgress}>
										<div className={styles.achievementProgressTrack}>
											<div
												className={styles.achievementProgressFill}
												style={{
													width: `${
														achievement.progressTarget && achievement.progressTarget > 0
															? Math.min(
																	100,
																	((achievement.progressCurrent ?? 0) /
																		achievement.progressTarget) *
																		100,
																)
															: 0
													}%`,
												}}
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					))}
					{sortedAchievements.length === 0 && (
						<p className={styles.emptyState}>Достижения пока не найдены</p>
					)}
				</div>

				<div className={styles.modalFooter}>
					<Button onClick={onClose} variant="secondary" size="small">
						Закрыть
					</Button>
				</div>
			</div>
		</Modal>
	);
};
