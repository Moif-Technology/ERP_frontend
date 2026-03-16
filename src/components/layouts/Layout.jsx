import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from '../../pages/ModuleTabs';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 220;

export default function Layout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f6f7fb',
        paddingTop: HEADER_HEIGHT,
      }}
    >
      <Header />
      {/* Sticky module bar aligned with main content (beside sidebar) */}
      <div
        style={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 40,
          marginLeft: SIDEBAR_WIDTH,
        }}
      >
        <ModuleTabs />
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
            marginLeft: SIDEBAR_WIDTH,
            padding: '24px 28px 32px',
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
