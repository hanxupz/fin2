import sqlalchemy
from ..core.database_clean import metadata

# Users table
users_table = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True, index=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
)

# Control dates table
control_dates_table = sqlalchemy.Table(
    "control_dates",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("year", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("month", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("control_date", sqlalchemy.Date, nullable=False),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
)

# Transactions table
transactions_table = sqlalchemy.Table(
    "transactions",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("amount", sqlalchemy.Float),
    sqlalchemy.Column("date", sqlalchemy.Date),
    sqlalchemy.Column("control_date", sqlalchemy.Date),
    sqlalchemy.Column("category", sqlalchemy.String),
    sqlalchemy.Column("account", sqlalchemy.String),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
)
