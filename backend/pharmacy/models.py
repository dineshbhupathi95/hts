from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func,Table
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

class MedicineDB(Base):
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    manufacturer = Column(String)
    price = Column(Float)
    quantity = Column(Integer)


# Sale Model

class Sale(Base):
    __tablename__ = 'sales'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    medicine_id = Column(String, ForeignKey('medicines.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    sale_date = Column(DateTime, default=datetime.utcnow)

    medicine = relationship("MedicineDB")

#inventory models
class Vendor(Base):
    __tablename__ = 'vendors'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    contact = Column(String)
    address = Column(String)

    # One-to-many relationship
    medicines = relationship("VendorMedicine", back_populates="vendor", cascade="all, delete-orphan")

class VendorMedicine(Base):
    __tablename__ = 'vendor_medicine'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    vendor_id = Column(Integer, ForeignKey('vendors.id'))

    vendor = relationship("Vendor", back_populates="medicines")
    medicine_orders = relationship("OrderMedicineAssociation", back_populates="medicine")

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey('vendors.id'))
    order_date = Column(DateTime)
    status = Column(String, default="in_progress")

    vendor = relationship("Vendor", back_populates="orders")

    # Relationship to association table
    order_medicines = relationship("OrderMedicineAssociation", back_populates="order", cascade="all, delete-orphan")


class OrderMedicineAssociation(Base):
    __tablename__ = 'order_medicine_association'

    order_id = Column(Integer, ForeignKey('orders.id'), primary_key=True)
    medicine_id = Column(Integer, ForeignKey('vendor_medicine.id'), primary_key=True)
    quantity = Column(Integer, nullable=False)

    # Relationships to Order and Medicine
    order = relationship("Order", back_populates="order_medicines")
    medicine = relationship("VendorMedicine", back_populates="medicine_orders")


# Modify the Vendor model to include the orders relationship
Vendor.orders = relationship("Order", back_populates="vendor", cascade="all, delete-orphan")
