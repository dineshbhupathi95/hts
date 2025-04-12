import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import axios from 'axios';
import appConfig from '../ApiConfig';

const MedicineTable = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Fetch Medicines
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${appConfig.pharmacyBaseURL}/medicines/`);
      setMedicines(response.data);
    } catch (error) {
      message.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  // Create Medicine
  const handleCreate = async (values) => {
    try {
      if (editingMedicine) {
      console.log(values)
      console.log(editingMedicine)
        // Update medicine
        await axios.put(`${appConfig.pharmacyBaseURL}/medicines/${editingMedicine.id}`, values);
        message.success('Medicine updated successfully');
      } else {
        // Create medicine
        await axios.post(`${appConfig.pharmacyBaseURL}/medicines/`, values);
        message.success('Medicine created successfully');
      }
      fetchMedicines();
      setIsModalVisible(false);
      form.resetFields();
      setEditingMedicine(null);
    } catch (error) {
      message.error('Failed to save medicine');
    }
  };

  // Delete Medicine
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${appConfig.pharmacyBaseURL}/medicines/${id}`);
      message.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      message.error('Failed to delete medicine');
    }
  };

  // Open Edit Modal
  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    form.setFieldsValue(medicine);
    setIsModalVisible(true);
  };

  // Medicine Table Columns
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (text) => `₹${text}` },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Manufacturer', dataIndex: 'manufacturer', key: 'manufacturer' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16, float: 'right' }}
        onClick={() => {
          setIsModalVisible(true);
          form.resetFields();
          setEditingMedicine(null);
        }}
      >
        Create Medicine
      </Button>

      <Table dataSource={medicines} columns={columns} loading={loading} rowKey="id" />

      {/* Modal for Creating/Editing Medicine */}
      <Modal
        title={editingMedicine ? "Edit Medicine" : "Create Medicine"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingMedicine(null);
        }}
        onOk={() => form.submit()} // Ensure form submits properly
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          autoComplete="off"
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter medicine name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter price' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true, message: 'Please enter quantity' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="manufacturer" label="Manufacturer" rules={[{ required: true, message: 'Please enter manufacturer' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicineTable;
