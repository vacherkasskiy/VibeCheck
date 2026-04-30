/* eslint-disable @conarti/feature-sliced/layers-slices */
import { useUserFlags } from 'entities/user';
import { Badge } from 'shared/ui';
import styles from './styles.module.css';
import type { CompanyDTO } from '../../../model/types';
import type { UserFlag } from 'entities/user';
import type { FC } from 'react';

interface CompanyCardProps {
	company: CompanyDTO;
	onClick?: (id: string) => void;
	className?: string;
}

const getFlagColor = (flagId: string, userGreenFlags: UserFlag[], userRedFlags: UserFlag[]): 'success' | 'danger' | 'default' => {
  if (userGreenFlags.some(f => f.id === flagId)) return 'success';
  if (userRedFlags.some(f => f.id === flagId)) return 'danger';
  return 'default';
};

export const CompanyCard: FC<CompanyCardProps> = ({ company, onClick, className = '' }) => {
  const { flags: { green: userGreenFlags, red: userRedFlags } } = useUserFlags();
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
          {company.iconUrl ? (
            <img 
              src={company.iconUrl} 
              alt={companyName} 
              className={styles.companyLogo}
              style={{ objectFit: 'contain' }} 
            />
          ) : (
            <div className={styles.companyLogo}>
              {companyName.charAt(0).toUpperCase()}
            </div>
          )}
				<div className={styles.companyInfo}>
					<div className={styles.companyName}>{companyName}</div>

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
{topFlags.slice(0, 5).map((flag) => {
  const color = getFlagColor(flag.id, userGreenFlags, userRedFlags);
  if (color === 'default') {
    return (
      <span key={flag.id} className={styles.flag}>
        {flag.name ?? 'Флаг'}
      </span>
    );
  }
  return (
    <Badge
      key={flag.id}
      variant={color}
      size="small"
    >
      {flag.name ?? 'Флаг'}
    </Badge>
  );
})}
				</div>
			</div>
		</div>
	);
};
