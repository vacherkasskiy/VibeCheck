/* eslint-disable @conarti/feature-sliced/layers-slices */
import { useUserFlags } from 'entities/user';
import { Tags } from 'lucide-react';
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
	const previewFlags = topFlags.slice(0, 5);
	const description = company.description?.trim();

	const handleClick = () => {
		if (onClick) {
			onClick(company.companyId);
		}
	};

	return (
		<button type="button" className={`${styles.companyCard} ${className}`} onClick={handleClick}>
			<div className={styles.cardGlow} />
			<div className={styles.companyHeader}>
				<div className={styles.companyLogoFrame}>
					{company.iconUrl ? (
						<img
							src={company.iconUrl}
							alt={companyName}
							className={styles.companyLogoImage}
						/>
					) : (
						<div className={styles.companyLogoFallback}>
							{companyName.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				<div className={styles.companyInfo}>
					<div className={styles.companyName}>{companyName}</div>

				</div>
			</div>

			<div className={styles.companyBody}>
				{description ? (
					<p className={styles.companyDescription}>{description}</p>
				) : (
					<p className={styles.companyDescriptionMuted}>
						Откройте карточку компании, чтобы посмотреть отзывы, описание и топ флагов команды.
					</p>
				)}
			</div>

			<div className={styles.companyFooter}>
				<div className={styles.flagsSection}>
					<div className={styles.flagsTitle}>
						<Tags size={16} strokeWidth={2.2} />
						<span>Топ-флаги</span>
					</div>

					<div className={styles.flagsContainer}>
						{previewFlags.length > 0 ? (
							previewFlags.map((flag) => {
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
							})
						) : (
							<span className={styles.emptyFlags}>Флаги пока не добавлены</span>
						)}
					</div>
				</div>
			</div>
		</button>
	);
};
