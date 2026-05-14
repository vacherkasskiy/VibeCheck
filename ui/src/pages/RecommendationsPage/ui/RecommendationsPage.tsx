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
	const { query, setQuery, items, pending, hasMore, loadMore, error } = useCompanySearch();

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
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<span className={styles.kicker}>Рекомендации</span>
						<h1 className={styles.heroTitle}>Подборка компаний под ваши интересы</h1>
						<p className={styles.heroText}>
							Здесь собраны компании, которые лучше всего совпадают с вашими флагами и активностью. Используйте поиск, чтобы быстро найти нужную карточку и перейти к отзывам, описанию и деталям команды.
						</p>
					</div>
				</section>

				<section className={styles.listSection}>
					<CompanyList
						items={items}
						pending={pending}
						hasMore={hasMore}
						onLoadMore={loadMore}
						onCardClick={handleCardClick}
					/>
				</section>
			</main>
			<FooterLinks />
		</div>
	);
};
