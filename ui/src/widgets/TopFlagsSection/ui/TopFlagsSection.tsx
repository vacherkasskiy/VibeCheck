import { useGetAllFlags } from 'entities/tag';
import { useUserFlags } from 'entities/user';
import { TagInfoModal } from 'features/flags';
import { useState, useMemo } from 'react';
import { Input } from 'shared/ui/Input';
import styles from './TopFlagsSection.module.css';
import type { CompanyFlag } from 'entities/company';
import type { Tag } from 'entities/tag';
import type { UserFlag } from 'entities/user';

interface TopFlagsSectionProps {
	flags: CompanyFlag[];
	totalCount?: number;
}

export const TopFlagsSection = ({ flags, totalCount }: TopFlagsSectionProps) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
	const { flags: allFlags } = useGetAllFlags();
	const {
		flags: { green: userGreenFlags, red: userRedFlags },
	} = useUserFlags();

	const flagsById = useMemo(() => new Map(allFlags.map((flag) => [flag.id, flag])), [allFlags]);

	const filteredFlags = useMemo(() => {
		if (!searchQuery.trim()) return flags;
		const query = searchQuery.toLowerCase();
		return flags.filter((flag) => (flag.name ?? '').toLowerCase().includes(query));
	}, [flags, searchQuery]);

	const getFlagColor = (flagId: string): 'green' | 'red' | 'gray' => {
		const isGreen = userGreenFlags.some((f: UserFlag) => f.id === flagId);
		const isRed = userRedFlags.some((f: UserFlag) => f.id === flagId);

		if (isGreen) return 'green';
		if (isRed) return 'red';
		return 'gray';
	};

	const handleOpenTagInfo = (flag: CompanyFlag) => {
		const fullTag = flagsById.get(flag.id);
		setSelectedTag(
			fullTag ?? {
				id: flag.id,
				name: flag.name ?? 'Флаг',
				description: 'Описание для этого флага пока недоступно.',
				category: 'Условия',
			},
		);
	};

	return (
		<>
			<section className={styles.section}>
				<div className={styles.header}>
					<div className={styles.titleWrapper}>
						<h2 className={styles.title}>Топ флагов</h2>
						{totalCount !== undefined && (
							<p className={styles.totalPill}>Всего флагов: {totalCount}</p>
						)}
					</div>
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
						filteredFlags.map((flag) => {
							const color = getFlagColor(flag.id);
							return (
								<button
									key={flag.id}
									type="button"
									className={`${styles.flag} ${styles[color]}`}
									onClick={() => handleOpenTagInfo(flag)}
									title="Открыть описание флага"
								>
									<span className={styles.flagName}>{flag.name ?? 'Флаг'}</span>
									<span className={styles.flagCount}>{flag.count}</span>
								</button>
							);
						})
					) : (
						<p className={styles.empty}>Флаги не найдены</p>
					)}
				</div>
			</section>
			<TagInfoModal
				tag={selectedTag}
				isOpen={!!selectedTag}
				onClose={() => setSelectedTag(null)}
			/>
		</>
	);
};
