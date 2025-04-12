from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL (Switch SQLite3 → MySQL by changing this)
DATABASE_URL = "sqlite:///./pharmacy_datav1.db"
# DATABASE_URL = "mysql+pymysql://user:password@localhost/pharmacy"

# Create Engine & Session
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base Model
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
