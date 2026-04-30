import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Top20FlagsSection as WidgetTop20FlagsSection } from '../../../widgets/Top20FlagsSection';
import { useCompanyFlags } from 'features/companyPage/model/useCompanyFlags';
import styles from './Top20FlagsSection.module.css';
import type { CompanyFlag } from 'entities/company';

export const Top20FlagsSection = () => {
  const { id } = useParams<{ id: string }>();
  
  const { 
    flags, 
    loading, 
    error 
  } = useCompanyFlags(id);

  const top20Flags = useMemo(() => {
    return flags
      .slice(0, 20)
      .sort((a: CompanyFlag, b: CompanyFlag) => b.count - a.count);
  }, [flags]);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>Загрузка топ-20 флагов...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.error}>Не удалось загрузить топ флагов</div>
      </section>
    );
  }

  return <WidgetTop20FlagsSection flags={top20Flags} />;
};
