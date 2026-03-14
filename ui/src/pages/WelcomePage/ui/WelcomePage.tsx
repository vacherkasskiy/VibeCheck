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
				<div className={styles.glowEffects}>
					<HeaderGlow />
					<CenterGlow />
				</div>
				<WelcomeLogo />

				<section className={styles.hero}>
					<div className={styles.headingContainer}>
						<h1 className={styles.heading}>Определи свой карьерный вайб</h1>
						<div className={styles.lineWrapper}>
							<Line />
						</div>
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
