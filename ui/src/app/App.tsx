import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from 'features/auth';

import { AddCompanyPage } from 'pages/AddCompanyPage';
import { CompanyPage } from 'pages/CompanyPage';
import { EditProfilePage } from 'pages/EditProfilePage';
import { FlagsPage } from 'pages/FlagsPage';
import { ForgotPasswordPage } from 'pages/ForgotPasswordPage';
import { LoginPage } from 'pages/LoginPage';
import { ProfilePage } from 'pages/ProfilePage';
import { RecommendationsPage } from 'pages/RecommendationsPage';
import { RegisterPage } from 'pages/RegisterPage';
import { UserProfilePage } from 'pages/UserProfilePage';
import { WelcomePage } from 'pages/WelcomePage';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { HeaderGlow } from 'shared/ui/HeaderGlow';
import { ToastProvider } from 'shared/ui/Toast';

import './styles/global.css';
import './fonts/fonts.css';

const App = () => {
	const [queryClient] = useState(
		() => new QueryClient({
		  defaultOptions: {
		    queries: {
		      staleTime: 5 * 60 * 1000, // 5 min
		      retry: 1,
		    },
		  },
		}),
	);

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<CenterGlow />
					<HeaderGlow />
					<div className="appContent">
						<ToastProvider>
							<Routes>

							<Route path="/" element={<WelcomePage />} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/register" element={<RegisterPage />} />
							<Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
				</div>
			</AuthProvider>
			</QueryClientProvider>
		</BrowserRouter>
	);
};

export default App;
