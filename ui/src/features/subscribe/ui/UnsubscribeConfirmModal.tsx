import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';

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
      <div>
        <p>
          {userNickname
            ? `Отписаться от @${userNickname}?`
            : 'Вы уверены, что хотите отписаться?'}
        </p>
        <Button onClick={onConfirm}>Да</Button>
        <Button onClick={onClose} variant="secondary">
          Отмена
        </Button>
      </div>
    </Modal>
  );
};
