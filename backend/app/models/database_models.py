import sqlalchemy
from ..core.database import metadata

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
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False, index=True),
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
    sqlalchemy.Column("date", sqlalchemy.Date, index=True),
    sqlalchemy.Column("control_date", sqlalchemy.Date, index=True),
    sqlalchemy.Column("category", sqlalchemy.String, index=True),
    sqlalchemy.Column("account", sqlalchemy.String, index=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False, index=True),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
    # Composite indexes for common query patterns
    sqlalchemy.Index("idx_transactions_user_control_date", "user_id", "control_date"),
    sqlalchemy.Index("idx_transactions_user_date", "user_id", "date"),
)

# Credits table
credits_table = sqlalchemy.Table(
    "credits",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("monthly_value", sqlalchemy.Float, nullable=False),
    sqlalchemy.Column("payment_day", sqlalchemy.Integer, nullable=False),  # Day of month
    sqlalchemy.Column("total_amount", sqlalchemy.Float, nullable=True),
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False, index=True),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
)

# Credit payments table
credit_payments_table = sqlalchemy.Table(
    "credit_payments",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("credit_id", sqlalchemy.Integer, nullable=False, index=True),
    sqlalchemy.Column("value", sqlalchemy.Float, nullable=False),
    sqlalchemy.Column("date", sqlalchemy.Date, nullable=False, index=True),
    sqlalchemy.Column("type", sqlalchemy.String, nullable=False),  # scheduled, off_schedule
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
)

# Budget preferences table
budget_preferences_table = sqlalchemy.Table(
    "budget_preferences",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("percentage", sqlalchemy.Float, nullable=False),  # Percentage allocation (0-100)
    sqlalchemy.Column("user_id", sqlalchemy.Integer, nullable=False, index=True),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    sqlalchemy.Column("update_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("update_date", sqlalchemy.DateTime, nullable=False),
)

# Budget preference categories table (many-to-many relationship)
budget_preference_categories_table = sqlalchemy.Table(
    "budget_preference_categories",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("budget_preference_id", sqlalchemy.Integer, nullable=False, index=True),
    sqlalchemy.Column("category", sqlalchemy.String, nullable=False, index=True),
    sqlalchemy.Column("create_by", sqlalchemy.Integer, nullable=False),
    sqlalchemy.Column("create_date", sqlalchemy.DateTime, nullable=False),
    # Unique constraint to prevent duplicate category assignments for the same budget preference
    sqlalchemy.UniqueConstraint("budget_preference_id", "category", name="uq_budget_preference_category"),
)
