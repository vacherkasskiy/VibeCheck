import { useGetAllFlags } from 'entities/tag';
import { filterTags, groupByCategory } from 'entities/tag';
import { ALL_TAGS } from 'entities/tag';
import { userApi } from 'entities/user';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from 'shared/ui/Toast';
import type { Tag, SelectedTag } from 'entities/tag';
import type { SetUserFlagsRequest, UserFlag } from 'entities/user';

export type Side = 'green' | 'red';

const DEFAULT_SELECTED_PRIORITY: SelectedTag['priority'] = 3;

const normalizePriority = (priority: number): SelectedTag['priority'] => {
  if (priority === 1 || priority === 2 || priority === 3) return priority;
  return DEFAULT_SELECTED_PRIORITY;
};

const getFlagNameKey = (name: string): string => name.trim().toLowerCase();

const mapUserFlagsToSelectedTags = (
  userFlags: UserFlag[],
  availableTags: Tag[],
): Record<string, SelectedTag> => {
  const tagsById = new Map(availableTags.map((tag) => [tag.id, tag]));
  const tagsByName = new Map(availableTags.map((tag) => [getFlagNameKey(tag.name), tag]));

  return userFlags.reduce<Record<string, SelectedTag>>((acc, userFlag) => {
    const tag =
      tagsById.get(userFlag.id) ??
      tagsByName.get(getFlagNameKey(userFlag.name)) ??
      ({
        id: userFlag.id,
        name: userFlag.name || userFlag.id,
        description: '',
        category: 'Культура',
      } satisfies Tag);

    acc[tag.id] = {
      tag,
      priority: normalizePriority(userFlag.priority),
    };

    return acc;
  }, {});
};

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
  const hasHydratedUserFlags = useRef(false);
  const hasLocalFlagChanges = useRef(false);

  const { flags: apiTags, isLoading, error } = useGetAllFlags();
  const allTags = isLoading || error ? ALL_TAGS : apiTags;

  useEffect(() => {
    if (isLoading || hasHydratedUserFlags.current) return;

    let isActive = true;

    userApi.fetchUserFlags()
      .then((userFlags) => {
        if (!isActive) return;

        hasHydratedUserFlags.current = true;
        if (hasLocalFlagChanges.current) return;

        setGreen(mapUserFlagsToSelectedTags(userFlags.green, allTags));
        setRed(mapUserFlagsToSelectedTags(userFlags.red, allTags));
      })
      .catch(() => {
        if (isActive) {
          hasHydratedUserFlags.current = true;
        }
      });

    return () => {
      isActive = false;
    };
  }, [allTags, isLoading]);

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

  const markLocalFlagChanges = () => {
    hasLocalFlagChanges.current = true;
  };

  const addToSide = (tag: Tag, side: Side) => {
    markLocalFlagChanges();

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

    const selected: SelectedTag = { tag, priority: DEFAULT_SELECTED_PRIORITY };
    if (side === 'green') {
      setGreen(prev => ({ ...prev, [tag.id]: selected }));
    } else {
      setRed(prev => ({ ...prev, [tag.id]: selected }));
    }
  };

  const moveAcross = (tagId: string, to: Side, type?: 'duplicate' | 'move') => {
    if (type === 'duplicate') return;
    markLocalFlagChanges();

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
    markLocalFlagChanges();

    const setter = side === 'green' ? setGreen : setRed;
    setter(prev => ({
      ...prev,
      [tagId]: { ...prev[tagId], priority }
    }));
  };

  const removeTag = (tagId: string, side: Side) => {
    markLocalFlagChanges();

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
        await userApi.completeCurrentOnboardingStep().catch(() => undefined);
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
