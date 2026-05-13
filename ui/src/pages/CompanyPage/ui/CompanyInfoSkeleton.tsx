import styles from './CompanyInfoSkeleton.module.css';
import type { FC } from 'react';

export const CompanyInfoSkeleton: FC = () => (
	<div className={styles.container}>
		<div className={styles.header}>
			<div className={styles.logoSection}>
				<div className={`${styles.logo} ${styles.skeleton}`} />
				<div className={styles.nameSection}>
					<div className={`${styles.name} ${styles.skeleton}`} />
					<div className={styles.contacts}>
						{[...Array(3)].map((_, i) => (
							<div key={i} className={`${styles.contact} ${styles.skeleton}`} />
						))}
					</div>
				</div>
			</div>
		</div>
		<div className={styles.description}>
			<div className={`${styles.descriptionLine} ${styles.skeleton}`} />
			<div className={`${styles.descriptionLine} ${styles.skeleton}`} />
			<div className={`${styles.descriptionLineShort} ${styles.skeleton}`} />
		</div>
	</div>
);
