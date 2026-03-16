import { FileText, Search, Lightbulb, Star, Trophy, Award } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { Achievement } from 'entities/user';

interface AchievementsProps {
	achievements: Achievement[];
	onViewAll: () => void;
}

export const Achievements = ({ achievements, onViewAll }: AchievementsProps) => {
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

	const displayAchievements = achievements.slice(0, 5);

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
					<div key={achievement.id} className={styles.achievement}>
						<div className={styles.icon}>{getAchievementIcon(achievement.type)}</div>
						<div className={styles.info}>
							<span className={styles.name}>{achievement.name}</span>
							<span className={styles.date}>
								{new Date(achievement.earnedAt).toLocaleDateString('ru-RU')}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
