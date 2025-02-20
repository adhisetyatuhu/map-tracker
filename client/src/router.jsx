import { createBrowserRouter } from 'react-router-dom';
import Register from './pages/Register';
import App from './App';
import Login from './pages/Login';
import SearchMapBox from './components/SearchMapBox';
import AdminAddPage from './pages/AdminAddPage';
import DriverHomePage from './pages/DriverHomePage';
import DriverDetailsOrderPage from './pages/DriverDetailsOrderPage';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminHome from './pages/AdminHome';
import AdminDetailsRoutePage from './pages/AdminDetailsRoutePage';

const router = createBrowserRouter([
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <App />
            },
            {
                path: '/test',
                element: <SearchMapBox />
            },
            {
                path: '/driver',
                element: <DriverHomePage />
            },
            {
                path: '/driver/:resi',
                element: <DriverDetailsOrderPage />
            }
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                path: '/admin/',
                element: <AdminHome />
            },
            {
                path: '/admin/add',
                element: <AdminAddPage />
            },
            {
                path: '/admin/:id',
                element: <AdminDetailsRoutePage />
            }
        ]
    }
])

export default router;