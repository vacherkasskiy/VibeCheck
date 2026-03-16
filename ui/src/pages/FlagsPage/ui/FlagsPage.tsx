import { Tag } from 'entities/tag';
import { useFlags, TagModal, ConflictDialog } from 'features/flags';
import { useNavigate, useLocation } from 'react-router-dom';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { HeaderGlow } from 'shared/ui/HeaderGlow';
import { FlagsColumns } from 'widgets/FlagsColumns';
import { FlagsHeader } from 'widgets/FlagsHeader';
import { FlagsLibrary } from 'widgets/FlagsLibrary';
import styles from './FlagsPage.module.css';

export const FlagsPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as {
		returnTo?: string;
		companyId?: string;
		isForReview?: boolean;
		companyName?: string;
	} | null;

	const isForReview = state?.isForReview || false;
	const companyName = state?.companyName || '';

	const {
		green,
		red,
		draggingId,
		modalTag,
		showConflict,
		groupedByCategory,
		startDrag,
		endDrag,
		addToSide,
		moveAcross,
		updatePriority,
		removeTag,
		onSave,
		closeModal,
		closeConflict,
	} = useFlags();

	const handleBack = () => navigate(-1);

	const handleDropToGreen = () => {
		if (!draggingId) return;
		const tag = groupedByCategory.flatMap(([, tags]) => tags).find((t) => t.id === draggingId);
		if (tag) {
			addToSide(tag, 'green');
			endDrag();
		}
	};

	const handleDropToRed = () => {
		if (!draggingId) return;
		const tag = groupedByCategory.flatMap(([, tags]) => tags).find((t) => t.id === draggingId);
		if (tag) {
			addToSide(tag, 'red');
			endDrag();
		}
	};

	return (
		<div className={styles.container}>
			<HeaderGlow />
			<CenterGlow />

			<FlagsHeader
				onBack={handleBack}
				onContinue={onSave}
				isForReview={isForReview}
				companyName={companyName}
			/>

			<div className={styles.mainGrid}>
				<FlagsLibrary
					groupedByCategory={groupedByCategory}
					onTagClick={(tag) => addToSide(tag, 'green')}
					onTagDragStart={startDrag}
					onTagDragEnd={endDrag}
					onAddToGreen={(tag) => addToSide(tag, 'green')}
					onAddToRed={(tag) => addToSide(tag, 'red')}
					greenTags={green}
					redTags={red}
				/>

				<FlagsColumns
					green={green}
					red={red}
					onDropToGreen={handleDropToGreen}
					onDropToRed={handleDropToRed}
					onTagClick={(tag) => closeModal()}
					onUpdatePriority={updatePriority}
					onRemoveTag={removeTag}
					onMoveAcross={moveAcross}
				/>
			</div>

			<TagModal
				tag={modalTag}
				isOpen={!!modalTag}
				onClose={closeModal}
				onAddGreen={(tag) => {
					addToSide(tag, 'green');
					closeModal();
				}}
				onAddRed={(tag) => {
					addToSide(tag, 'red');
					closeModal();
				}}
			/>

			<ConflictDialog
				conflict={showConflict}
				isOpen={!!showConflict}
				onClose={closeConflict}
				onMove={moveAcross}
			/>
		</div>
	);
};
