import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import BudgetsPage from './pages/BudgetsPage'
import RecurringPage from './pages/RecurringPage'
import SettingsPage from './pages/SettingsPage'
import Chatbot from './components/Chatbot'
import { fetchTransactions, fetchInsights, fetchMonths, fetchForecast } from './api'
import type { Tx, ForecastData } from './api'
import toast from 'react-hot-toast'

type Page = 'dashboard' | 'budgets' | 'recurring' | 'settings'

function getDemoTransactions() {
  return [
    // ── 2024 April ──
    { date: '2024-04-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-04-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-04-01', description: 'E-Transfer Rent April', amount: -1450 },
    { date: '2024-04-03', description: 'Loblaws', amount: -91.42 },
    { date: '2024-04-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-04-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-04-08', description: 'Toronto Hydro', amount: -58.14 },
    { date: '2024-04-10', description: 'No Frills', amount: -54.17 },
    { date: '2024-04-12', description: 'Tim Hortons', amount: -8.75 },
    { date: '2024-04-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-04-15', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-04-18', description: 'Loblaws', amount: -78.61 },
    { date: '2024-04-19', description: 'DoorDash', amount: -34.80 },
    { date: '2024-04-21', description: 'Steam Purchase', amount: -29.99 },
    { date: '2024-04-22', description: 'Uber', amount: -14.30 },
    { date: '2024-04-25', description: 'FreshCo', amount: -41.30 },
    { date: '2024-04-26', description: 'Osmow\'s Shawarma', amount: -18.40 },
    { date: '2024-04-28', description: 'Freelance Payment', amount: 850 },
    // ── 2024 May ──
    { date: '2024-05-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-05-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-05-01', description: 'E-Transfer Rent May', amount: -1450 },
    { date: '2024-05-02', description: 'Loblaws', amount: -79.88 },
    { date: '2024-05-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-05-06', description: 'Tim Hortons', amount: -9.25 },
    { date: '2024-05-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-05-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-05-08', description: 'Toronto Hydro', amount: -62.44 },
    { date: '2024-05-09', description: 'No Frills', amount: -62.44 },
    { date: '2024-05-13', description: 'Uber Eats', amount: -38.60 },
    { date: '2024-05-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-05-17', description: 'Metro', amount: -105.20 },
    { date: '2024-05-19', description: 'Uber', amount: -11.75 },
    { date: '2024-05-20', description: 'Osmow\'s Shawarma', amount: -21.00 },
    { date: '2024-05-22', description: 'Freelance Payment', amount: 650 },
    { date: '2024-05-27', description: 'DoorDash', amount: -29.45 },
    { date: '2024-05-28', description: 'Cineplex', amount: -24.50 },
    { date: '2024-05-28', description: 'FreshCo', amount: -38.75 },
    // ── 2024 June ──
    { date: '2024-06-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-06-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-06-01', description: 'E-Transfer Rent June', amount: -1450 },
    { date: '2024-06-02', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-06-03', description: 'Tim Hortons', amount: -7.50 },
    { date: '2024-06-04', description: 'Loblaws', amount: -91.33 },
    { date: '2024-06-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-06-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-06-08', description: 'Toronto Hydro', amount: -71.42 },
    { date: '2024-06-09', description: 'Uber', amount: -16.20 },
    { date: '2024-06-10', description: 'Uber Eats', amount: -44.90 },
    { date: '2024-06-11', description: 'No Frills', amount: -58.90 },
    { date: '2024-06-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-06-18', description: 'FreshCo', amount: -47.25 },
    { date: '2024-06-20', description: 'DoorDash', amount: -31.60 },
    { date: '2024-06-25', description: 'Cineplex', amount: -19.50 },
    { date: '2024-06-27', description: 'Steam Purchase', amount: -44.99 },
    // ── 2024 July ──
    { date: '2024-07-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-07-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-07-01', description: 'E-Transfer Rent July', amount: -1450 },
    { date: '2024-07-02', description: 'Loblaws', amount: -84.70 },
    { date: '2024-07-04', description: 'Tim Hortons', amount: -9.00 },
    { date: '2024-07-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-07-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-07-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-07-08', description: 'Toronto Hydro', amount: -55.30 },
    { date: '2024-07-10', description: 'No Frills', amount: -67.15 },
    { date: '2024-07-12', description: 'Uber Eats', amount: -27.80 },
    { date: '2024-07-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-07-15', description: 'Freelance Payment', amount: 1100 },
    { date: '2024-07-18', description: 'Osmow\'s Shawarma', amount: -19.50 },
    { date: '2024-07-20', description: 'Uber', amount: -13.40 },
    { date: '2024-07-22', description: 'Metro', amount: -88.60 },
    { date: '2024-07-26', description: 'DoorDash', amount: -36.20 },
    { date: '2024-07-28', description: 'Cineplex', amount: -22.00 },
    // ── 2024 August ──
    { date: '2024-08-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-08-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-08-01', description: 'E-Transfer Rent August', amount: -1450 },
    { date: '2024-08-02', description: 'Loblaws', amount: -96.10 },
    { date: '2024-08-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-08-06', description: 'Tim Hortons', amount: -8.25 },
    { date: '2024-08-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-08-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-08-08', description: 'Toronto Hydro', amount: -60.88 },
    { date: '2024-08-11', description: 'No Frills', amount: -53.40 },
    { date: '2024-08-13', description: 'Uber Eats', amount: -41.10 },
    { date: '2024-08-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-08-16', description: 'FreshCo', amount: -44.85 },
    { date: '2024-08-19', description: 'Uber', amount: -18.90 },
    { date: '2024-08-21', description: 'Steam Purchase', amount: -19.99 },
    { date: '2024-08-23', description: 'DoorDash', amount: -33.50 },
    { date: '2024-08-27', description: 'Osmow\'s Shawarma', amount: -20.25 },
    // ── 2024 September ──
    { date: '2024-09-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-09-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-09-01', description: 'E-Transfer Rent September', amount: -1450 },
    { date: '2024-09-03', description: 'Loblaws', amount: -88.25 },
    { date: '2024-09-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-09-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-09-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-09-08', description: 'Toronto Hydro', amount: -64.70 },
    { date: '2024-09-09', description: 'Tim Hortons', amount: -9.75 },
    { date: '2024-09-11', description: 'No Frills', amount: -71.30 },
    { date: '2024-09-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-09-16', description: 'Freelance Payment', amount: 750 },
    { date: '2024-09-17', description: 'Uber Eats', amount: -35.70 },
    { date: '2024-09-19', description: 'Uber', amount: -12.60 },
    { date: '2024-09-23', description: 'Metro', amount: -92.40 },
    { date: '2024-09-25', description: 'DoorDash', amount: -28.90 },
    { date: '2024-09-28', description: 'Cineplex', amount: -21.50 },
    // ── 2024 October ──
    { date: '2024-10-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-10-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-10-01', description: 'E-Transfer Rent October', amount: -1450 },
    { date: '2024-10-02', description: 'Loblaws', amount: -102.50 },
    { date: '2024-10-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-10-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-10-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-10-08', description: 'Toronto Hydro', amount: -68.15 },
    { date: '2024-10-09', description: 'Tim Hortons', amount: -10.25 },
    { date: '2024-10-12', description: 'No Frills', amount: -59.80 },
    { date: '2024-10-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-10-16', description: 'Uber Eats', amount: -39.40 },
    { date: '2024-10-18', description: 'Uber', amount: -15.70 },
    { date: '2024-10-21', description: 'Steam Purchase', amount: -59.99 },
    { date: '2024-10-23', description: 'FreshCo', amount: -49.60 },
    { date: '2024-10-25', description: 'DoorDash', amount: -32.10 },
    { date: '2024-10-28', description: 'Osmow\'s Shawarma', amount: -22.00 },
    { date: '2024-10-30', description: 'Cineplex', amount: -26.00 },
    // ── 2024 November ──
    { date: '2024-11-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-11-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-11-01', description: 'E-Transfer Rent November', amount: -1450 },
    { date: '2024-11-03', description: 'Loblaws', amount: -94.75 },
    { date: '2024-11-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-11-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-11-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-11-08', description: 'Toronto Hydro', amount: -74.30 },
    { date: '2024-11-09', description: 'Tim Hortons', amount: -8.50 },
    { date: '2024-11-12', description: 'No Frills', amount: -66.20 },
    { date: '2024-11-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-11-15', description: 'Freelance Payment', amount: 920 },
    { date: '2024-11-17', description: 'Uber Eats', amount: -43.20 },
    { date: '2024-11-19', description: 'Uber', amount: -17.40 },
    { date: '2024-11-22', description: 'Metro', amount: -110.60 },
    { date: '2024-11-25', description: 'DoorDash', amount: -37.80 },
    { date: '2024-11-28', description: 'Steam Purchase', amount: -34.99 },
    // ── 2024 December ──
    { date: '2024-12-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-12-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2024-12-01', description: 'E-Transfer Rent December', amount: -1450 },
    { date: '2024-12-03', description: 'Loblaws', amount: -118.40 },
    { date: '2024-12-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2024-12-07', description: 'Netflix', amount: -17.99 },
    { date: '2024-12-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2024-12-08', description: 'Toronto Hydro', amount: -81.55 },
    { date: '2024-12-09', description: 'Tim Hortons', amount: -11.00 },
    { date: '2024-12-12', description: 'No Frills', amount: -72.90 },
    { date: '2024-12-14', description: 'Spotify', amount: -11.99 },
    { date: '2024-12-16', description: 'Uber Eats', amount: -51.30 },
    { date: '2024-12-18', description: 'Uber', amount: -21.50 },
    { date: '2024-12-20', description: 'Steam Purchase', amount: -79.99 },
    { date: '2024-12-21', description: 'Cineplex', amount: -34.00 },
    { date: '2024-12-22', description: 'Metro', amount: -135.80 },
    { date: '2024-12-24', description: 'DoorDash', amount: -58.40 },
    { date: '2024-12-26', description: 'FreshCo', amount: -63.20 },
    // ── 2025 January ──
    { date: '2025-01-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-01-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-01-01', description: 'E-Transfer Rent January', amount: -1450 },
    { date: '2025-01-03', description: 'Loblaws', amount: -87.60 },
    { date: '2025-01-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2025-01-07', description: 'Netflix', amount: -17.99 },
    { date: '2025-01-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2025-01-08', description: 'Toronto Hydro', amount: -88.40 },
    { date: '2025-01-10', description: 'Tim Hortons', amount: -9.50 },
    { date: '2025-01-12', description: 'No Frills', amount: -61.35 },
    { date: '2025-01-14', description: 'Spotify', amount: -11.99 },
    { date: '2025-01-16', description: 'Uber Eats', amount: -36.90 },
    { date: '2025-01-18', description: 'Uber', amount: -14.80 },
    { date: '2025-01-20', description: 'Freelance Payment', amount: 600 },
    { date: '2025-01-22', description: 'FreshCo', amount: -45.70 },
    { date: '2025-01-25', description: 'DoorDash', amount: -30.20 },
    { date: '2025-01-28', description: 'Osmow\'s Shawarma', amount: -19.75 },
    // ── 2025 February ──
    { date: '2025-02-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-02-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-02-01', description: 'E-Transfer Rent February', amount: -1450 },
    { date: '2025-02-03', description: 'Loblaws', amount: -83.20 },
    { date: '2025-02-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2025-02-07', description: 'Netflix', amount: -17.99 },
    { date: '2025-02-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2025-02-08', description: 'Toronto Hydro', amount: -79.65 },
    { date: '2025-02-10', description: 'Tim Hortons', amount: -8.75 },
    { date: '2025-02-12', description: 'No Frills', amount: -55.80 },
    { date: '2025-02-14', description: 'Spotify', amount: -11.99 },
    { date: '2025-02-16', description: 'Uber Eats', amount: -44.60 },
    { date: '2025-02-18', description: 'Uber', amount: -13.20 },
    { date: '2025-02-20', description: 'Cineplex', amount: -18.00 },
    { date: '2025-02-22', description: 'Metro', amount: -97.40 },
    { date: '2025-02-25', description: 'DoorDash', amount: -27.80 },
    // ── 2025 March ──
    { date: '2025-03-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-03-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-03-01', description: 'E-Transfer Rent March', amount: -1450 },
    { date: '2025-03-03', description: 'Loblaws', amount: -89.90 },
    { date: '2025-03-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2025-03-07', description: 'Netflix', amount: -17.99 },
    { date: '2025-03-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2025-03-08', description: 'Toronto Hydro', amount: -72.10 },
    { date: '2025-03-10', description: 'Tim Hortons', amount: -9.00 },
    { date: '2025-03-12', description: 'No Frills', amount: -63.45 },
    { date: '2025-03-14', description: 'Spotify', amount: -11.99 },
    { date: '2025-03-16', description: 'Freelance Payment', amount: 780 },
    { date: '2025-03-17', description: 'Uber Eats', amount: -38.10 },
    { date: '2025-03-19', description: 'Uber', amount: -16.50 },
    { date: '2025-03-21', description: 'Steam Purchase', amount: -24.99 },
    { date: '2025-03-24', description: 'FreshCo', amount: -42.30 },
    { date: '2025-03-27', description: 'DoorDash', amount: -33.60 },
    // ── 2025 April ──
    { date: '2025-04-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-04-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-04-01', description: 'E-Transfer Rent April', amount: -1450 },
    { date: '2025-04-03', description: 'Loblaws', amount: -87.42 },
    { date: '2025-04-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2025-04-07', description: 'Netflix', amount: -17.99 },
    { date: '2025-04-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2025-04-08', description: 'Toronto Hydro', amount: -62.14 },
    { date: '2025-04-10', description: 'No Frills', amount: -54.17 },
    { date: '2025-04-12', description: 'Tim Hortons', amount: -8.75 },
    { date: '2025-04-14', description: 'Spotify', amount: -11.99 },
    { date: '2025-04-19', description: 'Osmow\'s Shawarma', amount: -18.40 },
    { date: '2025-04-22', description: 'Uber', amount: -14.30 },
    { date: '2025-04-25', description: 'FreshCo', amount: -41.30 },
    { date: '2025-04-26', description: 'DoorDash', amount: -42.15 },
    { date: '2025-04-28', description: 'Freelance Payment', amount: 850 },
    // ── 2025 May ──
    { date: '2025-05-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-05-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-05-01', description: 'E-Transfer Rent May', amount: -1450 },
    { date: '2025-05-02', description: 'Loblaws', amount: -79.88 },
    { date: '2025-05-05', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2025-05-06', description: 'Tim Hortons', amount: -9.25 },
    { date: '2025-05-07', description: 'Netflix', amount: -17.99 },
    { date: '2025-05-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2025-05-08', description: 'Toronto Hydro', amount: -58.77 },
    { date: '2025-05-09', description: 'No Frills', amount: -62.44 },
    { date: '2025-05-13', description: 'Uber Eats', amount: -38.60 },
    { date: '2025-05-14', description: 'Spotify', amount: -11.99 },
    { date: '2025-05-17', description: 'Metro', amount: -105.20 },
    { date: '2025-05-19', description: 'Uber', amount: -11.75 },
    { date: '2025-05-20', description: 'Osmow\'s Shawarma', amount: -21.00 },
    { date: '2025-05-22', description: 'Freelance Payment', amount: 650 },
    { date: '2025-05-27', description: 'DoorDash', amount: -29.45 },
    { date: '2025-05-28', description: 'Cineplex', amount: -24.50 },
    { date: '2025-05-28', description: 'FreshCo', amount: -38.75 },
    // ── 2025 June ──
    { date: '2025-06-01', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-06-15', description: 'Payroll Deposit', amount: 3200 },
    { date: '2025-06-01', description: 'E-Transfer Rent June', amount: -1450 },
    { date: '2025-06-02', description: 'Presto Card Reload', amount: -50.00 },
    { date: '2025-06-03', description: 'Tim Hortons', amount: -7.50 },
    { date: '2025-06-04', description: 'Loblaws', amount: -91.33 },
    { date: '2025-06-07', description: 'Netflix', amount: -17.99 },
    { date: '2025-06-08', description: 'Rogers Internet', amount: -89.99 },
    { date: '2025-06-08', description: 'Toronto Hydro', amount: -71.42 },
    { date: '2025-06-09', description: 'Uber', amount: -16.20 },
    { date: '2025-06-10', description: 'Uber Eats', amount: -44.90 },
    { date: '2025-06-11', description: 'No Frills', amount: -58.90 },
    { date: '2025-06-14', description: 'Spotify', amount: -11.99 },
    { date: '2025-06-18', description: 'FreshCo', amount: -47.25 },
    { date: '2025-06-20', description: 'DoorDash', amount: -31.60 },
  ]
}

export default function App() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState<Page>('dashboard')
  const [tx, setTx] = useState<Tx[]>([])
  const [insights, setInsights] = useState<{ key: string; value: string }[]>([])
  const [months, setMonths] = useState<string[]>([])
  const [activeMonth, setActiveMonth] = useState<string | null>(null)
  const [forecast, setForecast] = useState<ForecastData>({ points: [], summary: '' })
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const isGuest = user?.email?.endsWith('@guest.local') ?? false

  const refresh = async (month?: string | null) => {
    setDataLoading(true)
    const [items, ins, ms, fc] = await Promise.all([
      fetchTransactions(month ?? undefined),
      fetchInsights(),
      fetchMonths(),
      fetchForecast(),
    ])
    setTx(items)
    setInsights(ins)
    setMonths(ms)
    setForecast(fc)
    setDataLoading(false)
    if (month === undefined && ms.length > 0 && !activeMonth) {
      const latest = ms[ms.length - 1]
      setActiveMonth(latest)
      const fresh = await fetchTransactions(latest)
      setTx(fresh)
    }
  }

  useEffect(() => {
    if (user) refresh(activeMonth)
  }, [user])

  const handleMonthChange = async (month: string) => {
    setActiveMonth(month)
    setShowYearPicker(false)
    const items = await fetchTransactions(month)
    setTx(items)
  }

  const handleDataCleared = () => {
    setTx([])
    setInsights([])
    setMonths([])
    setActiveMonth(null)
    setForecast({ points: [], summary: '' })
  }

  // Logs the guest out and redirects straight to signup mode
  const handleGuestSignUp = async () => {
    setAuthMode('signup')
    await logout()
  }

  const handleLoadDemo = async () => {
    const demo = getDemoTransactions()
    const csv = [
      'Date,Description,Amount',
      ...demo.map(t => `${t.date},"${t.description}",${t.amount}`)
    ].join('\n')
    const file = new File([csv], 'demo.csv', { type: 'text/csv' })
    const form = new FormData()
    form.append('file', file)
    const token = localStorage.getItem('finai_token')
    const toastId = toast.loading('Loading demo data… this may take a moment')
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/upload`,
        form,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      )
      toast.success('Demo data loaded!', { id: toastId })
      await refresh(undefined)
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Failed to load demo data'
      toast.error(msg, { id: toastId })
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="brand"><span className="brand-dot" />FinAI</div>
      </div>
    )
  }

  if (!user) return <AuthPage initialMode={authMode} />

  return (
    <>
      <AppLayout
        activePage={page}
        onNavigate={setPage}
        onUploaded={() => refresh(activeMonth)}
        onGuestSignUp={handleGuestSignUp}
      >
        {page === 'dashboard' && (
          <DashboardPage
            dataLoading={dataLoading}
            tx={tx}
            insights={insights}
            months={months}
            activeMonth={activeMonth}
            forecast={forecast}
            onMonthChange={handleMonthChange}
            onRefresh={(m) => { if (m === null) { setActiveMonth(null); refresh(null) } else refresh(m ?? undefined) }}
            showYearPicker={showYearPicker}
            setShowYearPicker={setShowYearPicker}
            onDemoLoaded={handleLoadDemo}
            isGuest={isGuest}
          />
        )}
        {page === 'budgets' && <BudgetsPage activeMonth={activeMonth} />}
        {page === 'recurring' && <RecurringPage />}
        {page === 'settings' && (
          <SettingsPage onDataCleared={handleDataCleared} />
        )}
      </AppLayout>
      <Chatbot />
    </>
  )
}
