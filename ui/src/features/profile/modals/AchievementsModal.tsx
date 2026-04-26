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
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
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
					{achievements.map((achievement) => (
						<div key={achievement.id} className={styles.achievementItem}>
							<div
								className={styles.achievementIcon}
								style={{ backgroundColor: achievement.color }}
							>
								{getAchievementIcon(achievement.type)}
							</div>
							<div className={styles.achievementInfo}>
								<h3 className={styles.achievementName}>{achievement.name}</h3>
								<p className={styles.achievementDescription}>
									{achievement.description}
								</p>
								<span className={styles.achievementDate}>
									Получено: {formatDate(achievement.unlockedAt)}
								</span>
							</div>
						</div>
					))}
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
