import { createBrowserRouter } from 'react-router-dom';
import Register from './pages/Register';
import App from './App';
import Login from './pages/Login';

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
])

export default router;