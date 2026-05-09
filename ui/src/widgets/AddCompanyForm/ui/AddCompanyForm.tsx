import { companyApi } from 'entities/company';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from 'shared/assets/Logo';
import { Button } from 'shared/ui/Button';
import { InputField } from 'shared/ui/InputField';
import styles from './styles.module.css';
import type { FC } from 'react';

export const AddCompanyForm: FC = () => {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [site, setSite] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setError('Введите название компании');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await companyApi.createCompany({
				name: name.trim(),
				site: site.trim() || undefined,
			});

			navigate('/recommendations');
		} catch {
			setError('Ошибка при отправке заявки. Попробуйте позже.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBack = () => {
		navigate('/recommendations');
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<button type="button" className={styles.backButton} onClick={handleBack}>
				<svg
					width="20"
					height="20"
					viewBox="0 0 20 20"
					fill="none"
					className={styles.backIcon}
				>
					<path
						d="M12 4L6 10L12 16"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<span>Назад</span>
			</button>

			<div className={styles.header}>
				<div className={styles.logoContainer}>
					<Logo className={styles.logo} />
				</div>
				<h1 className={styles.title}>Добавить компанию</h1>
				<p className={styles.subtitle}>
					Заполните короткую заявку, чтобы отправить компанию на модерацию.
				</p>
			</div>

			<div className={styles.fields}>
				<InputField
					label="Название компании"
					value={name}
					onChange={setName}
					placeholder="Введите название компании"
					required
					maxLength={100}
				/>

				<InputField
					label="Сайт компании (опционально)"
					value={site}
					onChange={setSite}
					placeholder="https://example.com"
					maxLength={200}
				/>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.submitContainer}>
				<Button
					type="submit"
					variant="primary"
					disabled={isSubmitting}
					className={styles.submitButton}
				>
					{isSubmitting ? 'Отправка...' : 'Отправить заявку'}
				</Button>
			</div>
		</form>
	);
};
