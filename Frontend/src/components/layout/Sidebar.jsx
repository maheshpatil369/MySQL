import React from 'react';
// import { motion } from 'framer-motion'; // motion.aside removed, but motion.div still used below
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion'; // Keep for motion.div inside NavLink
import { 
  Home, 
  Map, 
  Users, 
  MessageCircle, 
  Settings, 
  PlusCircle,
  Calendar,
  Compass,
  Megaphone,
  Newspaper, // Corrected icon name
  LogOut,
  CreditCard // Added CreditCard icon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Plan Trip', href: '/plan', icon: PlusCircle },
  { name: 'My Trips', href: '/trips', icon: Map },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'News', href: '/analytics', icon: Newspaper }, // Using the correct Newspaper icon
  { name: 'Expense Tracker', href: '/expense-tracker', icon: CreditCard }, // Added Expense Tracker link
  { name: 'Maps', href: '/maps', icon: Map },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ isMobileSidebarOpen }) => {
  const location = useLocation();
  const { logout } = useAuth();

  // Base classes for the sidebar
  const baseClasses = "fixed inset-y-0 left-0 z-30 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 pt-16 transition-transform duration-300 ease-in-out";

  // Determine classes based on screen size and mobile open state
  // On md+ screens, it's always translated to 0 (visible).
  // On smaller screens, its translation depends on isMobileSidebarOpen.
  const responsiveClasses = `
    md:translate-x-0
    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `;
  // On md+ screens, 'md:translate-x-0' ensures it's visible.
  // On smaller screens:
  // - If isMobileSidebarOpen is true, 'translate-x-0' makes it visible.
  // - If isMobileSidebarOpen is false, '-translate-x-full' hides it.

  return (
    <aside
      // Apply base and responsive classes
      // Tailwind's transition-transform class in baseClasses will handle the animation
      className={`${baseClasses} ${responsiveClasses}`}
    >
      <div className="flex flex-col h-full">
        {/* Navigation and Logout Button content remains the same */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <motion.div 
                    className="flex items-center w-full"
                    whileHover={{ x: isActive ? 0 : 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </motion.button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;