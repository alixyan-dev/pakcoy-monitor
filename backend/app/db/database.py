from sqlalchemy import create_engine, Column, Integer, Float, String, UniqueConstraint
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///data/pakcoy.db")
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class SensorReading(Base):
    __tablename__ = "sensor_reading"
    id = Column(Integer, primary_key=True, index=True)
    day = Column(Integer, nullable=False)
    dap = Column(Integer, nullable=False)
    time = Column(String, nullable=False)
    soil_moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    soil_condition = Column(String, nullable=False)
    maturity_pct = Column(Float, nullable=False)
    stage = Column(String, nullable=False)
    __table_args__ = (UniqueConstraint("day", "time", name="uq_sensor_day_time"),)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
