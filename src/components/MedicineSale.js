import React, { useState, useEffect } from 'react';
import { Select, Button, Table, InputNumber, Card, notification } from 'antd';
import axios from 'axios';
import appConfig from '../ApiConfig';

const MedicineSale = () => {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${appConfig.pharmacyBaseURL}/medicines/`);
      setMedicines(response.data);
    } catch (error) {
      showToast('Failed to fetch medicines', 'error');
    }
  };

  const showToast = (messageText, type) => {
    notification[type]({
      message: messageText,
      duration: 2,
    });
  };

  const handleAddToCart = () => {
    if (!selectedMedicineId) {
      showToast('Please select a medicine', 'warning');
      return;
    }

    const selectedMedicine = medicines.find((med) => med.id === selectedMedicineId);

    if (!selectedMedicine) {
      showToast('Medicine not found', 'error');
      return;
    }

    if (cart.some((item) => item.medicine_id === selectedMedicineId)) {
      showToast('Medicine already in cart', 'warning');
    } else {
      setCart([...cart, { medicine_id: selectedMedicineId, quantity: 1 }]);
      setShowCart([...showCart, { ...selectedMedicine, quantity: 1 }]);
      showToast('Medicine added to cart', 'success');
    }
  };

  const handleQuantityChange = (value, record) => {
    setCart((prev) => prev.map((item) => (item.medicine_id === record.id ? { ...item, quantity: value } : item)));
    setShowCart((prev) => prev.map((item) => (item.id === record.id ? { ...item, quantity: value } : item)));
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.medicine_id !== id));
    setShowCart((prev) => prev.filter((item) => item.id !== id));
    showToast('Medicine removed from cart', 'info');
  };

  const handleConfirmSale = async () => {
    try {
      await axios.post(`${appConfig.pharmacyBaseURL}/sales/`, { cart });
      showToast('Sale confirmed successfully', 'success');
      setCart([]);
      setShowCart([]);
    } catch (error) {
      showToast('Failed to confirm sale', 'error');
    }
  };

  const totalQuantity = showCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = showCart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (text) => `₹${text}` },
    {
      title: 'Quantity',
      key: 'quantity',
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.stock}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => <Button danger onClick={() => handleRemove(record.id)}>Remove</Button>,
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', gap: '8px', marginBottom: 16 }}>
        <Select
          showSearch
          style={{ flex: 1 }}
          placeholder="Search Medicine"
          optionFilterProp="children"
          onChange={setSelectedMedicineId}
          filterOption={(input, option) => option?.children?.toLowerCase().includes(input.toLowerCase())}
        >
          {medicines.map((med) => (
            <Select.Option key={med.id} value={med.id}>
              {`${med.name} - ₹${med.price}`}
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleAddToCart}>Add to Cart</Button>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 16 }}>
        <Table dataSource={showCart} columns={columns} rowKey="id" pagination={false} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <div>Total Quantity: {totalQuantity}</div>
        <div>Total Price: ₹{totalPrice}</div>
      </div>

      <Button type="primary" onClick={handleConfirmSale} style={{ marginTop: 16, width: '100%' }}>
        Confirm Sale
      </Button>
    </Card>
  );
};

export default MedicineSale;
