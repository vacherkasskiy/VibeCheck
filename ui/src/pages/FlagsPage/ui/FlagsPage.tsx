import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mockAuth } from 'shared/model/mockAuth';
import { Button } from 'shared/ui/Button';
import { CenterGlow } from 'shared/ui/CenterGlow';
import styles from './FlagsPage.module.css';

// Mock tags dataset (replace with backend later)
export type Category = 'Культура' | 'Менеджмент' | 'Процессы' | 'Коммуникации' | 'Имидж';
export interface Tag {
  id: string;
  name: string;
  description: string;
  category: Category;
}

const ALL_TAGS: Tag[] = [
  { id: 't1', name: 'Гибкий график', description: 'Гибкое время начала/окончания рабочего дня', category: 'Процессы' },
  { id: 't2', name: 'Удаленная работа', description: 'Возможность работать удалённо', category: 'Процессы' },
  { id: 't3', name: 'Дружелюбная атмосфера', description: 'Поддерживающая и открытая культура', category: 'Культура' },
  { id: 't4', name: 'Открытая коммуникация', description: 'Прозрачная коммуникация руководства', category: 'Коммуникации' },
  { id: 't5', name: 'Профессиональный рост', description: 'Поддержка обучения и роста', category: 'Имидж' },
  { id: 't6', name: 'Микроменеджмент', description: 'Чрезмерный контроль со стороны руководства', category: 'Менеджмент' },
  { id: 't7', name: 'Переработки', description: 'Регулярные сверхурочные', category: 'Процессы' },
  { id: 't8', name: 'Токсичная культура', description: 'Нездоровая атмосфера в коллективе', category: 'Культура' },
  { id: 't9', name: 'Дают печеньки', description: 'Бонусы и плюшки в офисе', category: 'Культура' },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: 'Высокий (1)' },
  { value: 2, label: 'Средний (2)' },
  { value: 3, label: 'Низкий (3)' },
] as const;

type Side = 'green' | 'red';

interface SelectedTag {
  tag: Tag;
  priority: 1 | 2 | 3;
}

export const FlagsPage = () => {
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
    const excludeIds = new Set<string>([...Object.keys(green), ...Object.keys(red)]);
    return ALL_TAGS.filter((t) => {
      if (excludeIds.has(t.id)) return false; 
      if (!q) return true;
      return t.name.toLowerCase().includes(q);
    });
  }, [query, green, red]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<Category, Tag[]>();
    for (const tag of filteredTags) {
      if (!groups.has(tag.category)) groups.set(tag.category as Category, []);
      groups.get(tag.category as Category)!.push(tag);
    }
    return Array.from(groups.entries());
  }, [filteredTags]);

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
    if (side === 'green') setGreen((s) => ({ ...s, [tag.id]: selected }));
    else setRed((s) => ({ ...s, [tag.id]: selected }));
  };

  const moveAcross = (tagId: string, to: Side) => {
    const src = to === 'green' ? red : green;
    const item = src[tagId];
    if (!item) return;
    if (to === 'green') {
      setRed(({ [tagId]: _, ...rest }) => rest);
      setGreen((s) => ({ ...s, [tagId]: item }));
    } else {
      setGreen(({ [tagId]: _, ...rest }) => rest);
      setRed((s) => ({ ...s, [tagId]: item }));
    }
  };

  const removeFromSide = (id: string, side: Side) => {
    if (side === 'green') setGreen(({ [id]: _, ...rest }) => rest);
    else setRed(({ [id]: _, ...rest }) => rest);
  };

  const updatePriority = (id: string, side: Side, p: 1 | 2 | 3) => {
    if (side === 'green') setGreen((s) => ({ ...s, [id]: { ...s[id], priority: p } }));
    else setRed((s) => ({ ...s, [id]: { ...s[id], priority: p } }));
  };

  const onDropTo = (side: Side) => {
    if (!draggingId) return;
    const tag = ALL_TAGS.find((t) => t.id === draggingId);
    if (!tag) return;
    addToSide(tag, side);
    endDrag();
  };

  const onContinue = () => {
    const prefs = {
      green: Object.values(green).map((v) => ({ id: v.tag.id, priority: v.priority })),
      red: Object.values(red).map((v) => ({ id: v.tag.id, priority: v.priority })),
    };
    mockAuth.saveFlags(prefs);
    if (context === 'register') {
      navigate('/recommendations', { replace: true });
    } else {
      navigate('/review/text', { state: { green, red } });
    }
  };

  const handleTagClick = (tag: Tag) => setModalTag(tag);

  useEffect(() => {
    // optional: load from backend later
  }, []);

  return (
    <div className={styles.container}>
      <CenterGlow />
      <header className={styles.header}>
        <button className={styles.headerBack} onClick={() => navigate(-1)}>
          Назад
        </button>
        <div className={styles.headerContent}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<img src="/assets/vibecheck-favicon.png" alt="VibeCheck" style={{ width: 64, height: 50, borderRadius: 6 }} />
				</div>
          <h1 className={styles.headerTitle}>Выберите свой green и red флаги</h1>
          <p className={styles.headerSubtitle}>
            Выбери свои предпочтения на основе нейтральных тегов
          </p>
        </div>
        <Button variant="primary" onClick={onContinue}>
          Продолжить
        </Button>
      </header>

      <div className={styles.mainGrid}>
        {/* Left: library */}
        <section className={styles.library}>
          <input
            type="text"
            placeholder="Поиск тегов"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />

          <div className={styles.tagsGrid}>
            {groupedByCategory.map(([cat, tags]) => (
              <div key={cat} className={styles.category}>
                <h3 className={styles.categoryTitle}>{cat}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      onMouseDown={() => startDrag(t.id)}
                      onMouseUp={endDrag}
                      onClick={() => handleTagClick(t)}
                      className={styles.tagButton}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: columns */}
        <section className={styles.flagsContainer}>
          <div
            onMouseUp={() => onDropTo('green')}
            className={`${styles.column} ${styles.greenColumn}`}
          >
            <h3 className={styles.columnTitle}>Green флаги</h3>
            {Object.keys(green).length === 0 ? (
              <p className={styles.emptyMessage}>Перетащите теги сюда</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.values(green).map(({ tag, priority }) => (
                  <div key={tag.id} className={styles.selectedTag}>
                    <button onClick={() => setModalTag(tag)} className={styles.tagLink}>
                      {tag.name}
                    </button>
                    <select
                      value={priority}
                      onChange={(e) => updatePriority(tag.id, 'green', Number(e.target.value) as 1 | 2 | 3)}
                      className={styles.prioritySelect}
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeFromSide(tag.id, 'green')}
                      className={styles.removeButton}
                    >
                      &times;
                    </button>
                    <button
                      onClick={() => moveAcross(tag.id, 'red')}
                      title="Переместить в Red"
                      className={styles.moveButton}
                    >
                      Red
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            onMouseUp={() => onDropTo('red')}
            className={`${styles.column} ${styles.redColumn}`}
          >
            <h3 className={styles.columnTitle}>Red флаги</h3>
            {Object.keys(red).length === 0 ? (
              <p className={styles.emptyMessage}>Перетащите теги сюда</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.values(red).map(({ tag, priority }) => (
                  <div key={tag.id} className={styles.selectedTag}>
                    <button onClick={() => setModalTag(tag)} className={styles.tagLink}>
                      {tag.name}
                    </button>
                    <select
                      value={priority}
                      onChange={(e) => updatePriority(tag.id, 'red', Number(e.target.value) as 1 | 2 | 3)}
                      className={styles.prioritySelect}
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeFromSide(tag.id, 'red')}
                      className={styles.removeButton}
                    >
                      &times;
                    </button>
                    <button
                      onClick={() => moveAcross(tag.id, 'green')}
                      title="Переместить в Green"
                      className={styles.moveButton}
                    >
                      Green
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal: Tag description */}
      {modalTag && (
        <div className={styles.modal} onClick={() => setModalTag(null)}>
          <div onClick={(e) => e.stopPropagation()} className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{modalTag.name}</h3>
            <p className={styles.modalDescription}>{modalTag.description}</p>
            <div className={styles.modalButtons}>
              <Button variant="secondary" onClick={() => setModalTag(null)}>
                Закрыть
              </Button>
              <Button variant="primary" onClick={() => { addToSide(modalTag, 'green'); setModalTag(null); }}>
                Green
              </Button>
              <Button variant="primary" onClick={() => { addToSide(modalTag, 'red'); setModalTag(null); }}>
                Red
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict dialog */}
      {showConflict && (
        <div className={styles.conflictDialog}>
          <div className={styles.conflictDialogContent}>
            <h3 className={styles.conflictTitle}>Конфликт выбора</h3>
            <p className={styles.conflictMessage}>
              Флаг был уже отнесён в другую категорию. Хотите переместить его?
            </p>
            <div className={styles.conflictButtons}>
              <Button variant="secondary" onClick={() => setShowConflict(null)}>
                Отмена
              </Button>
              <Button variant="primary" onClick={() => { moveAcross(showConflict.tag.id, showConflict.target); setShowConflict(null); }}>
                Переместить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};