import { AuthProvider } from 'features/auth';
import { GamificationAuthProvider } from 'features/gamificationAuth';
import { ReviewAuthProvider } from 'features/reviewAuth';
import { AddCompanyPage } from 'pages/AddCompanyPage';
import { CompanyPage } from 'pages/CompanyPage';
import { EditProfilePage } from 'pages/EditProfilePage';
import { FlagsPage } from 'pages/FlagsPage';
import { LoginPage } from 'pages/LoginPage';
import { ProfilePage } from 'pages/ProfilePage';
import { RecommendationsPage } from 'pages/RecommendationsPage';
import { RegisterPage } from 'pages/RegisterPage';
import { UserProfilePage } from 'pages/UserProfilePage';
import { WelcomePage } from 'pages/WelcomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { HeaderGlow } from 'shared/ui/HeaderGlow';
import { ToastProvider } from 'shared/ui/Toast';

import './styles/global.css';
import './fonts/fonts.css';

const App = () => {
	return (
		<BrowserRouter>
			<AuthProvider>
				<ReviewAuthProvider>
				<GamificationAuthProvider>
						<CenterGlow />
						<HeaderGlow />
						<ToastProvider>
							<Routes>
								<Route path="/" element={<WelcomePage />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/register" element={<RegisterPage />} />
								<Route path="/flags" element={<FlagsPage />} />
								<Route path="/recommendations" element={<RecommendationsPage />} />
								<Route path="/company/:id" element={<CompanyPage />} />
								<Route path="/add-company" element={<AddCompanyPage />} />
								<Route path="/profile" element={<ProfilePage />} />
								<Route path="/profile/edit" element={<EditProfilePage />} />
								<Route path="/user/:userId" element={<UserProfilePage />} />
								<Route path="*" element={<WelcomePage />} />
							</Routes>
						</ToastProvider>
					</GamificationAuthProvider>
				</ReviewAuthProvider>
			</AuthProvider>
		</BrowserRouter>
	);
};

export default App;
