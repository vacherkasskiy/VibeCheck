import { CenterGlow, HeaderGlow } from 'shared/ui';
import { Line } from 'shared/ui/Line';
import { ActionButtons } from 'widgets/ActionButtons';
import { BenefitsBlock } from 'widgets/BenefitsBlock';
import { FlagsDisplay } from 'widgets/FlagsDisplay';
import { FooterLinks } from 'widgets/FooterLinks';
import { WelcomeLogo } from 'widgets/WelcomeLogo';
import styles from './styles.module.css';

export const WelcomePage = () => {
	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<HeaderGlow />
				<CenterGlow />

				<section className={styles.hero}>
					<WelcomeLogo />
					<div className={styles.headingContainer}>
						<h1 className={styles.heading}>
							Определи свой <span className={styles.noWrap}>карьерный</span>{' '}
							<span className={styles.targetWord}>
								вайб
								<div className={styles.lineWrapper}>
									<Line />
								</div>
							</span>
						</h1>
					</div>

					<p className={styles.subheading}>
						Узнай, какая рабочая среда, стиль управления и культура подойдут именно
						тебе.
					</p>

					<FlagsDisplay />
				</section>

				<section className={styles.cta}>
					<h2 className={styles.ctaText}>
						Создай свой идеальный карьерный мэтч за несколько минут.
					</h2>
				</section>

				<BenefitsBlock />

				<ActionButtons />
			</main>

			<FooterLinks />
		</div>
	);
};

export default WelcomePage;
