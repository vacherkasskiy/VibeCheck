type Props = {
	text: string;
	maxLength: number;
};

export const formatTextLength = (props: Props) => {
	const { text, maxLength } = props;

	if (text.length < maxLength) {
		return text;
	}

	return text.slice(0, maxLength) + '...';
};
