import React from 'react';
import styles from './CompanyInfo.module.css';
import type { CompanyDTO } from 'entities/company';

interface CompanyInfoProps {
	company: CompanyDTO;
}

export const CompanyInfo = ({ company }: CompanyInfoProps) => {
	const companyName = company.name ?? 'Компания';
	const links = company.links
		? Object.entries(company.links).filter((entry): entry is [string, string] => Boolean(entry[1]))
		: [];

	const getContactIcon = (type: string) => {
		switch (type) {
			case 'site':
				return '🌐';
			case 'linkedin':
				return '💼';
			case 'hh':
				return 'HH';
			default:
				return '🔗';
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.logoSection}>
					{company.iconUrl ? (
						<img src={company.iconUrl} alt={companyName} className={styles.logo} />
					) : (
						<div className={styles.logoPlaceholder}>
							{companyName.charAt(0).toUpperCase()}
						</div>
					)}
					<div className={styles.nameSection}>
						<h1 className={styles.name}>{companyName}</h1>
						{links.length > 0 && (
							<div className={styles.contacts}>
								{links.map(([type, url]) => (
									<a
										key={type}
										href={url}
										className={styles.contact}
										target="_blank"
										rel="noopener noreferrer"
										title={url}
									>
										<span className={styles.contactIcon}>
											{getContactIcon(type)}
										</span>
									</a>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{company.description && (
				<div className={styles.description}>
					<p>{company.description}</p>
				</div>
			)}
		</div>
	);
};
