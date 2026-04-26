import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './styles.module.css';

interface DeleteReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	reviewCompanyName: string;
}

export const DeleteReviewModal = ({
	isOpen,
	onClose,
	onConfirm,
	reviewCompanyName,
}: DeleteReviewModalProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>⚠️ Подтверждение удаления</h2>
					<button className={styles.closeButton} onClick={onClose} type="button">
						✕
					</button>
				</div>

				<div className={styles.deleteConfirmation}>
					<p className={styles.deleteText}>
						Вы уверены, что хотите удалить отзыв о компании{' '}
						<strong>{reviewCompanyName}</strong>?
					</p>
					<p className={styles.deleteWarning}>Это действие нельзя отменить.</p>
				</div>

				<div className={styles.modalFooter}>
					<Button onClick={onClose} variant="secondary" size="small">
						Отмена
					</Button>
					<Button
						onClick={onConfirm}
						variant="primary"
						size="small"
						className={styles.deleteConfirmButton}
					>
						Удалить
					</Button>
				</div>
			</div>
		</Modal>
	);
};
