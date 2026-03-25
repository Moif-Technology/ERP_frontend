import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from './ModuleTabs';
import MiniToolbar from './MiniToolbar';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 200;

export default function Layout({ children }) {
  const [headerToolsExpanded, setHeaderToolsExpanded] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f7fb',
        paddingTop: HEADER_HEIGHT,
      }}
    >
      <Header />
      <div
        style={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 40,
          marginLeft: SIDEBAR_WIDTH,
        }}
      >
        <ModuleTabs expanded={headerToolsExpanded} onExpandedChange={setHeaderToolsExpanded} />
        {headerToolsExpanded ? <MiniToolbar /> : null}
      </div>
      <div
        style={{
          display: 'flex',
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            marginLeft: SIDEBAR_WIDTH,
            padding: '24px 28px 32px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
