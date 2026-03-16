import React from 'react';
import styles from './CompanyInfo.module.css';
import type { CompanyDTO } from 'entities/company';

interface CompanyInfoProps {
	company: CompanyDTO;
}

export const CompanyInfo = ({ company }: CompanyInfoProps) => {
	const getContactIcon = (type: string) => {
		switch (type) {
			case 'website':
				return '🌐';
			case 'email':
				return '📧';
			case 'linkedin':
				return '💼';
			case 'telegram':
				return '✈️';
			default:
				return '🔗';
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.logoSection}>
					{company.logoUrl ? (
						<img src={company.logoUrl} alt={company.name} className={styles.logo} />
					) : (
						<div className={styles.logoPlaceholder}>
							{company.name.charAt(0).toUpperCase()}
						</div>
					)}
					<div className={styles.nameSection}>
						<h1 className={styles.name}>{company.name}</h1>
						{company.contacts && company.contacts.length > 0 && (
							<div className={styles.contacts}>
								{company.contacts.map((contact) => (
									<a
										key={contact.id}
										href={contact.url}
										className={styles.contact}
										target="_blank"
										rel="noopener noreferrer"
										title={contact.value}
									>
										<span className={styles.contactIcon}>
											{getContactIcon(contact.type)}
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
