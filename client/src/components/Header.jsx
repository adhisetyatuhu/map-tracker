import Logout from "./Logout";

export default function Header() {
    return (
        <header className="p-4 bg-blue-500 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <h1>LOGO</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">About</a></li>
                        <li><Logout /></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}