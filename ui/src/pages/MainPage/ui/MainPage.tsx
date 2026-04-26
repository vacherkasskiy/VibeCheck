import { Badge } from 'shared/ui/Badge/ui/Badge';

export const MainPage = () => {
	return (
		<main>
			<Badge  variant="success" rotation={15}>
				Дают печеньки
			</Badge>

			<Badge  variant="danger" rotation={-15}>
				Не дают печеньки
			</Badge>
		</main>
	);
};
