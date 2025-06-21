import React, { useState } from 'react';
import Header from './Header.jsx';
import Sidebar from './Sidebar';
import ChatBotWidget from '../ChatBotWidget.jsx'; // Import ChatBotWidget

const Layout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col"> {/* Changed to flex flex-col */}
      <Header toggleMobileSidebar={toggleMobileSidebar} />
      <div className="flex flex-1 overflow-hidden"> {/* Added flex-1 and overflow-hidden to allow content to scroll if needed */}
        <Sidebar isMobileSidebarOpen={isMobileSidebarOpen} />
        {/* Adjust main content margin:
            - Always have margin on md+ screens.
            - On smaller screens, if sidebar is open, it might overlay or push.
              For now, let's assume it overlays and main content doesn't get a margin.
              If it were to push, we'd add a conditional margin like:
              `className={`flex-1 transition-all duration-300 ease-in-out ${isMobileSidebarOpen ? 'ml-64' : 'ml-0'} md:ml-64`}`
              But for an overlaying sidebar, the main content margin is simpler.
        */}
        <main className={`flex-1 transition-all duration-300 ease-in-out md:ml-64 h-full overflow-y-auto`}> {/* Added h-full and overflow-y-auto */}
          <div className="p-6 pt-2 md:pt-6 h-full"> {/* Added h-full to the direct child wrapper */}
            {children}
          </div>
        </main>
      </div>
      <ChatBotWidget /> {/* Add ChatBotWidget here */}
    </div>
  );
};

export default Layout;