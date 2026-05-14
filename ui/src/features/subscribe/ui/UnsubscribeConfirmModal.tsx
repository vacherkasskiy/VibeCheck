import { LogOut } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './UnsubscribeConfirmModal.module.css';

interface UnsubscribeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userNickname?: string;
}

export const UnsubscribeConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  userNickname,
}: UnsubscribeConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <LogOut size={22} />
        </div>
        <div>
          <h3 className={styles.title}>Подтвердите отписку</h3>
          <p className={styles.text}>
            {userNickname ? (
              <>
                Вы перестанете видеть обновления от{' '}
                <span className={styles.nickname}>@{userNickname}</span>.
              </>
            ) : (
              'Вы уверены, что хотите отписаться от этого профиля?'
            )}
          </p>
        </div>
        <div className={styles.actions}>
          <Button onClick={onClose} variant="secondary" size="small">
            Отмена
          </Button>
          <Button onClick={onConfirm} size="small">
            Отписаться
          </Button>
        </div>
      </div>
    </Modal>
  );
};
