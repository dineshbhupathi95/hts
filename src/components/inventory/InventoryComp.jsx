import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  message,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"; // Import the icons
import axios from "axios";
import dayjs from "dayjs";
import appConfig from "../../ApiConfig";
import OrderMedicineModal from "./OderMedicineModel";
const { Option } = Select;

const InventoryComp = () => {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [vendorMedicines, setVendorMedicines] = useState([]); // Added this line
  const [orderForm] = Form.useForm();
  const [vendorForm] = Form.useForm();

  useEffect(() => {
    axios.get(`${appConfig.pharmacyBaseURL}/api/vendors/`).then((res) => setVendors(res.data));
    axios.get(`${appConfig.pharmacyBaseURL}/medicines/`).then((res) => setMedicines(res.data));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get(`${appConfig.pharmacyBaseURL}/api/orders/`);
    setOrders(res.data);
  };

  const handleVendorChange = (vendorId) => {
    axios.get(`${appConfig.pharmacyBaseURL}/api/vendors/${vendorId}/medicines`).then((res) => {
      setVendorMedicines(res.data); // Now properly set vendorMedicines
      orderForm.setFieldsValue({ medicine: undefined });
    });
  };

  const handleOrderSubmit = async (values) => {
    try {
      await axios.post(`${appConfig.pharmacyBaseURL}/api/orders/`, values);
      message.success("Order submitted successfully!");
      orderForm.resetFields();
      setIsOrderModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Order Error:", error);
      message.error("Failed to submit order.");
    }
  };

  const handleEditOrder = (order) => {
    setCurrentOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrder = async (values) => {
    try {
      const payload = {
        vendor_id: values.vendor,
        order_date: values.date.format("YYYY-MM-DD"),
        medicines: values.medicine.map((id) => ({
          medicine_id: id,
          quantity: values.quantity,
        })),
      };
      await axios.put(`${appConfig.pharmacyBaseURL}/api/orders/${currentOrder.id}`, payload);
      message.success("Order updated!");
      fetchOrders();
      setIsOrderModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Update failed.");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(`${appConfig.pharmacyBaseURL}/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      message.success("Order status updated");
      fetchOrders();
    } catch (err) {
      message.error("Status update failed");
    }
  };

  const handleVendorSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        contact: values.contact,
        address: values.address,
        medicines: values.medicines || [],
      };
      const response = await axios.post(`${appConfig.pharmacyBaseURL}/api/vendors/`, payload);
      message.success("Vendor added successfully!");
      vendorForm.resetFields();
      setIsVendorModalOpen(false);
      setVendors((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding vendor:", error);
      message.error("Failed to add vendor.");
    }
  };

  const columns = [
    { title: "Vendor", dataIndex: "vendor_name", key: "vendor" },
    {
      title: "Date",
      dataIndex: "order_date",
      key: "date",
      render: (text) => dayjs(text).format("YYYY-MM-DD"),
    },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          {(record.status === "in_progress" || record.status === "transit") && (
            <Button type="link" onClick={() => handleEditOrder(record)}>
              Edit
            </Button>
          )}
          <Select
            defaultValue={record.status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 120 }}
          >
            <Option value="in_progress">In Progress</Option>
            <Option value="transit">Transit</Option>
            <Option value="completed">Completed</Option>
            <Option value="received">Received</Option>
          </Select>
        </div>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const medicineColumns = [
      { title: "Medicine Name", dataIndex: "name", key: "name" },
      { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    ];

    return (
      <Table
        columns={medicineColumns}
        dataSource={record.medicines}
        rowKey={(row) => row.name}
        pagination={false}
      />
    );
  };

  const handleOrderModelClose = () => {
    setIsOrderModalOpen(false);
    setCurrentOrder(null); // Clear current order after modal close
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order History</h2>
        <div className="space-x-2" style={{float:"right"}}>
            <Space size="middle">
          <Button type="primary" onClick={() => setIsOrderModalOpen(true)}>
            <PlusOutlined /> Order Medicine
          </Button>
          <OrderMedicineModal
            isOpen={isOrderModalOpen}
            onClose={handleOrderModelClose}
            onSubmit={handleOrderSubmit}
            existingOrder={currentOrder} // Pass the current order for editing
          />
          <Button onClick={() => setIsVendorModalOpen(true)}>
            <PlusOutlined /> Add Vendor
          </Button>
          </Space>
        </div>
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        expandable={{ expandedRowRender }}
      />

      {/* Add Vendor Modal */}
      <Modal
        title="Add New Vendor"
        open={isVendorModalOpen}
        onCancel={() => setIsVendorModalOpen(false)}
        onOk={() => vendorForm.submit()}
      >
        <Form form={vendorForm} layout="vertical" onFinish={handleVendorSubmit}>
          <Form.Item name="name" label="Vendor Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="Contact Number" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="medicines" label="Medicines Supplied" rules={[{ required: true }]}>
            <Select mode="multiple" placeholder="Select Medicines">
              {medicines.map((m) => (
                <Option key={m.id} value={m.name}>
                  {m.name} - {m.manufacturer}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryComp;
