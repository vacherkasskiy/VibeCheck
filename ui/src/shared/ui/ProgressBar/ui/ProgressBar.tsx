 
import styles from './styles.module.css';

export interface ProgressBarProps {
	currentStep: number;
	totalSteps: number;
	steps: string[];
}

export const ProgressBar = ({ currentStep, totalSteps, steps }: ProgressBarProps) => {
	return (
		<div className={styles.container}>
			<div className={styles.progressLine}>
				<div
					className={styles.progressLineFilled}
					style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
				/>
			</div>
			<div className={styles.steps}>
				{steps.map((step, index) => {
					const stepNumber = index + 1;
					const isCompleted = stepNumber < currentStep;
					const isCurrent = stepNumber === currentStep;

					return (
						<div key={index} className={styles.step}>
							<div
								className={`${styles.stepCircle} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
							>
								{isCompleted ? (
									<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
										<path
											d="M13 4L6 11L3 8"
											stroke={'#ffffff'}
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								) : (
									<span className={styles.stepNumber}>{stepNumber}</span>
								)}
							</div>
							<span className={`${styles.stepLabel} ${isCurrent ? styles.active : ''}`}>
								{step}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};