import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

function Login({ onLogin }) {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      const userResponse = await fetch('http://localhost:8000/users/me/', {
        headers: { 'Authorization': `Bearer ${data.access_token}` },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await userResponse.json();
      onLogin(data.access_token, userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center' }}>Login</Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter your username' }]}> 
            <Input placeholder="Enter username" />
          </Form.Item>
          
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Login
            </Button>
          </Form.Item>
        </Form>
        
        <Text style={{ display: 'block', textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Register</Link>
        </Text>
      </Card>
    </div>
  );
}

export default Login;