import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Title level={2}>404 - Page Not Found</Title>
      <Text>The page you are looking for does not exist.</Text>
    </div>
  );
};

export default NotFound;
