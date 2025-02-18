import { createBrowserRouter } from 'react-router-dom';
import Register from './pages/Register';
import App from './App';
import Login from './pages/Login';
import SearchMapBox from './components/SearchMapBox';
import AdminAddPage from './pages/AdminAddPage';
import DriverHomePage from './pages/DriverHomePage';
import DriverDetailsOrderPage from './pages/DriverDetailsOrderPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/test',
        element: <SearchMapBox/>
    },
    {
        path: '/admin/add',
        element: <AdminAddPage />
    },
    {
        path: '/driver',
        element: <DriverHomePage />
    },
    {
        path: '/driver/:resi',
        element: <DriverDetailsOrderPage />
    }
])

export default router;