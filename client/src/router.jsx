import { createBrowserRouter } from 'react-router-dom';
import Register from './pages/Register';
import App from './App';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />
    },
    {
        path: '/register',
        element: <Register />
    }
])

export default router;