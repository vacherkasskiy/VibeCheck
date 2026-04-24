import { PRIORITY_OPTIONS } from 'entities/tag';
import { TagInfoModal } from 'features/flags';
import { useState } from 'react';
// eslint-disable-next-line @conarti/feature-sliced/public-api, @conarti/feature-sliced/layers-slices
import styles from '../../FlagsColumns/ui/FlagsColumns.module.css';
import type { SelectedTag, Tag } from 'entities/tag';

interface SingleFlagColumnProps {
  side: 'green' | 'red';
  flags: Record<string, SelectedTag>;
  onDrop?: () => void;
  onTagClick: (tag: Tag) => void;
  onUpdatePriority: (id: string, side: 'green' | 'red', priority: 1 | 2 | 3) => void;
  onRemoveTag: (id: string, side: 'green' | 'red') => void;
  onMoveAcross: (id: string, to: 'green' | 'red') => void;
}

export const SingleFlagColumn = ({
  side,
  flags,
  onDrop,
  onTagClick,
  onUpdatePriority,
  onRemoveTag,
  onMoveAcross,
}: SingleFlagColumnProps) => {
  const [infoTag, setInfoTag] = useState<Tag | null>(null);
  const isGreen = side === 'green';

  const handleTagClick = (tag: Tag) => {
    setInfoTag(tag);
  };

  const handleCloseInfo = () => {
    setInfoTag(null);
  };

  const columnClass = isGreen ? styles.greenColumn : styles.redColumn;
  const title = isGreen ? 'Green флаги' : 'Red флаги';

  return (
    <div onMouseUp={onDrop} className={`${styles.column} ${columnClass}`} style={{ height: '100%' }}>
      <h3 className={styles.columnTitle}>{title}</h3>
      {Object.keys(flags).length === 0 ? (
        <p className={styles.emptyMessage}>Перетащите теги сюда</p>
      ) : (
        <div className={styles.tagsContainer}>
          {Object.values(flags).map(({ tag, priority }) => (
            <div key={tag.id} className={styles.selectedTag}>
              <button
                onClick={() => handleTagClick(tag)}
                className={styles.tagLink}
              >
                {tag.name}
              </button>
              <select
                value={priority}
                onChange={(e) =>
                  onUpdatePriority(
                    tag.id,
                    side,
                    Number(e.target.value) as 1 | 2 | 3,
                  )
                }
                className={styles.prioritySelect}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onRemoveTag(tag.id, side)}
                className={styles.removeButton}
                title="Удалить"
              >
                ×
              </button>
              <button
                onClick={() => onMoveAcross(tag.id, isGreen ? 'red' : 'green')}
                title={`Переместить в ${isGreen ? 'красные' : 'зеленые'}`}
                className={styles.moveButton}
              >
                {isGreen ? 'Red' : 'Green'}
              </button>
            </div>
          ))}
        </div>
      )}
      <TagInfoModal tag={infoTag} isOpen={!!infoTag} onClose={handleCloseInfo} />
    </div>
  );
};

