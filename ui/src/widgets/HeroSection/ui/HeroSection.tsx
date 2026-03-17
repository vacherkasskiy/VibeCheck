import styles from './styles.module.css';
import type { ReactNode } from 'react';

interface HeroSectionProps {
  children?: ReactNode;
}

export const HeroSection = ({ children }: HeroSectionProps) => {
  return <section className={styles.hero}>{children}</section>;
};
