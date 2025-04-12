import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Match menu keys based on current path
  const selectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return '/dashboard';
    if (path.startsWith('/medicines')) return '/medicines';
    if (path.startsWith('/sale')) return '/sale';
    if (path.startsWith('/inventory')) return '/inventory';
    if (path.startsWith('/settings')) return '/settings';
    return ''; // fallback
  };

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div style={{ height: '32px', margin: '16px', color: 'white', textAlign: 'center' }}>
        {/* Logo / title */}
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[selectedKey()]}>
        <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="/medicines" icon={<MedicineBoxOutlined />}>
          <Link to="/medicines">Medicines</Link>
        </Menu.Item>
        <Menu.Item key="/sale" icon={<ShoppingCartOutlined />}>
          <Link to="/sale">Sale</Link>
        </Menu.Item>
        <Menu.Item key="/inventory" icon={<AppstoreAddOutlined />}>
          <Link to="/inventory">Inventory</Link>
        </Menu.Item>
        <Menu.Item key="/settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideNav;
