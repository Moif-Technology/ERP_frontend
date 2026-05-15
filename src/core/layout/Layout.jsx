import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from './ModuleTabs';
import { isLoggedIn, syncAccessIfChanged } from '../auth/auth.service.js';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 200;
const SIDEBAR_COLLAPSED_WIDTH = 48;

export default function Layout({ children }) {
  const [headerToolsExpanded, setHeaderToolsExpanded] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarW = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const [accessTick, setAccessTick] = useState(0);
  const mainRef = useRef(null);
  const lastMainScrollTopRef = useRef(0);
  const lastWindowScrollTopRef = useRef(0);

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

  useEffect(() => {
    const main = mainRef.current;

    const collapseOnDownScroll = (scrollTop, lastScrollTopRef) => {
      const scrollingDown = scrollTop > lastScrollTopRef.current + 8;

      if (scrollTop > 12 && scrollingDown) {
        setHeaderToolsExpanded(false);
      }

      lastScrollTopRef.current = Math.max(0, scrollTop);
    };

    const handleMainScroll = () => {
      const scrollTop = main.scrollTop;
      collapseOnDownScroll(scrollTop, lastMainScrollTopRef);
    };

    const handleWindowScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      collapseOnDownScroll(scrollTop, lastWindowScrollTopRef);
    };

    lastWindowScrollTopRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    lastMainScrollTopRef.current = main?.scrollTop || 0;

    main?.addEventListener('scroll', handleMainScroll, { passive: true });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      main?.removeEventListener('scroll', handleMainScroll);
      window.removeEventListener('scroll', handleWindowScroll);
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
          marginLeft: sidebarW,
          transition: 'margin-left 0.22s ease',
        }}
      >
        <ModuleTabs expanded={headerToolsExpanded} onExpandedChange={setHeaderToolsExpanded} />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Sidebar key={`sidebar-${accessTick}`} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        <main
          ref={mainRef}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            marginLeft: sidebarW,
            transition: 'margin-left 0.22s ease',
            padding: '10px 28px 32px',
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
