import styles from './styles.module.css';

export interface Avatar {
	id: string;
	url: string;
}

export interface AvatarSelectorProps {
	avatars: Avatar[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	required?: boolean;
	error?: string;
}

export const AvatarSelector = ({
	avatars,
	selectedId,
	onSelect,
	required = false,
	error,
}: AvatarSelectorProps) => {
	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<label className={styles.label}>
					Выберите аватар
					{required && <span className={styles.required}>*</span>}
				</label>
			</div>
			<div className={styles.grid}>
				{avatars.map((avatar) => (
					<button
						key={avatar.id}
						type="button"
						className={`${styles.avatar} ${selectedId === avatar.id ? styles.selected : ''}`}
						onClick={() => onSelect(avatar.id)}
					>
						<img src={avatar.url} alt={`Аватар ${avatar.id}`} className={styles.avatarImage} />
						{selectedId === avatar.id && (
							<div className={styles.checkmark}>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
									<path
										d="M13 4L6 11L3 8"
										stroke="white"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						)}
					</button>
				))}
			</div>
			{error && <span className={styles.errorMessage}>{error}</span>}
		</div>
	);
};