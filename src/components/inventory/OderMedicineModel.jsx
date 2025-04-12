import React, { useState, useEffect } from "react";
import { Modal, Form, Select, InputNumber, Button, message, Table } from "antd";
import axios from "axios";
import appConfig from "../../ApiConfig";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const OrderMedicineModal = ({ isOpen, onClose, onSubmit, existingOrder = null }) => {
  const [vendors, setVendors] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);

  const [form] = Form.useForm();

  // Load vendors when the modal is opened
  useEffect(() => {
    if (isOpen) {
      axios.get(`${appConfig.pharmacyBaseURL}/api/vendors`).then((res) => {
        setVendors(res.data);
      });
    }
  }, [isOpen]);

  // Fetch medicines based on selected vendor
  useEffect(() => {
    if (selectedVendor) {
      axios.get(`${appConfig.pharmacyBaseURL}/api/vendors/${selectedVendor}/medicines`).then((res) => {
        setMedicines(res.data);
      });
    }
  }, [selectedVendor]);

  // Populate fields when existingOrder is passed
  useEffect(() => {
    if (existingOrder && isOpen) {
      setSelectedVendor(existingOrder.vendor_id);
      setOrderItems(existingOrder.medicines.map((medicine) => ({
        medicine_id: medicine.id,
        quantity: medicine.quantity,
      })));
    }
  }, [existingOrder, isOpen]);

  const resetModal = () => {
    setSelectedVendor(null);
    setSelectedMedicine(null);
    setQuantity(1);
    setOrderItems([]);
    setMedicines([]);
    form.resetFields();
  };

  const handleVendorChange = (vendorId) => {
    setSelectedVendor(vendorId);
    setSelectedMedicine(null); // Reset medicine when vendor changes
    setOrderItems([]); // Clear order items
  };

  const handleAddMedicine = () => {
    if (!selectedMedicine || quantity <= 0) {
      message.error("Please select a medicine and specify a valid quantity.");
      return;
    }
    const newItem = { medicine_id: selectedMedicine, quantity };
    setOrderItems((prevItems) => [...prevItems, newItem]);
    setSelectedMedicine(null);
    setQuantity(1);
  };

  const handleEditQuantity = (key, newQuantity) => {
    const updatedItems = [...orderItems];
    updatedItems[key].quantity = newQuantity;
    setOrderItems(updatedItems);
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      message.error("Please add at least one medicine.");
      return;
    }
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];  // Formats date to 'YYYY-MM-DD'
  
    const orderPayload = {
      vendor_id: selectedVendor,
      medicines: orderItems,
      status: "in_progress",
      order_date: formattedDate

    };

    onSubmit(orderPayload);
    resetModal(); // Reset modal state after submit
    onClose();
  };

  const medicineColumns = [
    { title: "Medicine Name", dataIndex: "name", key: "name" },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record, index) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleEditQuantity(index, value)}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={existingOrder ? "Edit Order" : "Order Medicines"}
      visible={isOpen}
      onCancel={() => {
        resetModal(); // Reset on cancel
        onClose();
      }}
      onOk={handleSubmitOrder}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="vendor" label="Vendor" rules={[{ required: true }]}>
          <Select
            placeholder="Select Vendor"
            onChange={handleVendorChange}
            value={selectedVendor}
            disabled={existingOrder} // Disable when editing
          >
            {vendors.map((vendor) => (
              <Option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedVendor && (
          <>
            <Form.Item name="medicine" label="Select Medicine" rules={[{ required: true }]}>
              <Select
                placeholder="Select Medicine"
                value={selectedMedicine}
                onChange={(value) => setSelectedMedicine(value)}
                disabled={existingOrder} // Disable when editing
              >
                {medicines.map((medicine) => (
                  <Option key={medicine.id} value={medicine.id}>
                    {medicine.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedMedicine && (
              <>
                <Form.Item name="quantity" label="Quantity" rules={[{ required: true, type: 'number' }]}>
                  <InputNumber
                    min={1}
                    value={quantity}
                    onChange={(value) => setQuantity(value)}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddMedicine}
                  block
                >
                  Add Medicine
                </Button>
              </>
            )}
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <h4>Selected Medicines</h4>
          <Table
            columns={medicineColumns}
            dataSource={orderItems.map((item, index) => ({
              ...item,
              key: index,
              name: medicines.find((m) => m.id === item.medicine_id)?.name,
            }))}
            pagination={false}
            rowKey="key"
          />
        </div>
      </Form>
    </Modal>
  );
};

export default OrderMedicineModal;
