from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from typing import List

# Medicine Schema for Creating
class MedicineCreate(BaseModel):
    name:Optional[str] = None
    manufacturer: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None

# Medicine Schema for Response
class MedicineResponse(MedicineCreate):
    id: str

# Medicine Schema for Updating (partial update)
class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None



# Sale Schemas
class SaleItem(BaseModel):
    medicine_id: str
    quantity: int


class SaleCreate(BaseModel):
    cart: List[SaleItem]

class SaleResponse(BaseModel):
    id: Optional[str] = None  # Change from int to str
    medicine_id: Optional[str] = None
    quantity: Optional[int] = None
    total_price: Optional[float] = None
    sale_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# Invenory schemas
class MedicineBase(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class VendorMedicineCreate(BaseModel):
    name: str

class VendorCreate(BaseModel):
    name: str
    contact: str
    address: str
    medicines: List[str]
class VendorOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class MedicineOrderItem(BaseModel):
    medicine_id: int
    quantity: int


class OrderCreate(BaseModel):
    vendor_id: int
    order_date: datetime
    status: str = "in_progress"
    medicines: List[MedicineOrderItem]

    class Config:
        orm_mode = True


class OrderUpdate(BaseModel):
    order_date: Optional[datetime]
    status: Optional[str]
    medicines: Optional[List[MedicineOrderItem]]  # Optional if only status/date update


class MedicineOrderResponse(BaseModel):
    id: int
    name: str
    quantity: int

    class Config:
        orm_mode = True


class OrderResponse(BaseModel):
    id: int
    vendor_id: int
    vendor_name: str  # Add vendor_name here
    order_date: datetime
    status: str
    medicines: List[MedicineOrderResponse]

    class Config:
        orm_mode = True
