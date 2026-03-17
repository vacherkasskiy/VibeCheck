import type { Side } from '../model/useFlags';
import type { Tag } from 'entities/tag/model/types';

export interface TagModalProps {
  tag: Tag | null;
  isOpen: boolean;
  onClose: () => void;
  onAddGreen: (tag: Tag) => void;
  onAddRed: (tag: Tag) => void;
}

export interface ConflictDialogProps {
  conflict: { tag: Tag; target: Side } | null;
  isOpen: boolean;
  onClose: () => void;
  onMove: (tagId: string, target: Side) => void;
}
