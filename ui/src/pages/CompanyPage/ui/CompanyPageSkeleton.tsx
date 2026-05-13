import { HeaderGlow, CenterGlow } from 'shared/ui';
import { CompanyInfoSkeleton } from './CompanyInfoSkeleton';
import styles from './CompanyPageSkeleton.module.css';
import { FlagsGridSkeleton } from './FlagsGridSkeleton';
import { ReviewsListSkeleton } from './ReviewsListSkeleton';

export const CompanyPageSkeleton = () => (
	<div className={styles.page}>
		<HeaderGlow />
		<CenterGlow />
		<header className={styles.header}>
			<div className={styles.logoContainer}>
				<div className={`${styles.logo} ${styles.skeleton}`} />
				<div className={`${styles.logoText} ${styles.skeleton}`} />
			</div>
		</header>
		<main className={styles.main}>
			<div className={styles.contentGrid}>
				<div className={styles.leftColumn}>
					<CompanyInfoSkeleton />
					<FlagsGridSkeleton />
				</div>
				<ReviewsListSkeleton className={styles.reviewsColumn} />
			</div>
		</main>
	</div>
);
