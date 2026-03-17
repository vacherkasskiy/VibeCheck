import { TagInfoModal } from 'features/flags';
import { useState } from 'react';
import styles from './FlagsLibrary.module.css';
import type { Tag } from 'entities/tag';

interface FlagsLibraryProps {
	groupedByCategory: [string, Tag[]][];
	onTagClick: (tag: Tag) => void;
	onTagDragStart: (id: string) => void;
	onTagDragEnd: () => void;
	onAddToGreen?: (tag: Tag) => void;
	onAddToRed?: (tag: Tag) => void;
	greenTags?: Record<string, unknown>;
	redTags?: Record<string, unknown>;
}

export const FlagsLibrary = ({
	groupedByCategory,
	onTagClick,
	onTagDragStart,
	onTagDragEnd,
	onAddToGreen,
	onAddToRed,
	greenTags = {},
	redTags = {},
}: FlagsLibraryProps) => {
	const [query, setQuery] = useState('');
	const [infoTag, setInfoTag] = useState<Tag | null>(null);

	const handleTagClick = (tag: Tag) => {
		setInfoTag(tag);
	};

	const handleCloseInfo = () => {
		setInfoTag(null);
	};

	const handleAddToGreen = (tag: Tag) => {
		onAddToGreen?.(tag);
	};

	const handleAddToRed = (tag: Tag) => {
		onAddToRed?.(tag);
	};

	return (
		<section className={styles.library}>
			<input
				type="text"
				placeholder="Поиск тегов"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className={styles.searchInput}
			/>

			<div className={styles.tagsGrid}>
				{groupedByCategory.map(([category, tags]) => (
					<div key={category} className={styles.category}>
						<h3 className={styles.categoryTitle}>{category}</h3>
						<div className={styles.tagsContainer}>
							{tags.map((tag) => (
								<button
									key={tag.id}
									onMouseDown={() => onTagDragStart(tag.id)}
									onMouseUp={onTagDragEnd}
									onClick={() => handleTagClick(tag)}
									className={styles.tagButton}
								>
									{tag.name}
								</button>
							))}
						</div>
					</div>
				))}

				{groupedByCategory.length === 0 && (
					<p className={styles.emptyMessage}>Нет доступных тегов по вашему запросу</p>
				)}
			</div>

			<TagInfoModal
				tag={infoTag}
				isOpen={!!infoTag}
				onClose={handleCloseInfo}
				onAddToGreen={handleAddToGreen}
				onAddToRed={handleAddToRed}
				isInGreen={infoTag ? infoTag.id in greenTags : false}
				isInRed={infoTag ? infoTag.id in redTags : false}
			/>
		</section>
	);
};
