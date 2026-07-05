import mysql.connector
from mysql.connector import Error
import os

def get_db_connection():
    """
    Creates and returns a new MySQL connection using environment variables.
    Falls back to localhost defaults for local development.
    """
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "easylearn"),
            autocommit=True
        )
        return conn
    except Error as e:
        print("❌ Database connection failed:", e)
        return None
