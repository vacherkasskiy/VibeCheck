// widgets/CompanyList/index.tsx
import { CompanyCard } from 'entities/company';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { CompanyCardSkeleton } from './CompanyCardSkeleton';
import styles from './styles.module.css';
import type { CompanyDTO } from 'entities/company';
import type { FC } from 'react';

interface CompanyListProps {
  items: CompanyDTO[];
  pending: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onCardClick?: (id: string) => void;
  className?: string;
}

export const CompanyList: FC<CompanyListProps> = ({
  items,
  pending,
  hasMore,
  onLoadMore,
  onCardClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observer.current?.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !pending) {
        onLoadMore();
      }
    });

    observer.current.observe(sentinelRef.current);
    return () => observer.current?.disconnect();
  }, [hasMore, pending, onLoadMore]);

  const handleCardClick = (id: string) => {
    if (onCardClick) onCardClick(id);
    else navigate(`/company/${id}`);
  };

  if (items.length === 0 && pending) {
    return (
      <div className={`${styles.list} ${className}`}>
        {[...Array(4)].map((_, i) => (
          <CompanyCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`${styles.list} ${className}`}>
      {items.map((company) => (
        <div key={company.id} onClick={() => handleCardClick(company.id)}>
          <CompanyCard company={company} />
        </div>
      ))}

      {pending && hasMore && (
        <>
          {[...Array(2)].map((_, i) => (
            <CompanyCardSkeleton key={`load-more-${i}`} />
          ))}
        </>
      )}

      <div ref={sentinelRef} className={styles.sentinel} />
    </div>
  );
};

const EmptyState: FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.emptyState}>
      <h2 className={styles.emptyStateTitle}>Компания не найдена</h2>
      <p className={styles.emptyStateText}>
        Попробуйте изменить запрос или предложите компанию для добавления.
      </p>
      <Button variant="primary" onClick={() => navigate('/add-company')}>
        Предложить компанию
      </Button>
    </div>
  );
};