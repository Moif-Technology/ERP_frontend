import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main 
        // style={{ flex: 1, overflowY: 'auto', minHeight: 'calc(100vh - 60px)' }}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
}