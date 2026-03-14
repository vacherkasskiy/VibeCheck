import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCompanies } from 'shared/model/mockCompanies';
import { Button } from 'shared/ui/Button';
import styles from './RecommendationsPage.module.css';
import type { CompanyDTO } from 'shared/model/mockCompanies';

const Spinner = () => (
  <div className={styles.spinnerContainer}>
    <div className={styles.spinner} />
  </div>
);

const CompanyCard = ({ company }: { company: CompanyDTO }) => {
  return (
    <div className={styles.companyCard}>
      <div className={styles.companyHeader}>
        <div className={styles.companyLogo}>{company.name.charAt(0)}</div>
        <div>
          <div className={styles.companyName}>{company.name}</div>
          <div className={styles.companyTags}>
            <svg className={styles.companyTagsIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>топ-5 флагов</span>
          </div>
        </div>
      </div>
      
      <div className={styles.flagsSection}>
        <div className={styles.flagsTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Топ-5 флагов</span>
        </div>
        
        <div className={styles.flagsContainer}>
          {company.topFlags.slice(0, 5).map((flag, index) => (
            <div 
              key={flag.id} 
              className={`${styles.flag} ${index < 3 ? styles.green : styles.red}`}
            >
              <span>{flag.name}</span>
              <span className={styles.flagCount}>{flag.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [items, setItems] = useState<CompanyDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (reset = false) => {
      setPending(true);
      const res = await mockCompanies.fetchCompanies({
        q: query,
        offset: reset ? 0 : offset,
        limit: 10,
      });
      if (res.ok) {
        setTotal(res.data.total);
        if (reset) {
          setItems(res.data.items);
          setOffset(10);
          setHasMore(res.data.items.length < res.data.total);
        } else {
          setItems((prev) => [...prev, ...res.data.items]);
          setOffset((prev) => prev + res.data.items.length);
          setHasMore(offset + res.data.items.length < res.data.total);
        }
      }
      setPending(false);
    },
    [query, offset]
  );

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(true);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, load]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observer.current?.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !pending) {
        load(false);
      }
    });
    observer.current.observe(sentinelRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, pending, load]);

  const onCardClick = (id: string) => navigate(`/company/${id}`);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<img src="/assets/vibecheck-favicon.png" alt="VibeCheck" style={{ width: 32, height: 28, borderRadius: 6 }} />
				</div>
          <span className={styles.logoText}>VibeCheck</span>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#9aa0a6" strokeWidth="2" />
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="#9aa0a6"
                strokeWidth="2"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск компании"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            Профиль
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        {pending && items.length === 0 ? (
          <Spinner />
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyStateTitle}>
              Похоже, такой компании пока нет в нашей базе
            </h2>
            <p className={styles.emptyStateText}>
              Вы можете стать первым, кто её добавит. Просто заполните форму
              добавления компании.
            </p>
            <Button variant="primary" onClick={() => navigate('/company/new')}>
              Предложить компанию
            </Button>
          </div>
        ) : (
          <>
            {items.map((c) => (
              <div key={c.id} onClick={() => onCardClick(c.id)}>
                <CompanyCard company={c} />
              </div>
            ))}
            {pending && <Spinner />}
            <div ref={sentinelRef} />
          </>
        )}
      </main>
    </div>
  );
};