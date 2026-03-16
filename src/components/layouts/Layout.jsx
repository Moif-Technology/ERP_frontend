import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const HEADER_HEIGHT = 48;
const SIDEBAR_WIDTH = 220;

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f6f7fb' }}>
      <Header />
      <div
        style={{
          display: 'flex',
          minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
          paddingTop: HEADER_HEIGHT,
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
