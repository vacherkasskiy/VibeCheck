import { FlagsPage } from 'pages/FlagsPage';
import { LoginPage } from 'pages/LoginPage';
import { RecommendationsPage } from 'pages/RecommendationsPage';
import { RegisterPage } from 'pages/RegisterPage';
import { WelcomePage } from 'pages/WelcomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './styles/global.css';
import './fonts/fonts.css';

const App = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<WelcomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/flags" element={<FlagsPage />} />
				<Route path="/recommendations" element={<RecommendationsPage />} />
				<Route path="*" element={<WelcomePage />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
