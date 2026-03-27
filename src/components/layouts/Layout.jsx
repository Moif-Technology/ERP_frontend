import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from './ModuleTabs';
import MiniToolbar from './MiniToolbar'; 

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH_EXPANDED = 232;
const SIDEBAR_WIDTH_COLLAPSED = 76;
const SIDEBAR_STORAGE_KEY = 'ui_sidebar_collapsed';

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (raw === '1') setSidebarCollapsed(true);
    } catch {
      // ignore storage issues
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    } catch {
      // ignore storage issues
    }
  }, [sidebarCollapsed]);

  const sidebarWidth = useMemo(
    () => (sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED),
    [sidebarCollapsed]
  );

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
          marginLeft: sidebarWidth,
          transition: 'margin-left 180ms ease',
        }}
      >
        <ModuleTabs />
        <div className="mt-1">
          <MiniToolbar />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          width={sidebarWidth}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: sidebarWidth,
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
