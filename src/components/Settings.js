
import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;


const Settings = () => {
    return (
      <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
        <Title level={2}>Settings</Title>
        <Text>Manage your settings here.</Text>
      </Content>
    );
  };
  
export default Settings;