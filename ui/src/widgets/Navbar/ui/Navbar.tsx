import styles from './styles.module.css';
import type { ReactNode } from 'react';

interface NavbarProps {
  logo: string;
  children?: ReactNode;
}

export const Navbar = ({ logo, children }: NavbarProps) => {
  return (
    <header className={styles.navbar}>
      <img className={styles.logo} src={logo} alt="Logo" />
      <nav className={styles.nav}>{children}</nav>
    </header>
  );
};
