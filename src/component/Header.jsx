import React, { Profiler, use, useContext, useEffect, useState } from 'react';
import { FaBars, FaBell, FaUser } from 'react-icons/fa';
import { getInitialsFromEmail } from '../Utils/utils';
import PopOver from './PopOver';
import { MdEmail } from 'react-icons/md';
import Switch from './SwitchButton';
import SwitchButton from './SwitchButton';
import { useDarkMode } from '../context/ThemeContext';

const Header = ({isSidebarOpen, setSidebarOpen}) => {
 const {darkMode, setDarkMode} = useDarkMode();

  // Replace this email with your user's email (e.g., from context or props)
   
  const [initials, setInitials] = useState('');
  const [isUser, setIsUser] = useState({})
    

  useEffect(() => {
    const userStr = localStorage.getItem("user");
   
  
    const user = JSON.parse(userStr);
 
    setIsUser(user.role)
    if (user && user.role.email) {
      const userInitials = getInitialsFromEmail(user.role.email);
      setInitials(userInitials);
       
    }
  }, []);
    

  
  const content = (
    <div className="text-sm space-y-3 p-3  primary rounded-lg">
    {/* Email Row */}
    <div className="flex items-center space-x-2">
      <MdEmail className="  text-lg" />
      <span className="font-medium text-gray-600">Email:</span>
      <span className="truncate">{isUser.email}</span>
    </div>
  
    {/* Role Row */}
    <div className="flex items-center space-x-2">
      <FaUser className="  text-lg" />
      <span className="font-medium text-gray-600">Role:</span>
      <span className="capitalize">{isUser.role}</span>
    </div>
  </div>
  
  );
   

  return (
    <header className="bg-white dark:bg-custom-bg dark:border-none  sticky top-0 z-10  my-2 mx-6 border border-gray-300 rounded-lg text-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <FaBars
          className="text-2xl dark:text-white text-black cursor-pointer"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 dark:text-white dark:border-white py-2 border border-2px border-black rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
          <SwitchButton  checked={darkMode} onClick={()=>setDarkMode(!darkMode)}/>
        {/* Notification Icon */}
        <div className="relative cursor-pointer">
          <FaBell className="text-2xl text-black dark:text-white" />
          {/* Optional: Notification dot */}
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full animate-ping"></span>
        </div>

        {/* User Initials */}
        <PopOver content={content} trigger={"click"}>
        <div className="w-10 h-10 rounded-full cursor-pointer dark:bg-dark-mode dark:text-white bg-black flex items-center justify-center text-white font-bold">
          {initials}
        </div>
        </PopOver>
      </div>
    </header>
  );
};

export default Header;
