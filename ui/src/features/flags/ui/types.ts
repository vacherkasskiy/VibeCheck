import type { Side } from '../model/useFlags';
import type { Tag } from 'entities/tag';

export interface TagModalProps {
  tag: Tag | null;
  isOpen: boolean;
  onClose: () => void;
  onAddGreen: (tag: Tag) => void;
  onAddRed: (tag: Tag) => void;
}

export interface ConflictDialogProps {
  conflict: { tag: Tag; target: Side; type: 'duplicate' | 'move' } | null;
  isOpen: boolean;
  onClose: () => void;
  onMove: (tagId: string, target: Side, type?: 'duplicate' | 'move') => void;
}
