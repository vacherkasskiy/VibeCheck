import { filterTags, groupByCategory, useGetAllFlags, type Tag, type SelectedTag } from 'entities/tag';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import { useToast } from 'shared/ui/Toast';
import styles from './ReviewModal.module.css';
import type { ReviewFormData } from '../model/types';

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	companyName: string;
	isEditMode: boolean;
	formData: ReviewFormData;
	setGreenFlags: (flags: string[]) => void;
	setRedFlags: (flags: string[]) => void;
	setText: (text: string) => void;
	canSubmit: boolean;
	canDelete: boolean;
	loading: boolean;
	error: string | null;
	resetForm: () => void;
	submitReview: () => Promise<boolean>;
	deleteReview: () => Promise<boolean>;
}

const MAX_CHARS = 500;
const WARNING_THRESHOLD = 480;

type Side = 'green' | 'red';

export const ReviewModal = ({
	isOpen,
	onClose,
	companyName,
	isEditMode,
	formData,
	setGreenFlags,
	setRedFlags,
	setText,
	canSubmit,
	canDelete,
	loading,
	error,
	resetForm,
	submitReview,
	deleteReview,
}: ReviewModalProps) => {
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showFlagsModal, setShowFlagsModal] = useState(false);
	const [infoTag, setInfoTag] = useState<Tag | null>(null);
	const [query, setQuery] = useState('');
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const { showToast } = useToast();
	const { flags: availableFlags, isLoading: isFlagsLoading, error: flagsError } = useGetAllFlags();

	const flagsById = useMemo(
		() => new Map(availableFlags.map((tag) => [tag.id, tag])),
		[availableFlags],
	);

	const syncSelectedTags = useCallback(
		(flagIds: string[]) =>
			flagIds.reduce<Record<string, SelectedTag>>((acc, flagId) => {
				const tag = flagsById.get(flagId);
				if (tag) {
					acc[flagId] = { tag, priority: 3 };
				}
				return acc;
			}, {}),
		[flagsById],
	);

	const [green, setGreen] = useState<Record<string, SelectedTag>>({});
	const [red, setRed] = useState<Record<string, SelectedTag>>({});

	const areSelectedTagsEqual = useCallback(
		(
			left: Record<string, SelectedTag>,
			right: Record<string, SelectedTag>,
		): boolean => {
			const leftKeys = Object.keys(left);
			const rightKeys = Object.keys(right);

			if (leftKeys.length !== rightKeys.length) return false;

			return leftKeys.every((key) => {
				const leftTag = left[key];
				const rightTag = right[key];

				return (
					rightTag !== undefined &&
					leftTag.tag.id === rightTag.tag.id &&
					leftTag.priority === rightTag.priority
				);
			});
		},
		[],
	);

	useEffect(() => {
		if (!isOpen || availableFlags.length === 0) return;

		const nextGreen = syncSelectedTags(formData.greenFlags || []);
		const nextRed = syncSelectedTags(formData.redFlags || []);

		setGreen((prev) => (areSelectedTagsEqual(prev, nextGreen) ? prev : nextGreen));
		setRed((prev) => (areSelectedTagsEqual(prev, nextRed) ? prev : nextRed));
	}, [
		isOpen,
		availableFlags,
		formData.greenFlags,
		formData.redFlags,
		syncSelectedTags,
		areSelectedTagsEqual,
	]);

	const filteredTags = useMemo(() => {
		const q = query.trim().toLowerCase();
		const excludeIds = Array.from(new Set(Object.keys(green).concat(Object.keys(red))));
		return filterTags(availableFlags, q, excludeIds);
	}, [availableFlags, green, red, query]);

	const groupedByCategory = useMemo(() => groupByCategory(filteredTags), [filteredTags]);

	const startDrag = (id: string) => setDraggingId(id);
	const endDrag = () => setDraggingId(null);

	const addToSide = (tag: Tag, side: Side) => {
		const inGreen = green[tag.id];
		const inRed = red[tag.id];
		if ((side === 'green' && inRed) || (side === 'red' && inGreen)) {
			moveAcross(tag.id, side);
			return;
		}
		const selected: SelectedTag = { tag, priority: 3 };
		if (side === 'green') {
			setGreen((prev) => ({ ...prev, [tag.id]: selected }));
		} else {
			setRed((prev) => ({ ...prev, [tag.id]: selected }));
		}
	};

	const moveAcross = (tagId: string, to: Side) => {
		const src = to === 'green' ? red : green;
		const item = src[tagId];
		if (!item) return;
		if (to === 'green') {
			setRed((prev) => {
				const next = { ...prev };
				delete next[tagId];
				return next;
			});
			setGreen((prev) => ({ ...prev, [tagId]: item }));
		} else {
			setGreen((prev) => {
				const next = { ...prev };
				delete next[tagId];
				return next;
			});
			setRed((prev) => ({ ...prev, [tagId]: item }));
		}
	};

	const updatePriority = (tagId: string, side: Side, priority: 1 | 2 | 3) => {
		const setter = side === 'green' ? setGreen : setRed;
		setter((prev) => ({
			...prev,
			[tagId]: { ...prev[tagId], priority },
		}));
	};

	const removeTag = (tagId: string, side: Side) => {
		const setter = side === 'green' ? setGreen : setRed;
		setter((prev) => {
			const next = { ...prev };
			delete next[tagId];
			return next;
		});
	};

	const handleDropToSide = (side: Side) => {
		if (!draggingId) return;
		const tag = availableFlags.find((item) => item.id === draggingId);
		if (!tag) return;
		addToSide(tag, side);
		endDrag();
	};

	const handleEditFlags = useCallback(() => {
		setGreen(syncSelectedTags(formData.greenFlags || []));
		setRed(syncSelectedTags(formData.redFlags || []));
		setQuery('');
		setShowFlagsModal(true);
	}, [formData.greenFlags, formData.redFlags, syncSelectedTags]);

	const handleSaveFlags = useCallback(() => {
		setGreenFlags(Object.keys(green));
		setRedFlags(Object.keys(red));
		setShowFlagsModal(false);
	}, [green, red, setGreenFlags, setRedFlags]);

	const handleSubmit = useCallback(() => {
		if (canSubmit) {
			setShowConfirmModal(true);
		}
	}, [canSubmit]);

	const handleConfirmSubmit = useCallback(async () => {
		const success = await submitReview();
		if (success) {
			setShowConfirmModal(false);
			showToast(isEditMode ? 'Отзыв сохранен' : 'Отзыв сохранен', 'success');
		} else {
			setShowConfirmModal(false);
		}
	}, [submitReview, showToast, isEditMode]);

	const handleDelete = useCallback(() => {
		setShowDeleteModal(true);
	}, []);

	const handleConfirmDelete = useCallback(async () => {
		const success = await deleteReview();
		if (success) {
			setShowDeleteModal(false);
			showToast('Отзыв удален', 'success');
		} else {
			setShowDeleteModal(false);
		}
	}, [deleteReview, showToast]);

	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [resetForm, onClose]);

	if (error) {
		console.error('Review modal error:', error);
	}

	const getCharCountColor = () => {
		const count = formData.text?.length || 0;
		if (count > MAX_CHARS) return styles.charCountError;
		if (count >= WARNING_THRESHOLD) return styles.charCountWarning;
		return styles.charCountNormal;
	};

	const handleTextChange = useCallback(
		(value: string) => {
			if ((value?.length || 0) <= MAX_CHARS) {
				setText(value);
			}
		},
		[setText],
	);

	return (
		<>
			<Modal isOpen={isOpen} onClose={handleClose} className={styles.reviewModal}>
				<div className={styles.container}>
					<button className={styles.backLink} onClick={handleClose}>
						<span className={styles.backArrow}>←</span>
						Вернуться к странице компании
					</button>

					<div className={styles.header}>
						<h2 className={styles.title}>Написать отзыв о компании "{companyName}"</h2>
						<p className={styles.subtitle}>
							Поделись своими впечатлениями о работе в компании.
						</p>
					</div>

					<div className={styles.flagsSection}>
						<div className={styles.flagsHeader}>
							<div className={styles.flagsGroup}>
								<span className={styles.flagsLabel}>
									Green Flags ({formData.greenFlags?.length || 0})
								</span>
								<div className={styles.flagsList}>
									{(formData.greenFlags || []).map((flagId) => (
										<span key={flagId} className={`${styles.flag} ${styles.greenFlag}`}>
											{flagsById.get(flagId)?.name ?? flagId}
										</span>
									))}
									{(formData.greenFlags?.length || 0) === 0 && (
										<span className={styles.noFlags}>Не выбраны зеленые флаги</span>
									)}
								</div>
							</div>
							<Button
								variant="secondary"
								onClick={handleEditFlags}
								className={styles.editFlagsBtn}
								disabled={isFlagsLoading}
							>
								{isFlagsLoading ? 'Загрузка...' : 'Выбрать флаги'}
							</Button>
						</div>
						{isEditMode && (
							<p className={styles.flagsEditHint}>
								При редактировании по API можно изменить только текст отзыва.
							</p>
						)}

						<div className={styles.flagsGroup}>
							<span className={styles.flagsLabel}>
								Red Flags ({formData.redFlags?.length || 0})
							</span>
							<div className={styles.flagsList}>
								{(formData.redFlags || []).map((flagId) => (
									<span key={flagId} className={`${styles.flag} ${styles.redFlag}`}>
										{flagsById.get(flagId)?.name ?? flagId}
									</span>
								))}
								{(formData.redFlags?.length || 0) === 0 && (
									<span className={styles.noFlags}>Не выбраны красные флаги</span>
								)}
							</div>
						</div>
					</div>

					<div className={styles.textareaSection}>
						<div className={styles.textareaWrapper}>
							<textarea
								className={styles.textarea}
								value={formData.text || ''}
								onChange={(e) => handleTextChange(e.target.value)}
								placeholder="Поделись своим опытом и мыслями о работе в компании..."
								rows={8}
							/>
							<div className={`${styles.charCount} ${getCharCountColor()}`}>
								{formData.text?.length || 0}/{MAX_CHARS}
							</div>
						</div>
					</div>

					<div className={styles.actions}>
						{loading && (
							<div className={styles.flagsState}>Сохраняем отзыв. Это может занять несколько секунд...</div>
						)}
						{isEditMode && canDelete && (
							<Button
								variant="secondary"
								size="small"
								onClick={handleDelete}
								className={styles.deleteBtn}
							>
								Удалить отзыв
							</Button>
						)}
						<Button
							variant="primary"
							size="small"
							onClick={handleSubmit}
							disabled={!canSubmit || loading}
							className={styles.submitBtn}
						>
							{loading
								? 'Отправка...'
								: isEditMode
									? 'Сохранить изменения'
									: 'Опубликовать отзыв'}
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={showFlagsModal}
				onClose={() => setShowFlagsModal(false)}
				className={styles.fullFlagsModal}
			>
				<div className={styles.flagsModalContainer}>
					<div className={styles.flagsModalHeader}>
						<h3 className={styles.flagsModalTitle}>Select Flags for "{companyName}"</h3>
						<p className={styles.flagsModalSubtitle}>
							Перетащи в колонку зеленых или красных или кликни
						</p>
					</div>

					<div className={styles.flagsModalSearch}>
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search flags..."
							className={styles.flagsSearchInput}
						/>
					</div>

					<div className={styles.flagsModalGrid}>
						<div className={styles.flagsLibrarySection}>
							<div className={styles.flagsLibraryContent}>
								{isFlagsLoading && (
									<div className={styles.flagsState}>Загрузка библиотеки флагов...</div>
								)}
								{flagsError && (
									<div className={styles.flagsState}>
										Не удалось загрузить флаги. Используется резервный список.
									</div>
								)}
								{groupedByCategory.map(([category, tags]) => (
									<div key={category} className={styles.flagsCategory}>
										<h5 className={styles.flagsCategoryTitle}>{category}</h5>
										<div className={styles.flagsCategoryTags}>
											{tags.map((tag) => (
												<div
													key={tag.id}
													className={styles.flagLibraryItem}
													draggable
													onDragStart={() => startDrag(tag.id)}
													onDragEnd={endDrag}
													onClick={() => setInfoTag(tag)}
													title="Нажми чтобы увидеть описание"
												>
													<span className={styles.flagLibraryName}>{tag.name}</span>
													<div className={styles.flagLibraryActions}>
														<button
															className={styles.flagAddGreen}
															onClick={(event) => {
																event.stopPropagation();
																addToSide(tag, 'green');
															}}
															title="Добавить к зеленым"
														>
															✓
														</button>
														<button
															className={styles.flagAddRed}
															onClick={(event) => {
																event.stopPropagation();
																addToSide(tag, 'red');
															}}
															title="Добавить к красным"
														>
															✕
														</button>
													</div>
												</div>
											))}
										</div>
									</div>
								))}
								{!isFlagsLoading && groupedByCategory.length === 0 && (
									<div className={styles.noFlagsFound}>No flags found</div>
								)}
							</div>
						</div>

						<div className={styles.flagsColumnsSection}>
							<div
								className={styles.flagsColumn}
								onDragOver={(e) => e.preventDefault()}
								onDrop={(e) => {
									e.preventDefault();
									handleDropToSide('green');
								}}
							>
								<h4 className={`${styles.flagsColumnTitle} ${styles.greenTitle}`}>
									Green Flags ({Object.keys(green).length})
								</h4>
								<div className={styles.flagsColumnContent}>
									{Object.values(green).map(({ tag, priority }) => (
										<div
											key={tag.id}
											className={`${styles.selectedFlag} ${styles.greenSelectedFlag}`}
										>
											<span className={styles.selectedFlagName}>{tag.name}</span>
											<div className={styles.selectedFlagActions}>
												<select
													value={priority}
													onChange={(e) =>
														updatePriority(
															tag.id,
															'green',
															Number(e.target.value) as 1 | 2 | 3,
														)
													}
													className={styles.prioritySelect}
												>
													<option value={3}>High</option>
													<option value={2}>Medium</option>
													<option value={1}>Low</option>
												</select>
												<button
													className={styles.moveToRed}
													onClick={() => moveAcross(tag.id, 'red')}
													title="Переместить в красные"
												>
													→
												</button>
												<button
													className={styles.removeFlag}
													onClick={() => removeTag(tag.id, 'green')}
													title="Удалить"
												>
													×
												</button>
											</div>
										</div>
									))}
									{Object.keys(green).length === 0 && (
										<div className={styles.emptyColumn}>Перенесите флаг сюда</div>
									)}
								</div>
							</div>

							<div
								className={styles.flagsColumn}
								onDragOver={(e) => e.preventDefault()}
								onDrop={(e) => {
									e.preventDefault();
									handleDropToSide('red');
								}}
							>
								<h4 className={`${styles.flagsColumnTitle} ${styles.redTitle}`}>
									Red Flags ({Object.keys(red).length})
								</h4>
								<div className={styles.flagsColumnContent}>
									{Object.values(red).map(({ tag, priority }) => (
										<div
											key={tag.id}
											className={`${styles.selectedFlag} ${styles.redSelectedFlag}`}
										>
											<span className={styles.selectedFlagName}>{tag.name}</span>
											<div className={styles.selectedFlagActions}>
												<select
													value={priority}
													onChange={(e) =>
														updatePriority(
															tag.id,
															'red',
															Number(e.target.value) as 1 | 2 | 3,
														)
													}
													className={styles.prioritySelect}
												>
													<option value={3}>High</option>
													<option value={2}>Medium</option>
													<option value={1}>Low</option>
												</select>
												<button
													className={styles.moveToGreen}
													onClick={() => moveAcross(tag.id, 'green')}
													title="Переместить в зеленые"
												>
													←
												</button>
												<button
													className={styles.removeFlag}
													onClick={() => removeTag(tag.id, 'red')}
													title="Удалить"
												>
													×
												</button>
											</div>
										</div>
									))}
									{Object.keys(red).length === 0 && (
										<div className={styles.emptyColumn}>Перенесите флаг сюда</div>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className={styles.flagsModalActions}>
						<Button
							variant="secondary"
							size="small"
							onClick={() => setShowFlagsModal(false)}
						>
							Отменить
						</Button>
						<Button variant="primary" size="small" onClick={handleSaveFlags}>
							Сохранить флаги
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={showConfirmModal}
				onClose={() => {
					if (!loading) setShowConfirmModal(false);
				}}
				className={styles.confirmModal}
			>
				<div className={styles.confirmContainer}>
					<h3 className={styles.confirmTitle}>Вы уверены что хотите опубликоваться отзыв?</h3>
					{loading && (
						<p className={styles.flagsState}>Сохраняем отзыв и обновляем список компании...</p>
					)}
					<div className={styles.confirmActions}>
						<Button
							variant="secondary"
							size="small"
							onClick={() => setShowConfirmModal(false)}
							disabled={loading}
						>
							Вернуться к редактированию
						</Button>
						<Button variant="primary" size="small" onClick={handleConfirmSubmit} disabled={loading}>
							{loading ? 'Сохраняем...' : 'Подтвердить'}
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={showDeleteModal}
				onClose={() => {
					if (!loading) setShowDeleteModal(false);
				}}
				className={styles.confirmModal}
			>
				<div className={styles.confirmContainer}>
					<h3 className={styles.confirmTitle}>
						Вы уверены, что хотите удалить этот отзыв? Это действие невозможно отменить.
					</h3>
					<div className={styles.confirmActions}>
						<Button
							variant="secondary"
							size="small"
							onClick={() => setShowDeleteModal(false)}
							disabled={loading}
						>
							Отменить
						</Button>
						<Button
							variant="primary"
							size="small"
							onClick={handleConfirmDelete}
							className={styles.deleteConfirmBtn}
							disabled={loading}
						>
							{loading ? 'Удаляем...' : 'Удалить'}
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={!!error}
				onClose={handleClose}
				className={styles.confirmModal}
			>
				<div className={styles.confirmContainer}>
					<h3 className={styles.confirmTitle}>Ошибка</h3>
					<p className={styles.flagsState}>{error}</p>
					<div className={styles.confirmActions}>
						<Button
							variant="secondary"
							size="small"
							onClick={handleClose}
						>
							Выйти
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={!!infoTag}
				onClose={() => setInfoTag(null)}
				className={styles.tagInfoModal}
			>
				<div className={styles.tagInfoContainer}>
					{infoTag && (
						<>
							<div className={styles.tagInfoHeader}>
								<span className={styles.tagInfoCategory}>{infoTag.category}</span>
								<h3 className={styles.tagInfoName}>{infoTag.name}</h3>
							</div>
							<p className={styles.tagInfoDescription}>{infoTag.description}</p>
							<div className={styles.tagInfoActions}>
								<Button
									variant="secondary"
									size="small"
									onClick={() => setInfoTag(null)}
								>
									Закрыть
								</Button>
								<Button
									variant="primary"
									size="small"
									onClick={() => {
										addToSide(infoTag, 'green');
										setInfoTag(null);
									}}
									className={styles.tagInfoAddGreen}
								>
									Добавить к зеленым
								</Button>
								<Button
									variant="primary"
									size="small"
									onClick={() => {
										addToSide(infoTag, 'red');
										setInfoTag(null);
									}}
									className={styles.tagInfoAddRed}
								>
									Добавить к красным
								</Button>
							</div>
						</>
					)}
				</div>
			</Modal>
		</>
	);
};
