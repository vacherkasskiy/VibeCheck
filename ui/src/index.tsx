import App from 'app/App';
import { createRoot } from 'react-dom/client';

const domNode = document.getElementById('root');

if (!domNode) {
	throw new Error('Could not find root node!');
}

const root = createRoot(domNode);

root.render(<App />);
