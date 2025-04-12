import React from 'react';
import { Layout, Typography } from 'antd';
import { useLocation } from 'react-router-dom';
import SideNav from './SideNav';
import Dashboard from './Dashboard';
import Reports from './Report';
import Settings from './Settings';
import NotFound from './NotFound';
import MedicineTable from './Medicine';
import MedicineSale from './MedicineSale';
import InventoryComp from './inventory/InventoryComp';

const { Header, Content } = Layout;
const { Text } = Typography;

const MainLayout = ({ user }) => {
  const location = useLocation(); // Get the current route

  // Render the appropriate component based on the route
  const renderContent = () => {
    switch (location.pathname) {
      case '/dashboard':
        return <Dashboard user={user} />;
      case '/medicines':
        return <MedicineTable />;
      case '/settings':
        return <Settings />;
      case '/sale':
        return <MedicineSale />;
      case '/inventory':
      return <InventoryComp />;
      default:
        return <NotFound />; // Show NotFound for unknown routes
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideNav />
      <Layout>
        <Header style={{ background: '#fff', padding: 16 }}>
        {user && <Text strong>Welcome, {user.full_name || user.username}!</Text>}
        </Header>
        <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
          {renderContent()} 
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
