import { Badge } from 'shared/ui';
import styles from './styles.module.css';
import type { CompanyDTO } from '../../../model/types';
import type { FC } from 'react';

interface CompanyCardProps {
	company: CompanyDTO;
	onClick?: (id: string) => void;
	className?: string;
}

export const CompanyCard: FC<CompanyCardProps> = ({ company, onClick, className = '' }) => {
	const companyName = company.name ?? 'Компания';
	const topFlags = company.topFlags ?? [];

	const handleClick = () => {
		if (onClick) {
			onClick(company.companyId);
		}
	};

	return (
		<div className={`${styles.companyCard} ${className}`} onClick={handleClick}>
			<div className={styles.companyHeader}>
				<div className={styles.companyLogo}>{companyName.charAt(0)}</div>
				<div className={styles.companyInfo}>
					<div className={styles.companyName}>{companyName}</div>
					<div className={styles.companyTags}>
						<svg
							className={styles.companyTagsIcon}
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span>топ-5 флагов</span>
					</div>
				</div>
			</div>

			<div className={styles.flagsSection}>
				<div className={styles.flagsTitle}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
						<path
							d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<span>Топ-5 флагов</span>
				</div>

				<div className={styles.flagsContainer}>
					{topFlags.slice(0, 5).map((flag, index) => (
						<Badge
							key={flag.id}
							variant={index < 3 ? 'success' : 'danger'}
							size="small"
						>
							{flag.name ?? 'Флаг'}
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
};
