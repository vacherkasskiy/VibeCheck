import { CenterGlow } from 'shared/ui/CenterGlow';
import { AddCompanyForm } from 'widgets/AddCompanyForm';
import { AppHeader } from 'widgets/AppHeader';
import styles from './styles.module.css';
import type { FC } from 'react';

export const AddCompanyPage: FC = () => {
	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.headerWrap}>
				<AppHeader />
			</div>
			<div className={styles.container}>
				<AddCompanyForm />
			</div>
		</div>
	);
};

export default AddCompanyPage;
