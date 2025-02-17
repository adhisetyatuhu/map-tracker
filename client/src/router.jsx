import { createBrowserRouter } from 'react-router-dom';
import Register from './pages/Register';
import App from './App';
import Login from './pages/Login';
import SearchMapBox from './components/SearchMapBox';

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
    }
])

export default router;