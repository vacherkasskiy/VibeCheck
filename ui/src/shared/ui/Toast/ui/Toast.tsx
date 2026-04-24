import { createContext, useContext, useState, useEffect } from 'react';
import styles from './styles.module.css';
import type { ReactNode } from 'react';

interface ToastMessage {
	id: string;
	message: string;
	type?: 'info' | 'success' | 'error';
}

interface ToastContextType {
	showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
	const [messages, setMessages] = useState<ToastMessage[]>([]);

	const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
		const id = Date.now().toString();
		setMessages((prev) => [...prev, { id, message, type }]);
	};

	const removeToast = (id: string) => {
		setMessages((prev) => prev.filter((msg) => msg.id !== id));
	};

	return (
		<ToastContext.Provider value={{ showToast }}>
			{children}
			<div className={styles.toastContainer}>
				{messages.map(({ id, message, type }) => (
					<div
						key={id}
						className={`
            ${styles.toast} 
            ${styles[type || 'info']}
          `}
					>
						<span>{message}</span>
						<button onClick={() => removeToast(id)} className={styles.close}>
							&times;
						</button>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error('useToast must be used within ToastProvider');
	}
	return context;
};
