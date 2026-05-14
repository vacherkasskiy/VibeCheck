import { SearchInput } from 'features/companySearch';
import { useProfile } from 'features/profile';
import { useNavigate } from 'react-router-dom';
import { UserNavButton } from 'shared/ui/UserNavButton';
import styles from './styles.module.css';
import type { FC } from 'react';

interface RecommendationsHeaderProps {
	searchValue: string;
	onSearchChange: (value: string) => void;
	className?: string;
}

export const RecommendationsHeader: FC<RecommendationsHeaderProps> = ({
	searchValue,
	onSearchChange,
	className = '',
}) => {
	const navigate = useNavigate();
	const { profile } = useProfile();

	return (
		<header className={`${styles.header} ${className}`}>
			<button
				type="button"
				className={styles.logoContainer}
				onClick={() => navigate('/recommendations')}
			>
				<img
					src="/assets/vibecheck-favicon.png"
					alt="VibeCheck"
					className={styles.logo}
				/>
				<span className={styles.logoText}>VibeCheck</span>
			</button>

			<div className={styles.headerActions}>
				<SearchInput
					value={searchValue}
					onChange={onSearchChange}
					placeholder="Поиск компании"
					className={styles.searchContainer}
				/>

				<UserNavButton
					avatarUrl={profile?.user?.avatarUrl}
					nickname={profile?.user?.nickname}
				/>
			</div>
		</header>
	);
};
