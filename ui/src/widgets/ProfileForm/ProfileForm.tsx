import { useState } from 'react';
import { Button } from 'shared/ui/Button';
import { Input } from 'shared/ui/Input';
import { Select } from 'shared/ui/Select';
import styles from './styles.module.css';

interface ProfileFormProps {
	email: string;
	onSubmit: (data: any) => void;
	onBack: () => void;
}

export const ProfileForm = ({ email, onSubmit, onBack }: ProfileFormProps) => {
	const [avatar, setAvatar] = useState('');
	const [nickname, setNickname] = useState('');
	const [gender, setGender] = useState('');
	const [dob, setDob] = useState('');
	const [education, setEducation] = useState('');
	const [activity, setActivity] = useState('');
	const [experience, setExperience] = useState<any[]>([]);

	const handleAddExperience = () => {
		setExperience([...experience, { activity: '', startDate: '', endDate: '' }]);
	};

	const handleRemoveExperience = (index: number) => {
		setExperience(experience.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		onSubmit({
			avatar,
			nickname,
			gender,
			dob,
			education,
			activity,
			experience,
		});
	};

	const genderOptions = [
		{ value: 'SEX_MALE', label: 'Мужской' },
		{ value: 'SEX_FEMALE', label: 'Женский' },
		{ value: 'SEX_OTHER', label: 'Другое' },
	];

	// TODO: Fetch from backend
	const educationOptions = [
		{ value: 'HIGH_SCHOOL', label: 'Среднее' },
		{ value: 'BACHELOR', label: 'Бакалавр' },
		{ value: 'MASTER', label: 'Магистр' },
	];

	// TODO: Fetch from backend
	const activityOptions = [
		{ value: 'IT', label: 'IT' },
		{ value: 'FINANCE', label: 'Финансы' },
		{ value: 'MARKETING', label: 'Маркетинг' },
	];

	return (
		<div className={styles.container}>
			<div className={styles.header}>
			<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<img src="/assets/vibecheck-favicon.png" alt="VibeCheck" style={{ width: 64, height: 50, borderRadius: 6 }} />
				</div>
			<h2 className={styles.title}>Заполните свой профиль</h2>
			</div>

			<div className={styles.avatarSelection}>
				{/* PENDING: Avatar selection component */}
				<p>Выберите аватар</p>
			</div>

			<Input
				label="Никнейм"
				value={nickname}
				onChange={(e) => setNickname(e.target.value)}
				placeholder="nickname_example"
				required
			/>

			<Select
				label="Пол"
				options={genderOptions}
				value={gender}
				onChange={setGender}
				required
			/>

			<Input
				label="Дата рождения"
				type="date"
				value={dob}
				onChange={(e) => setDob(e.target.value)}
				placeholder="ДД.ММ.ГГГГ"
				required
			/>

			<Select
				label="Образование"
				options={educationOptions}
				value={education}
				onChange={setEducation}
				required
			/>

			<Select
				label="Сфера деятельности"
				options={activityOptions}
				value={activity}
				onChange={setActivity}
				required
			/>

			<div className={styles.experienceBlock}>
				<h3>Опыт работы (необязательно)</h3>
				{experience.map((exp, index) => (
					<div key={index} className={styles.experienceItem}>
						<Select
							label="Сфера деятельности"
							options={activityOptions}
							value={exp.activity}
							onChange={(val) => {
								const newExp = [...experience];
								newExp[index].activity = val;
								setExperience(newExp);
							}}
							placeholder="Выберите сферу"
						/>
						<Input
							label="Дата начала"
							type="date"
							value={exp.startDate}
							onChange={(e) => {
								const newExp = [...experience];
								newExp[index].startDate = e.target.value;
								setExperience(newExp);
							}}
							required
						/>
						<Input
							label="Дата окончания (опционально)"
							type="date"
							value={exp.endDate}
							onChange={(e) => {
								const newExp = [...experience];
								newExp[index].endDate = e.target.value;
								setExperience(newExp);
							}}
						/>
						<Button onClick={() => handleRemoveExperience(index)} variant="secondary">
							Удалить
						</Button>
					</div>
				))}
				<Button onClick={handleAddExperience} variant="secondary">
					+ Добавить опыт
				</Button>
			</div>

			<div className={styles.actions}>
				<Button onClick={onBack} variant="secondary">
					Назад
				</Button>
				<Button onClick={handleSubmit} variant="primary" disabled={false}>
					Продолжить
				</Button>
			</div>
		</div>
	);
};