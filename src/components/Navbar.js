import React from 'react';
import { Link } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';

const { Header } = Layout;
const { Text } = Typography;

function Navbar({ isAuthenticated, user, onLogout }) {
  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
      <Text style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>HospiTechSol</Link>
      </Text>
      
      <Menu theme="dark" mode="horizontal" selectable={false} style={{ flex: 1, justifyContent: 'end', background: 'transparent' }}>
        {isAuthenticated ? (
          <>
            <Menu.Item key="user" style={{ color: 'white' }}>
              Hello, {user?.username}
            </Menu.Item>
            <Menu.Item key="logout">
              <Button type="primary" onClick={onLogout} danger>
                Logout
              </Button>
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="login">
              <Link to="/login">Login</Link>
            </Menu.Item>
            <Menu.Item key="register">
              <Link to="/register">Register</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
}

export default Navbar;
