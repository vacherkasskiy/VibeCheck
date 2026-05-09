import styles from './styles.module.css';

interface ReviewScoreProps {
	score: number;
	onUpClick?: () => void;
	onDownClick?: () => void;
	isUpActive?: boolean;
	isDownActive?: boolean;
	disabled?: boolean;
	compact?: boolean;
}

export const ReviewScore = ({
	score,
	onUpClick,
	onDownClick,
	isUpActive = false,
	isDownActive = false,
	disabled = false,
	compact = false,
}: ReviewScoreProps) => {
	const scoreClassName =
		score > 0 ? styles.scorePositive : score < 0 ? styles.scoreNegative : styles.scoreNeutral;

	const upClassName = [
		styles.arrowButton,
		styles.arrowUp,
		(isUpActive || (!isDownActive && score > 0)) && styles.arrowActive,
	].filter(Boolean).join(' ');

	const downClassName = [
		styles.arrowButton,
		styles.arrowDown,
		(isDownActive || (!isUpActive && score < 0)) && styles.arrowActive,
	].filter(Boolean).join(' ');

	const containerClassName = [
		styles.container,
		compact && styles.compact,
	].filter(Boolean).join(' ');

	return (
		<div className={containerClassName}>
			{onUpClick ? (
				<button
					type="button"
					className={upClassName}
					onClick={(event) => {
						event.stopPropagation();
						onUpClick();
					}}
					disabled={disabled}
					aria-label="Проголосовать вверх"
				>
					↑
				</button>
			) : (
				<span className={upClassName} aria-hidden="true">
					↑
				</span>
			)}
			<span className={[styles.score, scoreClassName].join(' ')}>{score}</span>
			{onDownClick ? (
				<button
					type="button"
					className={downClassName}
					onClick={(event) => {
						event.stopPropagation();
						onDownClick();
					}}
					disabled={disabled}
					aria-label="Проголосовать вниз"
				>
					↓
				</button>
			) : (
				<span className={downClassName} aria-hidden="true">
					↓
				</span>
			)}
		</div>
	);
};
