import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from './ModuleTabs';
import MiniToolbar from './MiniToolbar';
import { isLoggedIn, syncAccessIfChanged } from '../auth/auth.service.js';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 200;

export default function Layout({ children }) {
  const [headerToolsExpanded, setHeaderToolsExpanded] = useState(true);
  const [accessTick, setAccessTick] = useState(0);

  useEffect(() => {
    if (!isLoggedIn()) return undefined;

    let lastFocusSyncAt = 0;

    const runSync = async () => {
      try {
        const result = await syncAccessIfChanged();
        if (result?.changed) {
          setAccessTick((v) => v + 1);
        }
      } catch {
        // Silent: auth/http interceptor already handles token/session failures.
      }
    };

    const onFocus = () => {
      const now = Date.now();
      if (now - lastFocusSyncAt < 10000) return;
      lastFocusSyncAt = now;
      runSync();
    };

    const onAccessUpdated = () => setAccessTick((v) => v + 1);

    runSync();
    const timer = window.setInterval(runSync, 30000);
    window.addEventListener('focus', onFocus);
    window.addEventListener('access:updated', onAccessUpdated);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('access:updated', onAccessUpdated);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
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
          flexShrink: 0,
          marginLeft: SIDEBAR_WIDTH,
        }}
      >
        <ModuleTabs expanded={headerToolsExpanded} onExpandedChange={setHeaderToolsExpanded} />
        {headerToolsExpanded ? <MiniToolbar /> : null}
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Sidebar key={`sidebar-${accessTick}`} />
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
            overflowX: 'hidden',
          }}
        >
          {children ?? <Outlet key={`access-${accessTick}`} />}
        </main>
      </div>
    </div>
  );
}
