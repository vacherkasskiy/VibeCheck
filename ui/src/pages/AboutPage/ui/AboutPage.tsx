import { useAuth } from 'features/auth';
import { Link } from 'react-router-dom';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { AppHeader } from 'widgets/AppHeader';
import styles from './styles.module.css';

const principles = [
	{
		title: 'Честные сигналы',
		description:
			'Мы собираем впечатления о рабочей среде, стиле менеджмента и культуре команды, а не только сухие рейтинги.',
	},
	{
		title: 'Фокус на совместимости',
		description:
			'Сервис помогает находить не просто хорошую компанию, а среду, которая совпадает с вашими ожиданиями и личным вайбом.',
	},
	{
		title: 'Реальные отзывы',
		description:
			'Отзывы, флаги и профили формируют более объёмную картину, чтобы решение о следующем карьерном шаге было осознанным.',
	},
];

export const AboutPage = () => {
	const { state } = useAuth();

	return (
		<div className={styles.page}>
			<HeaderGlow />
			<CenterGlow />
			<div className={styles.shell}>
				<AppHeader />

				<main className={styles.main}>
					<section className={styles.hero}>
						<p className={styles.eyebrow}>О сервисе</p>
						<h1 className={styles.title}>VibeCheck помогает искать работу по культурному совпадению, а не вслепую.</h1>
						<p className={styles.subtitle}>
							Мы соединяем отзывы, карьерные флаги и персональные предпочтения, чтобы выбор компании был ближе к реальной рабочей жизни.
						</p>

<div className={styles.actions}>
							<Link
								to={state.isAuthenticated ? '/recommendations' : '/welcome'}
								className={styles.primaryAction}
							>
								{state.isAuthenticated ? 'К рекомендациям' : 'Войти, чтобы получить рекомендации'}
							</Link>
						</div>
					</section>

					<section className={styles.grid}>
						{principles.map((item) => (
							<article key={item.title} className={styles.card}>
								<h2 className={styles.cardTitle}>{item.title}</h2>
								<p className={styles.cardText}>{item.description}</p>
							</article>
						))}
					</section>

					<section className={styles.story}>
						<div className={styles.storyCard}>
							<h2 className={styles.storyTitle}>Как это работает</h2>
							<p className={styles.storyText}>
								Вы отмечаете green и red флаги, которые важны именно вам. После этого сервис подбирает компании и помогает читать отзывы через призму того, что действительно влияет на комфорт и рост.
							</p>
						</div>
						<div className={styles.storyCard}>
							<h2 className={styles.storyTitle}>Что внутри</h2>
							<p className={styles.storyText}>
								Профили, отзывы, реакции, пользовательские флаги и рекомендации складываются в единое пространство, где можно оценивать работодателей не по витрине, а по ощущению от среды.
							</p>
						</div>
					</section>

					<section className={styles.contactCard}>
						<h2 className={styles.storyTitle}>Почта для связи</h2>
						<p className={styles.storyText}>
							Если хотите связаться по вопросам сервиса или оставить обратную связь, пишите на{' '}
							<a href="mailto:vvfedotov@edu.hse.ru" className={styles.contactLink}>
								vvfedotov@edu.hse.ru
							</a>
							.
						</p>
					</section>
				</main>
			</div>
		</div>
	);
};

export default AboutPage;
