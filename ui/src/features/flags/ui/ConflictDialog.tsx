import { Button } from 'shared/ui/Button';
import styles from './ConflictDialog.module.css';
import type { ConflictDialogProps } from './types';

export const ConflictDialog = ({ conflict, isOpen, onClose, onMove }: ConflictDialogProps) => {
	if (!isOpen || !conflict) return null;

	const handleMove = () => {
		onMove(conflict.tag.id, conflict.target, conflict.type);
		onClose();
	};

	return (
		<div className={styles.overlay} onClick={onClose}>
			<div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
				<h3 className={styles.title}>Конфликт выбора</h3>
				<p className={styles.message}>
					{conflict.type === 'duplicate'
						? `Флаг "${conflict.tag.name}" уже добавлен в ${conflict.target === 'green' ? 'зеленые' : 'красные'}. Хотите обновить?`
						: `Флаг "${conflict.tag.name}" уже в противоположной категории. Переместить в ${conflict.target === 'green' ? 'зеленые' : 'красные'}?`}
				</p>
				<div className={styles.buttons}>
					<Button variant="secondary" size="medium" onClick={onClose}>
						Отмена
					</Button>
					<Button variant="primary" size="medium" onClick={handleMove}>
						Переместить
					</Button>
				</div>
			</div>
		</div>
	);
};
