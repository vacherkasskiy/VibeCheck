import { Badge } from '@shared/ui';
import styles from './styles.module.css';


//TODO: будет запрос на бек за тегами + стор для кеширования и хранеения на фронте
const GREEN_FLAGS = ['Гибкий график', 'Дружелюбная атмосфера', 'Здоровая работа', 'Достойная оплата'];
const RED_FLAGS = ['Токсичная культура', 'Переработки', 'Низкая оплата', 'Микроменеджмент'];

export const FlagsDisplay = () => {
	return (
		<div className={styles.container}>
			<div className={styles.row}>
				{GREEN_FLAGS.map((text, index) => (
					<Badge
						key={`green-${index}`}
						variant="success"
						rotation={-8 + index * 4}
						size="medium"
					>
						{text}
					</Badge>
				))}
			</div>
			<div className={styles.row}>
				{RED_FLAGS.map((text, index) => (
					<Badge
						key={`red-${index}`}
						variant="danger"
						rotation={-8 + index * 4}
						size="medium"
					>
						{text}
					</Badge>
				))}
			</div>
		</div>
	);
};