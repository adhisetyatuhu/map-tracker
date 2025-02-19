import Logout from "./Logout";

export default function Header() {
    return (
        <header className="p-4 mb-4 bg-blue-500">
            <div className="container mx-auto flex justify-between items-center text-white">
                <h1 className="text-xl font-bold">LOGO</h1>
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