import { useGetAllFlags, PRIORITY_OPTIONS } from 'entities/tag';
import { filterTags, groupByCategory } from 'entities/tag';
import { ALL_TAGS } from 'entities/tag';
import { userApi } from 'entities/user';
import { completeCurrentOnboardingStep } from 'features/auth';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from 'shared/ui/Toast';
import type { Tag, SelectedTag, Category } from 'entities/tag';
import type { SetUserFlagsRequest } from 'entities/user';

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
  const [showConflict, setShowConflict] = useState<{ tag: Tag; target: Side; type: 'duplicate' | 'move' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { flags: apiTags, isLoading, error } = useGetAllFlags();
  const allTags = isLoading || error ? ALL_TAGS : apiTags;

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filterTags(allTags, q, []);
  }, [query, allTags]);

  const groupedByCategory = useMemo(() => 
    groupByCategory(filteredTags), 
    [filteredTags]
  );

  const startDrag = (id: string) => setDraggingId(id);
  const endDrag = () => setDraggingId(null);

  const addToSide = (tag: Tag, side: Side) => {
    const targetState = side === 'green' ? green : red;
    const oppositeState = side === 'green' ? red : green;
    const opposite = oppositeState[tag.id];
    const alreadyInTarget = !!targetState[tag.id];

    if (alreadyInTarget) {
      setShowConflict({ tag, target: side, type: 'duplicate' as const });
      return;
    }
    if (opposite) {
      setShowConflict({ tag, target: side, type: 'move' as const });
      return;
    }

  const selected: SelectedTag = { tag, priority: 3 };
    if (side === 'green') {
      setGreen(prev => ({ ...prev, [tag.id]: selected }));
    } else {
      setRed(prev => ({ ...prev, [tag.id]: selected }));
    }
  };

  const moveAcross = (tagId: string, to: Side, type?: 'duplicate' | 'move') => {
    if (type === 'duplicate') return;
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

  const { showToast } = useToast();

  const onSave = async () => {
    const totalFlags = Object.keys(green).length + Object.keys(red).length;
    if (totalFlags === 0) {
      showToast('Выберите хотя бы один green или red флаг на странице флагов, чтобы разблокировать рекомендации', 'error');
      navigate('/flags');
      return;
    }

    setIsSaving(true);
    try {
      const greenFlags = Object.values(green);
      const redFlags = Object.values(red);

      const greenGroups = [1, 2, 3].map(p => ({
        weight: p,
        flags: greenFlags.filter(f => f.priority === p).map(f => f.tag.id)
      })).filter((g): g is {weight: 1|2|3, flags: string[]} => g.flags.length > 0);

      const redGroups = [1, 2, 3].map(p => ({
        weight: p,
        flags: redFlags.filter(f => f.priority === p).map(f => f.tag.id)
      })).filter((r): r is {weight: 1|2|3, flags: string[]} => r.flags.length > 0);

      const requestBody: SetUserFlagsRequest = {
        greenFlags: greenGroups,
        redFlags: redGroups,
      };

      await userApi.setUserFlags(requestBody);
      if (context === 'register') {
        await completeCurrentOnboardingStep().catch(() => undefined);
      }
      showToast('Флаги сохранены успешно!', 'success');
      navigate('/recommendations', { state: { context } });
    } catch (error: any) {
      const status = error.response?.status || 500;
      let message = 'Ошибка сохранения флагов';
      if (status === 400) message = 'Неверные данные флагов';
      else if (status === 401) message = 'Не авторизован. Войдите в аккаунт';
      else if (status === 500) message = 'Ошибка сервера. Попробуйте позже';
      showToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
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
    isSaving,
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
