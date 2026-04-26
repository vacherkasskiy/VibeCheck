import { CenterGlow } from 'shared/ui/CenterGlow';
import { AddCompanyForm } from 'widgets/AddCompanyForm';
import styles from './styles.module.css';
import type { FC } from 'react';

export const AddCompanyPage: FC = () => {
	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.container}>
				<div className={styles.logo}>
					<svg
						width="48"
						height="48"
						viewBox="0 0 48 48"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M24 4L4 24L24 44L44 24L24 4Z"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinejoin="round"
						/>
						<path d="M24 14L14 24L24 34L34 24L24 14Z" fill="currentColor" />
					</svg>
				</div>
				<AddCompanyForm />
			</div>
		</div>
	);
};

export default AddCompanyPage;
