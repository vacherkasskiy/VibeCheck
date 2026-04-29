import { CompanyInfo } from 'entities/company';
import { useCompanyPage } from 'features/companyPage';
import { useCompanyFlags } from 'features/companyPage';
import { useProfile } from 'features/profile';
import { ReviewModal, useReviewModal } from 'features/reviewModal';
import { useParams, useNavigate } from 'react-router-dom';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import { UserNavButton } from 'shared/ui/UserNavButton';
import styles from './CompanyPage.module.css';
import { ReviewsSection } from './ReviewsSection';
import { Top20FlagsSection } from './Top20FlagsSection';

export const CompanyPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { company, loading, error } = useCompanyPage(id);
	const { loading: companyFlagsLoading } = useCompanyFlags(id);
	const { profile } = useProfile();
	const {
		isOpen,
		openModal,
		closeModal,
		formData,
		setGreenFlags,
		setRedFlags,
		setText,
		canSubmit,
		canDelete,
		isEditMode,
		resetForm,
		loading: modalLoading,
		error: modalError,
		submitReview,
		deleteReview,
	} = useReviewModal(company?.id || 'test-company-001');

	if (loading || companyFlagsLoading) {
		return (
			<div className={styles.page}>
				<HeaderGlow />
				<CenterGlow />
				<header className={styles.header}>
					<div
						className={styles.logoContainer}
						onClick={() => navigate('/recommendations')}
					>
						<img
							src="/assets/vibecheck-favicon.png"
							alt="VibeCheck"
							className={styles.logo}
						/>
						<span className={styles.logoText}>VibeCheck</span>
					</div>
				</header>
				<div className={styles.spinnerWrapper}>
					<Spinner />
				</div>
			</div>
		);
	}

	if (error || !company) {
		return (
			<div className={styles.page}>
				<HeaderGlow />
				<CenterGlow />
				<header className={styles.header}>
					<div
						className={styles.logoContainer}
						onClick={() => navigate('/recommendations')}
					>
						<img
							src="/assets/vibecheck-favicon.png"
							alt="VibeCheck"
							className={styles.logo}
						/>
						<span className={styles.logoText}>VibeCheck</span>
					</div>
				</header>
				<div className={styles.errorMessage}>
					<h2>Ошибка загрузки</h2>
					<p>{error || 'Компания не найдена'}</p>
					<Button onClick={() => navigate('/recommendations')} variant="primary">
						Вернуться к списку
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.page}>
			<HeaderGlow />
			<CenterGlow />
			<header className={styles.header}>
				<div className={styles.logoContainer} onClick={() => navigate('/recommendations')}>
					<img
						src="/assets/vibecheck-favicon.png"
						alt="VibeCheck"
						className={styles.logo}
					/>
					<span className={styles.logoText}>VibeCheck</span>
				</div>
				<div className={styles.headerActions}>
					<Button variant="primary" size="small" onClick={openModal}>
						Написать отзыв
					</Button>
					<UserNavButton
						avatarUrl={profile?.user?.avatarUrl}
						nickname={profile?.user?.nickname}
					/>
				</div>
			</header>
			<main className={styles.main}>
				<CompanyInfo company={company} />
				<div className={styles.sections}>
					<ReviewsSection />
					<Top20FlagsSection />
				</div>
			</main>
			<ReviewModal
				isOpen={isOpen}
				onClose={closeModal}
				companyName={company.name}
				companyId={company.id}
				isEditMode={isEditMode}
				formData={formData}
				setGreenFlags={setGreenFlags}
				setRedFlags={setRedFlags}
				setText={setText}
				canSubmit={canSubmit}
				canDelete={canDelete}
				resetForm={resetForm}
				loading={modalLoading}
				error={modalError}
				submitReview={submitReview}
				deleteReview={deleteReview}
			/>
		</div>
	);
};
