// import './App.css';
// import Header from "./components/layouts/Header";
import Layout from './components/layouts/Layout';       // ← add this
import AppRoutes from './Routes';

function App() {
  return (
    // <div className="App">
    //   <Header />

      
    // </div>
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

export default App;
