import { FeatureCard } from '@shared/ui';
import { PersonalRecIcon, FlagsIcon, ConfidentIcon } from './icons';
import styles from './styles.module.css';

const FEATURES = [
	{
		title: 'Персональные рекомендации',
		description: 'Система подбирает компании, где совпадают твои ценности и рабочий стиль.',
	},
	{
		title: 'Расширенная система флагов',
		description: 'Понимай рабочую атмосферу быстрее благодаря выбранным тобой green/red флагам из характеристик.',
	},
	{
		title: 'Осознанный и уверенный выбор',
		description: 'Чёткое представление о стиле управления, нагрузке и культуре компаний.',
	},
];

export const BenefitsBlock = () => {
	return (
		<div className={styles.container}>
			{FEATURES.map((feature, index) => (
				<FeatureCard
					key={index}
					title={feature.title}
					description={feature.description}
				/>
			))}
		</div>
	);
};