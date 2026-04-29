import { useUserFlags } from 'entities/user';
import { useCompanyFlags } from 'features/companyPage';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from 'shared/ui/Input';
import styles from './Top20FlagsSection.module.css';
import type { CompanyFlag } from 'entities/company';
import type { UserFlag } from 'entities/user';

interface Top20FlagsSectionProps {
	companyId?: string;
}

export const Top20FlagsSection = ({ companyId }: Top20FlagsSectionProps = {}) => {
	const { id } = useParams<{ id: string }>();
	const finalCompanyId = companyId || id;

	const { flags, loading, error, searchQuery, setSearchQuery } = useCompanyFlags(finalCompanyId);

	const {
		flags: { green: userGreenFlags, red: userRedFlags },
	} = useUserFlags();

	const filteredFlags = useMemo(() => {
		if (!searchQuery.trim()) return flags;
		const query = searchQuery.toLowerCase();
		return flags.filter((flag: CompanyFlag) => (flag.name ?? '').toLowerCase().includes(query));
	}, [flags, searchQuery]);

	const getFlagColor = (flagId: string): 'green' | 'red' | 'gray' => {
		const isGreen = userGreenFlags.some((f: UserFlag) => f.id === flagId);
		const isRed = userRedFlags.some((f: UserFlag) => f.id === flagId);

		if (isGreen) return 'green';
		if (isRed) return 'red';
		return 'gray';
	};

	if (loading) {
		return (
			<section className={styles.section}>
				<div className={styles.header}>
					<h2 className={styles.title}>Топ-20 флагов</h2>
				</div>
				<div className={styles.loading}>Загрузка флагов...</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className={styles.section}>
				<div className={styles.header}>
					<h2 className={styles.title}>Топ-20 флагов</h2>
				</div>
				<div className={styles.error}>Ошибка загрузки флагов</div>
			</section>
		);
	}

	return (
		<section className={styles.section}>
			<div className={styles.header}>
				<h2 className={styles.title}>Топ-20 флагов</h2>
				<div className={styles.search}>
					<Input
						type="text"
						placeholder="Поиск флагов..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className={styles.flagsGrid}>
				{filteredFlags.length > 0 ? (
					filteredFlags.map((flag: CompanyFlag) => {
						const color = getFlagColor(flag.id);
						return (
							<div key={flag.id} className={`${styles.flag} ${styles[color]}`}>
								<span className={styles.flagName}>{flag.name ?? 'Флаг'}</span>
								<span className={styles.flagCount}>{flag.count}</span>
							</div>
						);
					})
				) : (
					<p className={styles.empty}>Флаги не найдены</p>
				)}
			</div>
		</section>
	);
};
