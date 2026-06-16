import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Bell, MessageCircle, User, LogOut, Building2, CircleDollarSign, Sun, Moon, Calendar, Video, Wallet, FileSignature, Users, Home, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // User dashboard route based on role
  const dashboardRoute = user?.role === 'entrepreneur' 
    ? '/dashboard/entrepreneur' 
    : '/dashboard/investor';
  
  // User profile route based on role and ID
  const profileRoute = user 
    ? `/profile/${user.role}/${user.id}` 
    : '/login';
  
  const navLinks = [
    {
      icon: user?.role === 'entrepreneur' ? <Building2 size={18} /> : <CircleDollarSign size={18} />,
      text: 'Dashboard',
      path: dashboardRoute,
    },
    {
      icon: <MessageCircle size={18} />,
      text: 'Messages',
      path: user ? '/messages' : '/login',
    },
    {
      icon: <Bell size={18} />,
      text: 'Notifications',
      path: user ? '/notifications' : '/login',
    },
    {
      icon: <User size={18} />,
      text: 'Profile',
      path: profileRoute,
    }
  ];

  const mobileNavItems = user ? (user.role === 'entrepreneur' ? [
    { to: '/dashboard/entrepreneur', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/entrepreneur/' + user.id, icon: <Building2 size={20} />, text: 'My Startup' },
    { to: '/investors', icon: <CircleDollarSign size={20} />, text: 'Find Investors' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/video', icon: <Video size={20} />, text: 'Video Call' },
    { to: '/meetings', icon: <Calendar size={20} />, text: 'Calendar' },
    { to: '/payments', icon: <Wallet size={20} />, text: 'Payments' },
    { to: '/document-chamber', icon: <FileSignature size={20} />, text: 'Document Chamber' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/documents', icon: <FileText size={20} />, text: 'Documents' },
  ] : [
    { to: '/dashboard/investor', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/profile/investor/' + user.id, icon: <CircleDollarSign size={20} />, text: 'My Portfolio' },
    { to: '/entrepreneurs', icon: <Users size={20} />, text: 'Find Startups' },
    { to: '/messages', icon: <MessageCircle size={20} />, text: 'Messages' },
    { to: '/video', icon: <Video size={20} />, text: 'Video Call' },
    { to: '/meetings', icon: <Calendar size={20} />, text: 'Calendar' },
    { to: '/payments', icon: <Wallet size={20} />, text: 'Payments' },
    { to: '/document-chamber', icon: <FileSignature size={20} />, text: 'Document Chamber' },
    { to: '/notifications', icon: <Bell size={20} />, text: 'Notifications' },
    { to: '/deals', icon: <FileText size={20} />, text: 'Deals' },
  ]) : [];
  
  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Business Nexus</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:ml-6">
            {user ? (
              <div className="flex items-center space-x-4">
                {navLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                  >
                    <span className="mr-2">{link.icon}</span>
                    {link.text}
                  </Link>
                ))}
                
                <button
                  onClick={toggleDark}
                  className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  title={isDark ? 'Light mode' : 'Dark mode'}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                
                <Button 
                  variant="ghost"
                  onClick={handleLogout}
                  leftIcon={<LogOut size={18} />}
                >
                  Logout
                </Button>
                
                  <Link to={profileRoute} className="flex items-center space-x-2 ml-2">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status={user.isOnline ? 'online' : 'offline'}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Dark mode toggle (mobile) */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={toggleDark}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar
                    src={user.avatarUrl}
                    alt={user.name}
                    size="sm"
                    status={user.isOnline ? 'online' : 'offline'}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  {mobileNavItems.map((link, index) => (
                    <Link
                      key={index}
                      to={link.to}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.text}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Link 
                  to="/login" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="outline" fullWidth>Log in</Button>
                </Link>
                <Link 
                  to="/register" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};