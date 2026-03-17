import { CompanyCard } from 'entities/company';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import styles from './styles.module.css';
import type { CompanyDTO } from 'entities/company';
import type { FC } from 'react';

interface CompanyListProps {
	items: CompanyDTO[];
	pending: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
	onCardClick?: (id: string) => void;
	className?: string;
}

export const CompanyList: FC<CompanyListProps> = ({
	items,
	pending,
	hasMore,
	onLoadMore,
	onCardClick,
	className = '',
}) => {
	const navigate = useNavigate();
	const observer = useRef<IntersectionObserver | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!sentinelRef.current) return;

		observer.current?.disconnect();

		observer.current = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && hasMore && !pending) {
				onLoadMore();
			}
		});

		observer.current.observe(sentinelRef.current);

		return () => observer.current?.disconnect();
	}, [hasMore, pending, onLoadMore]);

	const handleCardClick = (id: string) => {
		if (onCardClick) {
			onCardClick(id);
		} else {
			navigate(`/company/${id}`);
		}
	};

	if (items.length === 0 && !pending) {
		return <EmptyState />;
	}

	return (
		<div className={`${styles.container} ${className}`}>
			{items.map((company) => (
				<div key={company.id} onClick={() => handleCardClick(company.id)}>
					<CompanyCard company={company} />
				</div>
			))}

			{pending && <Spinner />}

			<div ref={sentinelRef} />
		</div>
	);
};

const EmptyState: FC = () => {
	const navigate = useNavigate();

	return (
		<div className={styles.emptyState}>
			<h2 className={styles.emptyStateTitle}>Похоже, такой компании пока нет в нашей базе</h2>
			<p className={styles.emptyStateText}>
				Вы можете стать первым, кто её добавит. Просто заполните форму добавления компании.
			</p>
			<Button variant="primary" onClick={() => navigate('/add-company')}>
				Предложить компанию
			</Button>
		</div>
	);
};
