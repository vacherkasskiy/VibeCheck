import { Circle } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { UserFlags as UserFlagsType } from 'entities/user';

interface UserFlagsProps {
	flags: UserFlagsType;
	onEditFlags?: () => void;
}

export const UserFlags = ({ flags, onEditFlags }: UserFlagsProps) => {
	const renderFlagList = (
		flagList: { id: string; name: string; priority: number }[],
		type: 'green' | 'red',
	) => {
		const sortedFlags = [...flagList].sort((a, b) => a.priority - b.priority);

		return sortedFlags.map((flag) => (
			<div
				key={flag.id}
				className={`${styles.flag} ${type === 'green' ? styles.greenFlag : styles.redFlag}`}
			>
				<span className={styles.flagName}>{flag.name}</span>
				<span className={styles.flagPriority}>#{flag.priority}</span>
			</div>
		));
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2 className={styles.title}>{onEditFlags ? 'Мои флаги' : 'Флаги пользователя'}</h2>
				{onEditFlags && (
					<Button onClick={onEditFlags} variant="secondary" size="small">
						Редактировать флаги
					</Button>
				)}
			</div>

			<div className={styles.flagsGrid}>
				<div className={styles.flagsColumn}>
					<h3 className={styles.columnTitle}>
						<Circle
							size={16}
							fill="var(--color-green-badge)"
							stroke="var(--color-green-badge)"
						/>
						Зеленые флаги
					</h3>
					<div className={styles.flagsList}>
						{flags.green.length > 0 ? (
							renderFlagList(flags.green, 'green')
						) : (
							<p className={styles.empty}>Нет зеленых флагов</p>
						)}
					</div>
				</div>

				<div className={styles.flagsColumn}>
					<h3 className={styles.columnTitle}>
						<Circle
							size={16}
							fill="var(--color-red-badge)"
							stroke="var(--color-red-badge)"
						/>
						Красные флаги
					</h3>
					<div className={styles.flagsList}>
						{flags.red.length > 0 ? (
							renderFlagList(flags.red, 'red')
						) : (
							<p className={styles.empty}>Нет красных флагов</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
