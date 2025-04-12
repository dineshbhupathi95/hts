import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';

const { Title, Text } = Typography;

function Register() {
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }
      
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Card style={{ width: 400, padding: 20, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <Title level={2} style={{ textAlign: 'center' }}>Register</Title>
        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
        
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter your username' }]}> 
            <Input placeholder="Enter username" />
          </Form.Item>
          
          <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Please enter a valid email' }]}> 
            <Input placeholder="Enter email" />
          </Form.Item>
          
          <Form.Item label="Full Name" name="full_name"> 
            <Input placeholder="Enter full name" />
          </Form.Item>
          
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          
          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, message: 'Please confirm your password' }]}> 
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              Register
            </Button>
          </Form.Item>
        </Form>
        
        <Text style={{ display: 'block', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </Text>
      </Card>
    </div>
  );
}

export default Register;
