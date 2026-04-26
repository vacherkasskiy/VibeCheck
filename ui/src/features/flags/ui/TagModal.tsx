import { Tag } from 'entities/tag';
import { Button } from 'shared/ui/Button';
import styles from './TagModal.module.css';
import type { TagModalProps } from './types';

export const TagModal = ({ tag, isOpen, onClose, onAddGreen, onAddRed }: TagModalProps) => {
	if (!isOpen || !tag) return null;

	const handleAddGreen = () => {
		onAddGreen(tag);
		onClose();
	};

	const handleAddRed = () => {
		onAddRed(tag);
		onClose();
	};

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<h3 className={styles.title}>{tag.name}</h3>
				<p className={styles.description}>{tag.description}</p>
				<div className={styles.buttons}>
					<Button variant="secondary" size="medium" onClick={onClose}>
						Закрыть
					</Button>
					<Button variant="primary" size="medium" onClick={handleAddGreen}>
						Green
					</Button>
					<Button variant="primary" size="medium" onClick={handleAddRed}>
						Red
					</Button>
				</div>
			</div>
		</div>
	);
};
