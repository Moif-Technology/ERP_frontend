import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from './ModuleTabs';
import MiniToolbar from './MiniToolbar'; 

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 232;
const HEADER_TOOLS_EXPANDED_KEY = 'ui_header_tools_expanded';

export default function Layout({ children }) {
  const [headerToolsExpanded, setHeaderToolsExpanded] = useState(true);

  useEffect(() => {
    try {
      const toolsRaw = localStorage.getItem(HEADER_TOOLS_EXPANDED_KEY);
      if (toolsRaw === '0') setHeaderToolsExpanded(false);
    } catch {
      // ignore storage issues
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HEADER_TOOLS_EXPANDED_KEY, headerToolsExpanded ? '1' : '0');
    } catch {
      // ignore storage issues
    }
  }, [headerToolsExpanded]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f7fb',
        paddingTop: HEADER_HEIGHT,
      }}
    >
      <Header />
      {/* Sticky module area (tabs + action buttons) aligned with main content */}
      <div
        style={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 40,
          marginLeft: SIDEBAR_WIDTH,
          transition: 'margin-left 180ms ease',
        }}
      >
        <ModuleTabs
          expanded={headerToolsExpanded}
          onExpandedChange={setHeaderToolsExpanded}
        />
        {headerToolsExpanded ? (
          <div className="mt-1">
            <MiniToolbar />
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <Sidebar width={SIDEBAR_WIDTH} />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: SIDEBAR_WIDTH,
            transition: 'margin-left 180ms ease',
            padding: '24px 28px 32px',
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
