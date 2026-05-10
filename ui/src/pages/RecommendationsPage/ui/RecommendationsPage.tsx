import { useAuth } from 'features/auth';
import { useCompanySearch } from 'features/companySearch';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { CompanyList } from 'widgets/CompanyList';
import { FooterLinks } from 'widgets/FooterLinks';
import { RecommendationsHeader } from 'widgets/RecommendationsHeader';
import styles from './styles.module.css';
import type { FC } from 'react';

export const RecommendationsPage: FC = () => {
	const navigate = useNavigate();
	const { state } = useAuth();
	const { query, setQuery, items, total, pending, hasMore, loadMore, error } = useCompanySearch();

	useEffect(() => {
		if (!state.loading && !state.isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [navigate, state.isAuthenticated, state.loading]);

	useEffect(() => {
		if (error?.status === 403) {
			navigate('/blocked', { replace: true });
		}
	}, [error?.status, navigate]);

	if (!state.isAuthenticated) {
		return null;
	}

	const handleCardClick = (id: string) => {
		navigate(`/company/${id}`);
	};

	return (
		<div className={styles.page}>
			<HeaderGlow />
			<CenterGlow />
			<RecommendationsHeader searchValue={query} onSearchChange={setQuery} />

			<main className={styles.main}>
				<CompanyList
					items={items}
					pending={pending}
					hasMore={hasMore}
					onLoadMore={loadMore}
					onCardClick={handleCardClick}
				/>
			</main>
			<FooterLinks />
		</div>
	);
};
