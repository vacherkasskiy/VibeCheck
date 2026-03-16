import { companyApi } from 'entities/company';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { InputField } from 'shared/ui/InputField';
import { TextAreaField } from 'shared/ui/TextAreaField';
import styles from './styles.module.css';
import type { FC } from 'react';

export const AddCompanyForm: FC = () => {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!name.trim()) {
			setError('Введите название компании');
			return;
		}

		if (description.length > 500) {
			setError('Описание не должно превышать 500 символов');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			await companyApi.createCompany({
				name: name.trim(),
				description: description.trim(),
			});

			navigate('/recommendations');
		} catch (err) {
			setError('Ошибка при отправке заявки. Попробуйте позже.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBack = () => {
		navigate('/');
	};

	return (
		<form onSubmit={handleSubmit} className={styles.form}>
			<div className={styles.backLink}>
				<Button
					variant="secondary"
					as="button"
					onClick={handleBack}
					className={styles.backButton}
				>
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
					<span>Вернуться на главную страницу</span>
				</Button>
			</div>

			<h1 className={styles.title}>Заполните заявку на добавление компании</h1>

			<div className={styles.fields}>
				<InputField
					label="Название компании"
					value={name}
					onChange={setName}
					placeholder="Введите название компании"
					required
					maxLength={100}
				/>

				<TextAreaField
					label="Название и тд."
					value={description}
					onChange={setDescription}
					placeholder="Поделись своим опытом, мыслями и инсайтами о работе в этой компании"
					maxLength={500}
				/>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.submitContainer}>
				<Button
					type="submit"
					variant="secondary"
					disabled={isSubmitting}
					className={styles.submitButton}
				>
					{isSubmitting ? 'Отправка...' : 'Отправить заявку'}
				</Button>
			</div>
		</form>
	);
};
