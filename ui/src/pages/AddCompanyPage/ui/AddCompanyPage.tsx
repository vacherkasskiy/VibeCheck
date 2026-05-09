import Logo from 'shared/assets/Logo';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { AddCompanyForm } from 'widgets/AddCompanyForm';
import styles from './styles.module.css';
import type { FC } from 'react';

export const AddCompanyPage: FC = () => {
	return (
		<div className={styles.page}>
			<CenterGlow />
			<div className={styles.container}>
				<Logo className={styles.logo} />
				<AddCompanyForm />
			</div>
		</div>
	);
};

export default AddCompanyPage;
