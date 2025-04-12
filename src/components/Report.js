
import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';


const { Content } = Layout;
const { Title, Text } = Typography;

const Reports = () => {
    return (
      <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
        <Title level={2}>Reports</Title>
        <Text>This is the reports section.</Text>
      </Content>
    );
  };

  export default Reports;