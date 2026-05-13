import { useCompanyFlags } from 'features/companyPage';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { TopFlagsSection as WidgetTopFlagsSection } from 'widgets/TopFlagsSection';
import styles from './TopFlagsSection.module.css';
import type { CompanyFlag } from 'entities/company';

export const Top20FlagsSection = () => {
  const { id } = useParams<{ id: string }>();
  
  const { flags, loading } = useCompanyFlags(id);

  const topFlags = useMemo(() => {
    return flags
      .slice(0, 20)
      .sort((a: CompanyFlag, b: CompanyFlag) => b.count - a.count);
  }, [flags]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>Загрузка топ флагов...</div>
      </section>
    );
  }

return <WidgetTopFlagsSection flags={topFlags} totalCount={flags.length} />;
};
