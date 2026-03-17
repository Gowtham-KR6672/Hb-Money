import { lazy } from 'react';

export const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
export const OtpPage = lazy(() => import('../pages/auth/OtpPage'));
export const DashboardPage = lazy(() => import('../pages/DashboardPage'));
export const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
export const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
export const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
export const AdminPage = lazy(() => import('../pages/admin/AdminPage'));
