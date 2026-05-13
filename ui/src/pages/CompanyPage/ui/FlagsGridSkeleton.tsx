import styles from './FlagsGridSkeleton.module.css';
import type { FC } from 'react';

export const FlagsGridSkeleton: FC = () => (
	<div className={styles.container}>
		<div className={styles.title}>
			<div className={`${styles.titleLine} ${styles.skeleton}`} />
		</div>
		<div className={styles.grid}>
			{[...Array(8)].map((_, i) => (
				<div key={i} className={styles.flagItem}>
					<div className={`${styles.flagBadge} ${styles.skeleton}`} />
					<div className={`${styles.flagLabel} ${styles.skeleton}`} />
					<div className={`${styles.flagCount} ${styles.skeleton}`} />
				</div>
			))}
		</div>
	</div>
);
