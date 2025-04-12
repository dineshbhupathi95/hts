import React from 'react';
import { Layout, Typography, Row, Col, Card } from 'antd';
import { 
  LineChart, Line, Tooltip as LineTooltip, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar, Tooltip as BarTooltip,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as RadarTooltip 
} from 'recharts';

const { Content } = Layout;
const { Title, Text } = Typography;

// Dummy Pharmacy Data
const salesData = [
  { name: 'Jan', sales: 1200 },
  { name: 'Feb', sales: 1500 },
  { name: 'Mar', sales: 1800 },
  { name: 'Apr', sales: 2200 },
  { name: 'May', sales: 2500 },
];

const stockLevels = [
  { category: 'Painkillers', stock: 500 },
  { category: 'Antibiotics', stock: 350 },
  { category: 'Vitamins', stock: 600 },
  { category: 'Cough Syrups', stock: 250 },
];

const topSellingMedicines = [
  { name: 'Paracetamol', sales: 400 },
  { name: 'Amoxicillin', sales: 350 },
  { name: 'Vitamin C', sales: 500 },
  { name: 'Cough Syrup', sales: 300 },
];

const revenueByMonth = [
  { month: 'Jan', revenue: 10000 },
  { month: 'Feb', revenue: 12000 },
  { month: 'Mar', revenue: 15000 },
  { month: 'Apr', revenue: 18000 },
  { month: 'May', revenue: 21000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PharmacyDashboard = ({ user }) => {
  return (
    <Content style={{ margin: '16px', padding: '16px', background: '#fff' }}>
      <Title level={2}>Pharmacy Dashboard</Title>
      {user && <Text strong>Welcome, {user.full_name || user.username}!</Text>}

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        {/* Medicine Sales Trend */}
        <Col xs={24} md={12}>
          <Card title="Medicine Sales Trend ($)" bordered={false}>
            <LineChart width={350} height={250} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <LineTooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </Card>
        </Col>

        {/* Stock Levels by Category */}
        <Col xs={24} md={12}>
          <Card title="Stock Levels by Category" bordered={false}>
            <BarChart width={350} height={250} data={stockLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <BarTooltip />
              <Legend />
              <Bar dataKey="stock" fill="#1890ff" />
            </BarChart>
          </Card>
        </Col>

        {/* Top Selling Medicines */}
        <Col xs={24} md={12}>
          <Card title="Top-Selling Medicines" bordered={false}>
            <PieChart width={350} height={250}>
              <Pie data={topSellingMedicines} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {topSellingMedicines.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <PieTooltip />
              <Legend />
            </PieChart>
          </Card>
        </Col>

        {/* Revenue by Month */}
        <Col xs={24} md={12}>
          <Card title="Revenue by Month ($)" bordered={false}>
            <RadarChart outerRadius={90} width={350} height={250} data={revenueByMonth}>
              <PolarGrid />
              <PolarAngleAxis dataKey="month" />
              <PolarRadiusAxis />
              <RadarTooltip />
              <Legend />
              <Radar name="Revenue" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            </RadarChart>
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default PharmacyDashboard;
