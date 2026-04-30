import { useCompanySearch } from 'features/companySearch';
import { useNavigate } from 'react-router-dom';
import { CompanyList } from 'widgets/CompanyList';
import { RecommendationsHeader } from 'widgets/RecommendationsHeader';
import styles from './styles.module.css';
import type { FC } from 'react';

export const RecommendationsPage: FC = () => {
	const navigate = useNavigate();
	const { query, setQuery, items, total, pending, hasMore, loadMore } = useCompanySearch();

	const handleCardClick = (id: string) => {
		navigate(`/company/${id}`);
	};

	return (
		<div className={styles.page}>
			<RecommendationsHeader 
				searchValue={query} 
				onSearchChange={setQuery} 
			/>

			<main className={styles.main}>
				<CompanyList
					items={items}
					pending={pending}
					hasMore={hasMore}
					onLoadMore={loadMore}
					onCardClick={handleCardClick}
				/>
			</main>
		</div>
	);
};
