import styles from './styles.module.css';

export interface FeatureCardProps {
	title: string;
	description: string;
}

export const FeatureCard = ({ title, description }: FeatureCardProps) => {
	return (
		<div className={styles.card}>
			<h3 className={styles.title}>{title}</h3>
			<p className={styles.description}>{description}</p>
		</div>
	);
};