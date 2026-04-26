import { PRIORITY_OPTIONS } from 'entities/tag';
import { TagInfoModal } from 'features/flags';
import { useState } from 'react';
import styles from './FlagsColumns.module.css';
import type { SelectedTag, Tag } from 'entities/tag';

interface FlagsColumnsProps {
	green: Record<string, SelectedTag>;
	red: Record<string, SelectedTag>;
	onDropToGreen: () => void;
	onDropToRed: () => void;
	onTagClick: (tag: SelectedTag['tag']) => void;
	onUpdatePriority: (id: string, side: 'green' | 'red', priority: 1 | 2 | 3) => void;
	onRemoveTag: (id: string, side: 'green' | 'red') => void;
	onMoveAcross: (id: string, to: 'green' | 'red') => void;
}

export const FlagsColumns = ({
	green,
	red,
	onDropToGreen,
	onDropToRed,
	onTagClick,
	onUpdatePriority,
	onRemoveTag,
	onMoveAcross,
}: FlagsColumnsProps) => {
	const [infoTag, setInfoTag] = useState<Tag | null>(null);

	const handleTagClick = (tag: Tag) => {
		setInfoTag(tag);
	};

	const handleCloseInfo = () => {
		setInfoTag(null);
	};

	return (
		<section className={styles.flagsContainer}>
			<div onMouseUp={onDropToGreen} className={`${styles.column} ${styles.greenColumn}`}>
				<h3 className={styles.columnTitle}>Green флаги</h3>
				{Object.keys(green).length === 0 ? (
					<p className={styles.emptyMessage}>Перетащите теги сюда</p>
				) : (
					<div className={styles.tagsContainer}>
						{Object.values(green).map(({ tag, priority }) => (
							<div key={tag.id} className={styles.selectedTag}>
								<button
									onClick={() => handleTagClick(tag)}
									className={styles.tagLink}
								>
									{tag.name}
								</button>
								<select
									value={priority}
									onChange={(e) =>
										onUpdatePriority(
											tag.id,
											'green',
											Number(e.target.value) as 1 | 2 | 3,
										)
									}
									className={styles.prioritySelect}
								>
									{PRIORITY_OPTIONS.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
								<button
									onClick={() => onRemoveTag(tag.id, 'green')}
									className={styles.removeButton}
									title="Удалить"
								>
									&times;
								</button>
								<button
									onClick={() => onMoveAcross(tag.id, 'red')}
									title="Переместить в красные"
									className={styles.moveButton}
								>
									Red
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			<div onMouseUp={onDropToRed} className={`${styles.column} ${styles.redColumn}`}>
				<h3 className={styles.columnTitle}>Red флаги</h3>
				{Object.keys(red).length === 0 ? (
					<p className={styles.emptyMessage}>Перетащите теги сюда</p>
				) : (
					<div className={styles.tagsContainer}>
						{Object.values(red).map(({ tag, priority }) => (
							<div key={tag.id} className={styles.selectedTag}>
								<button
									onClick={() => handleTagClick(tag)}
									className={styles.tagLink}
								>
									{tag.name}
								</button>
								<select
									value={priority}
									onChange={(e) =>
										onUpdatePriority(
											tag.id,
											'red',
											Number(e.target.value) as 1 | 2 | 3,
										)
									}
									className={styles.prioritySelect}
								>
									{PRIORITY_OPTIONS.map((o) => (
										<option key={o.value} value={o.value}>
											{o.label}
										</option>
									))}
								</select>
								<button
									onClick={() => onRemoveTag(tag.id, 'red')}
									className={styles.removeButton}
									title="Удалить"
								>
									&times;
								</button>
								<button
									onClick={() => onMoveAcross(tag.id, 'green')}
									title="Переместить в зеленые"
									className={styles.moveButton}
								>
									Green
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			<TagInfoModal tag={infoTag} isOpen={!!infoTag} onClose={handleCloseInfo} />
		</section>
	);
};
