import { Button } from 'shared/ui/Button';
import styles from './FlagsHeader.module.css';

interface FlagsHeaderProps {
	onBack: () => void;
	onContinue: () => void;
	isForReview?: boolean;
	companyName?: string;
}

export const FlagsHeader = ({
	onBack,
	onContinue,
	isForReview = false,
	companyName = '',
}: FlagsHeaderProps) => {
	return (
		<header className={styles.header}>
			<button className={styles.backButton} onClick={onBack}>
				Назад
			</button>
			<div className={styles.content}>
				<div className={styles.logoContainer}>
					<img
						src="/assets/vibecheck-favicon.png"
						alt="VibeCheck"
						className={styles.logo}
					/>
				</div>
				<h1 className={styles.title}>
					{isForReview
						? `Выбор флагов для отзыва о компании "${companyName}"`
						: 'Выберите свой green и red флаги'}
				</h1>
				<p className={styles.subtitle}>
					{isForReview
						? 'Выберите флаги, которые характеризуют ваш опыт работы в этой компании'
						: 'Выбери свои предпочтения на основе нейтральных тегов'}
				</p>
			</div>
			<Button variant="primary" size="small" onClick={onContinue}>
				{isForReview ? 'Сохранить флаги' : 'Продолжить'}
			</Button>
		</header>
	);
};
