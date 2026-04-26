import styles from './TagInfoModal.module.css';
import type { Tag } from 'entities/tag';

interface TagInfoModalProps {
	tag: Tag | null;
	isOpen: boolean;
	onClose: () => void;
	onAddToGreen?: (tag: Tag) => void;
	onAddToRed?: (tag: Tag) => void;
	isInGreen?: boolean;
	isInRed?: boolean;
}

export const TagInfoModal = ({
	tag,
	isOpen,
	onClose,
	onAddToGreen,
	onAddToRed,
	isInGreen = false,
	isInRed = false,
}: TagInfoModalProps) => {
	if (!isOpen || !tag) return null;

	const handleAddToGreen = () => {
		onAddToGreen?.(tag);
		onClose();
	};

	const handleAddToRed = () => {
		onAddToRed?.(tag);
		onClose();
	};

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<button className={styles.closeButton} onClick={onClose}>
					×
				</button>
				<h3 className={styles.title}>{tag.name}</h3>
				<p className={styles.description}>{tag.description}</p>
				<div className={styles.category}>
					<span className={styles.categoryLabel}>Категория:</span>
					<span className={styles.categoryValue}>{tag.category}</span>
				</div>

				<div className={styles.actions}>
					<button
						className={`${styles.actionButton} ${styles.greenButton}`}
						onClick={handleAddToGreen}
						disabled={isInGreen}
					>
						{isInGreen ? '✓ Добавлено в зелёные' : '+ Добавить в зелёные'}
					</button>
					<button
						className={`${styles.actionButton} ${styles.redButton}`}
						onClick={handleAddToRed}
						disabled={isInRed}
					>
						{isInRed ? '✓ Добавлено в красные' : '+ Добавить в красные'}
					</button>
				</div>
			</div>
		</div>
	);
};
