// widgets/CompanyList/CompanyCardSkeleton.tsx
import styles from './styles.module.css';
import type { FC } from 'react';

export const CompanyCardSkeleton: FC = () => (
  <div className={styles.cardSkeleton}>
    <div className={styles.skeletonHeader}>
      <div className={`${styles.skeletonLogo} ${styles.skeleton}`} />
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeletonLine} ${styles.skeletonName} ${styles.skeleton}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonTags} ${styles.skeleton}`} />
      </div>
    </div>
    
    <div className={styles.skeletonFlags}>
      <div className={`${styles.skeletonLine} ${styles.skeletonFlagsTitle} ${styles.skeleton}`} />
      <div className={styles.skeletonBadges}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${styles.skeletonBadge} ${styles.skeleton}`} />
        ))}
      </div>
    </div>
  </div>
);