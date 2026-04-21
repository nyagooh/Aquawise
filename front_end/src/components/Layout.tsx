import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
                <BottomNav />
            </main>
        </div>
    );
}
