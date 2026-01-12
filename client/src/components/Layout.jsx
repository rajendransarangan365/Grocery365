import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LayoutDashboard, ShoppingCart, Package, Users, Truck, LogOut, UtensilsCrossed, Search, User, ClipboardList, Menu, Bell, History, ClipboardCheck } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-4 px-6 py-4 transition-all duration-200 group ${isActive
                ? 'text-black font-bold bg-gray-100 border-r-4 border-black'
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
            }`
        }
    >
        <Icon size={24} strokeWidth={2} />
        <span className="text-base tracking-wide">{label}</span>
    </NavLink>
);

const MobileNavItem = ({ to, icon: Icon, label, showBadge }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `relative flex flex-col items-center justify-center w-full py-2 transition-colors duration-200 ${isActive
                ? 'text-black'
                : 'text-gray-400 hover:text-gray-600'
            }`
        }
    >
        {({ isActive }) => (
            <>
                <Icon size={isActive ? 26 : 24} strokeWidth={isActive ? 2.5 : 2} />
                {showBadge && (
                    <span className="absolute top-1.5 right-[calc(50%-12px)] w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </>
        )}
    </NavLink>
);

const Layout = () => {
    const location = useLocation();
    const { items: cartItems } = useSelector(state => state.cart);

    // Determine Page Title based on path
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/': return 'Dashboard';
            case '/order': return 'Easy Order';
            case '/products': return 'Inventory';
            case '/customers': return 'Customers';
            case '/distributors': return 'Partners';
            case '/cart': return 'Cart';
            default: return 'Grocery365';
        }
    };

    return (
        <div className="flex h-[100dvh] bg-gray-50 font-sans overflow-hidden">
            {/* Desktop Sidebar (Left Rail) */}
            <aside className="hidden md:flex w-72 flex-col bg-white border-r border-gray-100 h-full fixed left-0 top-0 z-30">
                <div className="p-8 pb-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xl">G</div>
                    <h1 className="text-2xl font-black tracking-tighter">Grocery365</h1>
                </div>

                <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/order" icon={ShoppingCart} label="Easy Order" />
                    <SidebarItem to="/cart" icon={Menu} label="Current Order" />
                    <SidebarItem to="/history" icon={History} label="History" />
                    <div className="my-4 border-t border-gray-100 mx-6"></div>
                    <SidebarItem to="/products" icon={Package} label="Products" />
                    <SidebarItem to="/customers" icon={Users} label="Customers" />
                    <SidebarItem to="/distributors" icon={Truck} label="Distributors" />
                    <div className="mt-auto">
                        <SidebarItem to="/settings" icon={ClipboardList} label="Bill Settings" />
                    </div>
                </nav>

                <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-400">Store Manager</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-72 flex flex-col h-full bg-gray-50">

                {/* Mobile Top Bar (App Bar) */}
                <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
                    <h1 className="text-lg font-bold tracking-tight">{getPageTitle()}</h1>
                    <div className="flex gap-4 text-gray-700">
                        <Bell size={22} />
                        <NavLink to="/cart" className="relative">
                            <ShoppingCart size={22} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white"></span>
                            )}
                        </NavLink>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-0">
                    <Outlet />
                </main>

                {/* Mobile Bottom Navigation (Fixed) */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 flex items-center justify-around z-50 px-1 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <MobileNavItem to="/" icon={LayoutDashboard} label="Home" />
                    <MobileNavItem to="/order" icon={ShoppingCart} label="Shop" />
                    <MobileNavItem to="/cart" icon={ClipboardCheck} label="Cart" showBadge={cartItems.length > 0} />
                    <MobileNavItem to="/products" icon={Package} label="Stock" />
                    <MobileNavItem to="/settings" icon={ClipboardList} label="Settings" />
                </nav>
            </div>
        </div>
    );
};

export default Layout;
