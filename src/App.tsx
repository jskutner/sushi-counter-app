import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';
import OrderManagement from './pages/OrderManagement';
import PaymentTracking from './pages/PaymentTracking';
import OrderHistory from './pages/OrderHistory';
import MenuDisplay from './pages/MenuDisplay';
import MenuEditor from './pages/MenuEditor';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/:orderId" element={<OrderForm />} />
          <Route path="/manage/:orderId" element={<OrderManagement />} />
          <Route path="/payment/:orderId" element={<PaymentTracking />} />
          <Route path="/history/:orderId" element={<OrderHistory />} />
          <Route path="/menu" element={<MenuDisplay />} />
          <Route path="/menu-editor" element={<MenuEditor />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
