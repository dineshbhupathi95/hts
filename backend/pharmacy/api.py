from fastapi import FastAPI, Depends, HTTPException,Path
from sqlalchemy.orm import Session
from database import *
from schemas import *
from crud import *
from models import *
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import joinedload

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# API Endpoint: Create Medicine
@app.post("/medicines/", response_model=MedicineResponse)
def api_create_medicine(medicine: MedicineCreate, db: Session = Depends(get_db)):
    return create_medicine(db, medicine)

# API Endpoint: Fetch Medicines (from Elasticsearch)
@app.get("/medicines/", response_model=list[MedicineResponse])
def api_get_medicines(db: Session = Depends(get_db)):
    return get_medicines(db)

# API Endpoint: Update Medicine
@app.put("/medicines/{medicine_id}", response_model=MedicineResponse)
def api_update_medicine(
    medicine: MedicineUpdate,
    medicine_id: str = Path(..., title="Medicine ID"),
    db: Session = Depends(get_db)
):
    updated_medicine = update_medicine(db, medicine_id, medicine)
    if not updated_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return updated_medicine

# API Endpoint: Delete Medicine
@app.delete("/medicines/{medicine_id}", response_model=dict)
def api_delete_medicine(medicine_id: str = Path(..., title="Medicine ID"), db: Session = Depends(get_db)):
    success = delete_medicine(db, medicine_id)
    if not success:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"message": "Medicine deleted successfully"}


# API: Sale Medicine (Update Stock and Save Sale Data)
@app.post("/sales/", response_model=SaleResponse)
def api_create_sale(sale: SaleCreate, db: Session = Depends(get_db)):
    result = create_sale(db, sale)
    if result == "Insufficient stock":
        raise HTTPException(status_code=400, detail="Insufficient stock")
    if result is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return result

# API: Fetch All Sales
@app.get("/sales/", response_model=list[SaleResponse])
def api_get_sales(db: Session = Depends(get_db)):
    return get_sales(db)


# Inventory apis


@app.get("/api/vendors", response_model=List[VendorOut])
def get_vendors(db: Session = Depends(get_db)):
    return db.query(Vendor).all()

@app.get("/api/vendors/{vendor_id}/medicines")
def get_medicines_for_vendor(vendor_id: int, db: Session = Depends(get_db)):
    medicines = db.query(VendorMedicine).filter_by(vendor_id=vendor_id).all()
    return [{"id": med.id, "name": med.name} for med in medicines]

@app.post("/api/vendors/")
def create_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):
    db_vendor = Vendor(
        name=vendor.name,
        contact=vendor.contact,
        address=vendor.address
    )

    for med_name in vendor.medicines:
        med = VendorMedicine(name=med_name, vendor=db_vendor)
        db.add(med)

    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    return {"vendor_id": db_vendor.id, "message": "Vendor created with medicines"}


@app.post("/api/orders/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    new_order = Order(
        vendor_id=order.vendor_id,
        order_date=order.order_date,
        status=order.status,
    )

    # Add medicines with quantity
    for med in order.medicines:
        assoc = OrderMedicineAssociation(
            medicine_id=med.medicine_id,
            quantity=med.quantity,
        )
        new_order.order_medicines.append(assoc)

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    vendor_name = db.query(Vendor).filter(Vendor.id == new_order.vendor_id).first()
    return {
        "id": new_order.id,
        "vendor_id": new_order.vendor_id,
        "vendor_name":vendor_name.name,
        "order_date": new_order.order_date,
        "status": new_order.status,
        "medicines": [
            {
                "id": assoc.medicine.id,
                "name": assoc.medicine.name,
                "quantity": assoc.quantity
            }
            for assoc in new_order.order_medicines
        ]
    }

@app.get("/api/orders/", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    # Query the orders, including the vendor data through a join
    orders = db.query(Order).options(joinedload(Order.vendor)).all()

    # Construct the response by including vendor name
    return [
        {
            "id": order.id,
            "vendor_id": order.vendor_id,
            "vendor_name": order.vendor.name,  # Access vendor name from the joined data
            "order_date": order.order_date,
            "status": order.status,
            "medicines": [
                {
                    "id": assoc.medicine.id,
                    "name": assoc.medicine.name,
                    "quantity": assoc.quantity
                }
                for assoc in order.order_medicines
            ]
        }
        for order in orders
    ]

@app.put("/api/orders/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order_data: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order_data.order_date:
        order.order_date = order_data.order_date
    if order_data.status:
        order.status = order_data.status

    if order_data.medicines:
        # Clear old
        db.query(OrderMedicineAssociation).filter_by(order_id=order.id).delete()
        for med in order_data.medicines:
            assoc = OrderMedicineAssociation(
                order_id=order.id,
                medicine_id=med.medicine_id,
                quantity=med.quantity
            )
            db.add(assoc)

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "vendor_id": order.vendor_id,
        "order_date": order.order_date,
        "status": order.status,
        "medicines": [
            {
                "id": assoc.medicine.id,
                "name": assoc.medicine.name,
                "quantity": assoc.quantity
            }
            for assoc in order.order_medicines
        ]
    }


@app.delete("/api/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}
