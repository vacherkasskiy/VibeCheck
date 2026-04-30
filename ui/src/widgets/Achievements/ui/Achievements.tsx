import { FileText, Search, Lightbulb, Star, Trophy, Award } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { Achievement } from 'entities/user';

interface AchievementsProps {
	achievements: Achievement[];
	onViewAll: () => void;
}

export const Achievements = ({ achievements, onViewAll }: AchievementsProps) => {
	const sortedAchievements = [...achievements].sort((a, b) => {
		const statusWeight = { Completed: 0, InProgress: 1, NotStarted: 2 };
		return (statusWeight[a.status ?? 'NotStarted'] ?? 2) - (statusWeight[b.status ?? 'NotStarted'] ?? 2);
	});

	const getAchievementMeta = (achievement: Achievement) => {
		if (achievement.status === 'Completed' && achievement.earnedAt) {
			return new Date(achievement.earnedAt).toLocaleDateString('ru-RU');
		}
		if (achievement.progressTarget && achievement.progressTarget > 0) {
			return `${achievement.progressCurrent ?? 0}/${achievement.progressTarget}`;
		}
		if (achievement.status === 'NotStarted') {
			return 'Не начато';
		}
		return 'В процессе';
	};

	const getAchievementIcon = (type: string) => {
		switch (type) {
			case 'review':
				return <FileText size={24} />;
			case 'flag':
				return <Search size={24} />;
			case 'activity':
				return <Lightbulb size={24} />;
			case 'ranking':
				return <Star size={24} />;
			case 'special':
				return <Trophy size={24} />;
			default:
				return <Award size={24} />;
		}
	};

	const displayAchievements = sortedAchievements.slice(0, 5);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2 className={styles.title}>Достижения</h2>
				{achievements.length > 5 && (
					<Button onClick={onViewAll} variant="secondary" size="small">
						Смотреть все
					</Button>
				)}
			</div>

			<div className={styles.achievementsGrid}>
				{displayAchievements.map((achievement) => (
					<div
						key={achievement.id}
						className={`${styles.achievement} ${
							achievement.status === 'Completed'
								? styles.completed
								: styles.uncompleted
						}`}
					>
						<div className={styles.icon}>
							{achievement.iconUrl ? (
								<img src={achievement.iconUrl} alt={achievement.name} />
							) : (
								getAchievementIcon(achievement.type)
							)}
						</div>
						<div className={styles.info}>
							<span className={styles.name}>{achievement.name}</span>
							<span className={styles.date}>{getAchievementMeta(achievement)}</span>
							{achievement.status !== 'Completed' && (
								<div className={styles.progress}>
									<div className={styles.progressTrack}>
										<div
											className={styles.progressFill}
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
				{displayAchievements.length === 0 && (
					<p className={styles.empty}>Достижения пока не найдены</p>
				)}
			</div>
		</div>
	);
};
