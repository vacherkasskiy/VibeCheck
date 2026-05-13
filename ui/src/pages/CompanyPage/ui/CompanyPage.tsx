import { CompanyInfo } from 'entities/company';
import { getMyInfo } from 'features/auth';
import { useCompanyPage } from 'features/companyPage';
import { ReviewModal, useReviewModal } from 'features/reviewModal';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { Button } from 'shared/ui/Button';
import { UserNavButton } from 'shared/ui/UserNavButton';
import { FooterLinks } from 'widgets/FooterLinks';
import styles from './CompanyPage.module.css';
import { CompanyPageSkeleton } from './CompanyPageSkeleton';
import { ReviewsSection } from './ReviewsSection';
import { Top20FlagsSection } from './TopFlagsSection';
import type { CompanyReview } from 'entities/company';

export const CompanyPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { company, loading, error } = useCompanyPage(id);
	const [nickname, setNickname] = useState<string>();
	const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
	const refreshReviews = () => setReviewsRefreshKey((prev) => prev + 1);
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
	} = useReviewModal(company?.companyId || 'test-company-001', refreshReviews);

	const pendingEditReview = useMemo(
		() =>
			(location.state as { editReview?: { id: string; text: string; createdAt: string } } | null)
				?.editReview,
		[location.state],
	);

	const handleEditReview = (review: CompanyReview | { reviewId?: string; id?: string; text: string | null; createdAt: string; flags?: Array<{ id: string }> | null }) => {
		const targetReviewId = 'reviewId' in review ? review.reviewId : review.id;

		openModal({
			id: targetReviewId ?? '',
			text: review.text ?? '',
			greenFlags: (review.flags ?? []).map((flag) => flag.id),
			redFlags: [],
			createdAt: review.createdAt,
		});
	};

	useEffect(() => {
		let ignore = false;

		getMyInfo()
			.then((info) => {
				if (!ignore) {
					setNickname(info.name);
				}
			})
			.catch(() => {
				if (!ignore) {
					setNickname(undefined);
				}
			});

		return () => {
			ignore = true;
		};
	}, []);

	useEffect(() => {
		if (pendingEditReview && company?.companyId) {
			handleEditReview({
				id: pendingEditReview.id,
				text: pendingEditReview.text,
				createdAt: pendingEditReview.createdAt,
				flags: [],
			});
			navigate(location.pathname, { replace: true, state: null });
		}
	}, [company?.companyId, location.pathname, navigate, pendingEditReview]);

if (loading) {
		return <CompanyPageSkeleton />;
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
					<UserNavButton
						nickname={nickname}
					/>
				</div>
			</header>
			<main className={styles.main}>
				<div className={styles.contentGrid}>
					<div className={styles.leftColumn}>
						<CompanyInfo company={company} />
						<Top20FlagsSection />
					</div>
<ReviewsSection
						className={styles.reviewsColumn}
						companyName={company.name ?? 'Компания'}
						refreshKey={reviewsRefreshKey}
						onEditReview={handleEditReview}
						onWriteReview={openModal}
					/>
				</div>
			</main>
			<FooterLinks />
			<ReviewModal
				isOpen={isOpen}
				onClose={closeModal}
				companyName={company.name ?? 'Компания'}
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
