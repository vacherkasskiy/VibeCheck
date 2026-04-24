import { useFlags, TagModal, ConflictDialog } from 'features/flags';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { HeaderGlow } from 'shared/ui/HeaderGlow';
import { FlagsColumns } from 'widgets/FlagsColumns';
import { FlagsHeader } from 'widgets/FlagsHeader';
import { FlagsLibrary } from 'widgets/FlagsLibrary';
import { SingleFlagColumn } from 'widgets/SingleFlagColumn';
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

	const [mobileTab, setMobileTab] = useState<'library' | 'green' | 'red'>('library');

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
		<div className={styles.pageWrapper}>
			<HeaderGlow />
			<CenterGlow />

			<FlagsHeader
				onBack={handleBack}
				onContinue={onSave}
				isForReview={isForReview}
				companyName={companyName}
			/>

			{/* Мобильные табы */}
			<nav className={styles.mobileTabs}>
				<button
					className={`${styles.tab} ${mobileTab === 'library' ? styles.active : ''}`}
					onClick={() => setMobileTab('library')}
				>
					Библиотека
				</button>
				<button
					className={`${styles.tab} ${mobileTab === 'green' ? styles.active : ''}`}
					onClick={() => setMobileTab('green')}
				>
					Green <span className={styles.count}>{Object.keys(green).length}</span>
				</button>
				<button
					className={`${styles.tab} ${mobileTab === 'red' ? styles.active : ''}`}
					onClick={() => setMobileTab('red')}
				>
					Red <span className={styles.count}>{Object.keys(red).length}</span>
				</button>
			</nav>

			{/* Контент страницы */}
			<main className={styles.main}>
				{/* Десктоп: всегда сетка */}
				<div className={styles.desktopGrid}>
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

				{/* Мобильная версия: табы */}
				<div className={styles.mobileContent}>
					{mobileTab === 'library' && (
						<div className={styles.singleColumnWrapper}>
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
						</div>
					)}

					{mobileTab === 'green' && (
						<div className={styles.singleColumnWrapper}>
							<SingleFlagColumn
								side="green"
								flags={green}
								onDrop={handleDropToGreen}
								onTagClick={(tag) => closeModal()}
								onUpdatePriority={updatePriority}
								onRemoveTag={removeTag}
								onMoveAcross={moveAcross}
							/>
						</div>
					)}

					{mobileTab === 'red' && (
						<div className={styles.singleColumnWrapper}>
							<SingleFlagColumn
								side="red"
								flags={red}
								onDrop={handleDropToRed}
								onTagClick={(tag) => closeModal()}
								onUpdatePriority={updatePriority}
								onRemoveTag={removeTag}
								onMoveAcross={moveAcross}
							/>
						</div>
					)}
				</div>
			</main>

			{/* Модальные окна */}
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
				onMove={(id, target, type) => moveAcross(id, target, type)}
			/>
		</div>
	);
};
