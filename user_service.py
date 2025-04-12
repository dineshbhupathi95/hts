from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# JWT Configuration
SECRET_KEY = "c860c5e6ed371f1837fe5bfe81b00ec26097caaff201333727a401d92482b665"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Database setup with SQLAlchemy
SQLALCHEMY_DATABASE_URL = "sqlite:///./albeny.db"
# For PostgreSQL, you would use:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    # When using PostgreSQL, remove connect_args above
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Define SQLAlchemy models
class UserModel(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True)
    email = Column(String, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)


# Create tables
Base.metadata.create_all(bind=engine)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPI app
app = FastAPI(title="Albeny")

# Enable CORS (Allow all origins for development; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change this for production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)
# OAuth2 scheme for token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# Pydantic models
class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

    class Config:
        orm_mode = True


class UserInDB(User):
    hashed_password: str


class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db: Session, username: str):
    return db.query(UserModel).filter(UserModel.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user: UserModel = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Endpoints
@app.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = get_user(db, user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password,
        disabled=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: UserModel = Depends(get_current_active_user)):
    return current_user


@app.get("/test/")
async def protected_resource(current_user: UserModel = Depends(get_current_active_user)):
    return {"message": f"Hello, {current_user.username}! This is a protected resource."}


# Get all users (admin endpoint example)
@app.get("/users/", response_model=List[User])
async def read_users(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_active_user)):
    users = db.query(UserModel).all()
    return users


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)