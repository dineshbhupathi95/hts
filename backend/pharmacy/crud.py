import uuid
from sqlalchemy.orm import Session
# from elasticsearch import Elasticsearch
from models import *
from schemas import *
from datetime import datetime

# Elasticsearch Setup
# es = Elasticsearch("http://localhost:9200")  # Ensure Elasticsearch is running

# Create Medicine (Save to SQLite3 & Elasticsearch)
def create_medicine(db: Session, medicine: MedicineCreate) -> MedicineResponse:
    medicine_id = str(uuid.uuid4())

    # Save in SQLite3
    db_medicine = MedicineDB(id=medicine_id, **medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)

    # Save in Elasticsearch
    # es.index(index="medicines", id=medicine_id, document=medicine.dict())

    return MedicineResponse(id=medicine_id, **medicine.dict())

# Fetch Medicines from Elasticsearch
def get_medicines(db:Session):
    es_query = {"query": {"match_all": {}}}
    # results = es.search(index="medicines", body=es_query)
    results = db.query(MedicineDB).all()
    return results

# Update Medicine (SQLite3 & Elasticsearch)
def update_medicine(db: Session, medicine_id: str, medicine: MedicineUpdate):
    print(medicine.dict())
    db_medicine = db.query(MedicineDB).filter(MedicineDB.id == medicine_id).first()
    if not db_medicine:
        return None

    # Update fields in SQLite3
    for key, value in medicine.dict(exclude_unset=True).items():
        setattr(db_medicine, key, value)

    db.commit()
    db.refresh(db_medicine)

    # Update in Elasticsearch
    # es.update(index="medicines", id=medicine_id, body={"doc": medicine.dict(exclude_unset=True)})

    # ✅ Return a valid Pydantic Response
    return MedicineResponse(
        id=db_medicine.id,
        name=db_medicine.name,
        manufacturer=db_medicine.manufacturer,
        price=db_medicine.price,
        quantity=db_medicine.quantity
    )


# Delete Medicine (SQLite3 & Elasticsearch)
def delete_medicine(db: Session, medicine_id: str):
    db_medicine = db.query(MedicineDB).filter(MedicineDB.id == medicine_id).first()
    if not db_medicine:
        return False

    # Delete from SQLite3
    db.delete(db_medicine)
    db.commit()

    # Delete from Elasticsearch
    # es.delete(index="medicines", id=medicine_id, ignore=[404])  # Ignore 404 errors if document not found

    return True

#create sale record
def create_sale(db: Session, sale: SaleCreate):
    total_price = 0
    sale_id = str(uuid.uuid4())  # Create a sale ID once

    for item in sale.cart:
        # Fetch from the database
        medicine = db.query(MedicineDB).filter(MedicineDB.id == item.medicine_id).first()
        if not medicine:
            return None
        if medicine.quantity < item.quantity:
            return "Insufficient stock"

        # Deduct stock and calculate total price
        medicine.quantity -= item.quantity
        item_total_price = float(medicine.price * item.quantity)
        total_price += item_total_price

        # # Update Elasticsearch Medicine Index
        # es.update(
        #     index="medicines",
        #     id=str(item.medicine_id),
        #     body={
        #         "doc": {
        #             "quantity": medicine.quantity
        #         }
        #     }
        # )
        # print(f"✅ Updated Medicine Index: Medicine ID {item.medicine_id}, New Quantity: {medicine.quantity}")

        # Create Sale Record
        sale_record = Sale(
            id=str(sale_id),
            medicine_id=str(item.medicine_id),
            quantity=int(item.quantity),
            total_price=float(item_total_price),
            sale_date=datetime.utcnow(),
        )
        db.add(sale_record)

        # # Store Sale Record in Elasticsearch Sales Index
        # es.index(
        #     index="sales",
        #     id=str(sale_id),
        #     body={
        #         "id": str(sale_id),
        #         "medicine_id": str(item.medicine_id),
        #         "quantity": int(item.quantity),
        #         "total_price": float(item_total_price),
        #         "sale_date": sale_record.sale_date.isoformat()
        #     }
        # )
        # print(f"✅ Sale Record Created in Elasticsearch: Sale ID {sale_id}")

    db.commit()

    return SaleResponse(id=sale_id, total_price=total_price, cart=sale.cart)


# Get All Sales
def get_sales(db: Session):
    return db.query(Sale).all()
