import { ALL_TAGS, filterTags, groupByCategory, type Tag, type SelectedTag } from 'entities/tag';
import { useState, useCallback } from 'react';
import React from 'react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './FlagsModal.module.css';
import { FlagsColumns } from '../../../widgets/FlagsColumns';
import { FlagsLibrary } from '../../../widgets/FlagsLibrary';

export interface FlagsModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (green: string[], red: string[]) => void;
	initialGreenFlags: string[];
	initialRedFlags: string[];
	companyName: string;
}

type Side = 'green' | 'red';

export const FlagsModal = ({
	isOpen,
	onClose,
	onSave,
	initialGreenFlags,
	initialRedFlags,
	companyName,
}: FlagsModalProps) => {
	const [green, setGreen] = useState<Record<string, SelectedTag>>(() => {
		const initial: Record<string, SelectedTag> = {};
		initialGreenFlags.forEach((flagName) => {
			const tag = ALL_TAGS.find((t) => t.name === flagName);
			if (tag) {
				initial[tag.id] = { tag, priority: 3 };
			}
		});
		return initial;
	});

	const [red, setRed] = useState<Record<string, SelectedTag>>(() => {
		const initial: Record<string, SelectedTag> = {};
		initialRedFlags.forEach((flagName) => {
			const tag = ALL_TAGS.find((t) => t.name === flagName);
			if (tag) {
				initial[tag.id] = { tag, priority: 3 };
			}
		});
		return initial;
	});

	const [query, setQuery] = useState('');
	const [draggingId, setDraggingId] = useState<string | null>(null);

	const filteredTags = (() => {
		const q = query.trim().toLowerCase();
		const excludeIds = Array.from(new Set(Object.keys(green).concat(Object.keys(red))));
		return filterTags(ALL_TAGS, q, excludeIds);
	})();

	const groupedByCategory = groupByCategory(filteredTags);

	const startDrag = (id: string) => setDraggingId(id);
	const endDrag = () => setDraggingId(null);

	const addToSide = (tag: Tag, side: Side) => {
		const inGreen = green[tag.id];
		const inRed = red[tag.id];
		if ((side === 'green' && inRed) || (side === 'red' && inGreen)) {
			// Conflict - move across instead
			moveAcross(tag.id, side);
			return;
		}
		const selected: SelectedTag = { tag, priority: 3 };
		if (side === 'green') {
			setGreen((prev) => ({ ...prev, [tag.id]: selected }));
		} else {
			setRed((prev) => ({ ...prev, [tag.id]: selected }));
		}
	};

	const moveAcross = (tagId: string, to: Side) => {
		const src = to === 'green' ? red : green;
		const item = src[tagId];
		if (!item) return;
		if (to === 'green') {
			setRed((prev) => {
				const newRed = { ...prev };
				delete newRed[tagId];
				return newRed;
			});
			setGreen((prev) => ({ ...prev, [tagId]: item }));
		} else {
			setGreen((prev) => {
				const newGreen = { ...prev };
				delete newGreen[tagId];
				return newGreen;
			});
			setRed((prev) => ({ ...prev, [tagId]: item }));
		}
	};

	const updatePriority = (tagId: string, side: Side, priority: 1 | 2 | 3) => {
		const setter = side === 'green' ? setGreen : setRed;
		setter((prev) => ({
			...prev,
			[tagId]: { ...prev[tagId], priority },
		}));
	};

	const removeTag = (tagId: string, side: Side) => {
		const setter = side === 'green' ? setGreen : setRed;
		setter((prev) => {
			const newSide = { ...prev };
			delete newSide[tagId];
			return newSide;
		});
	};

	const handleDropToGreen = () => {
		if (!draggingId) return;
		const tag = groupedByCategory.flatMap(([, tags]) => tags).find((t) => t.id === draggingId);
		if (tag) {
			addToSide(tag, 'green');
			endDrag();
		}
	};

	const handleDropToRed = () => {
		if (!draggingId) return;
		const tag = groupedByCategory.flatMap(([, tags]) => tags).find((t) => t.id === draggingId);
		if (tag) {
			addToSide(tag, 'red');
			endDrag();
		}
	};

	const handleSave = useCallback(() => {
		const greenFlags = Object.values(green).map((item) => item.tag.name);
		const redFlags = Object.values(red).map((item) => item.tag.name);
		onSave(greenFlags, redFlags);
		onClose();
	}, [green, red, onSave, onClose]);

	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Modal isOpen={isOpen} onClose={handleClose} className={styles.flagsModal}>
			<div className={styles.container}>
				<div className={styles.header}>
					<h2 className={styles.title}>Выбери флаги для "{companyName}"</h2>
					<p className={styles.subtitle}>
						Перетащите флаги в зеленые или красные столбцы или нажмите, чтобы добавить
					</p>
				</div>

				<div className={styles.searchSection}>
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search flags..."
						className={styles.searchInput}
					/>
				</div>

				<div className={styles.mainGrid}>
					<FlagsLibrary
						groupedByCategory={groupedByCategory}
						onTagClick={(tag) => addToSide(tag, 'green')}
						onTagDragStart={startDrag}
						onTagDragEnd={endDrag}
						onAddToGreen={(tag) => addToSide(tag, 'green')}
						onAddToRed={(tag) => addToSide(tag, 'red')}
						greenTags={green}
						redTags={red}
					/>

					<FlagsColumns
						green={green}
						red={red}
						onDropToGreen={handleDropToGreen}
						onDropToRed={handleDropToRed}
						onTagClick={() => {}}
						onUpdatePriority={updatePriority}
						onRemoveTag={removeTag}
						onMoveAcross={moveAcross}
					/>
				</div>

				<div className={styles.actions}>
					<Button variant="secondary" onClick={handleClose}>
						Отменить
					</Button>
					<Button variant="primary" onClick={handleSave}>
						Сохранить флаги
					</Button>
				</div>
			</div>
		</Modal>
	);
};
