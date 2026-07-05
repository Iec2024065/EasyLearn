# import mysql.connector
# from mysql.connector import Error

# db_connection = None

# def init_db_connection():
#     global db_connection
#     try:
#         db_connection = mysql.connector.connect(
#             host="localhost",
#             user="root",
#             password="abhishek@0123",
#             database="easylearn",
#             autocommit=True
#         )
#         if db_connection.is_connected():
#             print("Global database connection established.")
#     except Error as e:
#         print("Error connecting to MySQL:", e)
#         db_connection = None

# init_db_connection()

# def get_db_connection():
#     global db_connection
#     if db_connection is not None:
#         try:
#             # Attempt to check connection status, which might raise InternalError
#             if not db_connection.is_connected():
#                 db_connection = None # Connection is truly dead
#         except Error as e:
#             if "Unread result found" in str(e):
#                 print("Warning: Unread result found on global connection. Closing and re-initializing.")
#                 db_connection.close()
#                 db_connection = None
#             else:
#                 print("Error checking connection status:", e)
#                 db_connection = None

#     if db_connection is None:
#         init_db_connection()
#     return db_connection

# app/utils.py
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """
    Creates and returns a new MySQL connection for each request.
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="abhishek@0123",       # your MySQL password if any
            database="easylearn",
            autocommit=True
        )
        return conn
    except Error as e:
        print("❌ Database connection failed:", e)
        return None
