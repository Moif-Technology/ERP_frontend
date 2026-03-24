import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ModuleTabs from './ModuleTabs';
import MiniToolbar from './MiniToolbar';

const HEADER_HEIGHT = 30;
const SIDEBAR_WIDTH = 200;

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
      <div
        style={{
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 40,
          marginLeft: SIDEBAR_WIDTH,
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
            overflow: 'hidden',
          }}
        >
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
