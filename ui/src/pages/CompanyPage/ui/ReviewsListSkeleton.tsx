import styles from './ReviewsListSkeleton.module.css';
import type { FC } from 'react';

interface ReviewsListSkeletonProps {
  className?: string;
}

export const ReviewsListSkeleton: FC<ReviewsListSkeletonProps> = ({ className }) => (
	<div className={`${styles.container} ${className || ''}`}>
		<div className={styles.header}>
			<div className={`${styles.title} ${styles.skeleton}`} />
		</div>
		<div className={styles.list}>
			{[...Array(3)].map((_, i) => (
				<div key={i} className={styles.reviewItem}>
					<div className={styles.reviewHeader}>
						<div className={`${styles.avatar} ${styles.skeleton}`} />
						<div className={styles.reviewInfo}>
							<div className={`${styles.authorName} ${styles.skeleton}`} />
							<div className={`${styles.date} ${styles.skeleton}`} />
						</div>
					</div>
					<div className={styles.reviewContent}>
						<div className={`${styles.contentLine} ${styles.skeleton}`} />
						<div className={`${styles.contentLine} ${styles.skeleton}`} />
						<div className={`${styles.contentLineShort} ${styles.skeleton}`} />
					</div>
					<div className={styles.reviewFlags}>
						{[...Array(3)].map((_, j) => (
							<div key={j} className={`${styles.flag} ${styles.skeleton}`} />
						))}
					</div>
				</div>
			))}
		</div>
	</div>
);
