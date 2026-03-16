import { ALL_TAGS, PRIORITY_OPTIONS } from 'entities/tag';
import { filterTags, groupByCategory } from 'entities/tag';
import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockAuth } from 'shared/model';
import type { Tag, SelectedTag, Category } from 'entities/tag';

export type Side = 'green' | 'red';

export const useFlags = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context: 'register' | 'review' = (location.state?.context as any) || 'register';

  const [query, setQuery] = useState('');
  const [green, setGreen] = useState<Record<string, SelectedTag>>({});
  const [red, setRed] = useState<Record<string, SelectedTag>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [modalTag, setModalTag] = useState<Tag | null>(null);
  const [showConflict, setShowConflict] = useState<{ tag: Tag; target: Side } | null>(null);

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    const excludeIds = Array.from(new Set(Object.keys(green).concat(Object.keys(red))));
    return filterTags(ALL_TAGS, q, excludeIds);
  }, [query, green, red]);

  const groupedByCategory = useMemo(() => 
    groupByCategory(filteredTags), 
    [filteredTags]
  );

  const startDrag = (id: string) => setDraggingId(id);
  const endDrag = () => setDraggingId(null);

  const addToSide = (tag: Tag, side: Side) => {
    const inGreen = green[tag.id];
    const inRed = red[tag.id];
    if ((side === 'green' && inRed) || (side === 'red' && inGreen)) {
      setShowConflict({ tag, target: side });
      return;
    }
    const selected: SelectedTag = { tag, priority: 3 };
    if (side === 'green') {
      setGreen(prev => ({ ...prev, [tag.id]: selected }));
    } else {
      setRed(prev => ({ ...prev, [tag.id]: selected }));
    }
  };

  const moveAcross = (tagId: string, to: Side) => {
    const src = to === 'green' ? red : green;
    const item = src[tagId];
    if (!item) return;
    if (to === 'green') {
      setRed(prev => {
        const newRed = { ...prev };
        delete newRed[tagId];
        return newRed;
      });
      setGreen(prev => ({ ...prev, [tagId]: item }));
    } else {
      setGreen(prev => {
        const newGreen = { ...prev };
        delete newGreen[tagId];
        return newGreen;
      });
      setRed(prev => ({ ...prev, [tagId]: item }));
    }
  };

  const updatePriority = (tagId: string, side: Side, priority: 1 | 2 | 3) => {
    const setter = side === 'green' ? setGreen : setRed;
    setter(prev => ({
      ...prev,
      [tagId]: { ...prev[tagId], priority }
    }));
  };

  const removeTag = (tagId: string, side: Side) => {
    const setter = side === 'green' ? setGreen : setRed;
    setter(prev => {
      const newSide = { ...prev };
      delete newSide[tagId];
      return newSide;
    });
  };

  const onSave = () => {
    // TODO: Integrate with auth context later
    console.log('Flags saved:', { green: Object.values(green), red: Object.values(red) });
    navigate('/recommendations', { state: { context } });
  };

  const closeModal = () => setModalTag(null);
  const closeConflict = () => setShowConflict(null);

  return {
    context,
    query,
    setQuery,
    green,
    red,
    draggingId,
    modalTag,
    showConflict,
    filteredTags,
    groupedByCategory,
    startDrag,
    endDrag,
    addToSide,
    moveAcross,
    updatePriority,
    removeTag,
    onSave,
    closeModal,
    closeConflict,
  };
};
