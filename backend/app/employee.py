# app/auth_routes.py
import hashlib
from flask import Blueprint, request, jsonify, session
from mysql.connector import Error
from app.utils import get_db_connection   # adjust path if different

auth_bp = Blueprint("auth_bp", __name__)

def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

# @auth_bp.route("/employee/login", methods=["POST"])
# def employee_login():
#     """
#     POST /employee/login
#     JSON body: { "email": "...", "password": "..." }
#     On success: stores session['employee_id'] = id
#     """
#     payload = request.get_json() or {}
#     email = payload.get("email")
#     password = payload.get("password")

#     if not email or not password:
#         return jsonify({"error": "email and password required"}), 400
#     print(email, password)
#     conn = get_db_connection()
#     try:
#         cur = conn.cursor(dictionary=True)
#         try:
#             cur.execute("SELECT id, password, name, role FROM employees WHERE email = %s", (email,))
#             row = cur.fetchone()
#             cur.close()
#         except Exception as e:
#             cur.close()
#             return jsonify({"error": "db query failed", "details": str(e)}), 500

#         if not row:
#             return jsonify({"error": "invalid credentials"}), 401

#         db_pw = row.get("password") or ""
#         # Accept either plaintext match or SHA-256 hex match
#         if db_pw == password or db_pw == _sha256_hex(password):
#             # success -> set session
#             session["employee_id"] = int(row["id"])
#             # optional: store some metadata
#             session["employee_name"] = row.get("name")
#             session["employee_role"] = row.get("role")
#             return jsonify({
#                 "message": "login successful",
#                 "employee_id": row["id"],
#                 "name": row.get("name"),
#                 "role": row.get("role")
#             }), 200
#         else:
#             return jsonify({"error": "invalid credentials"}), 401

#     except Error as e:
#         return jsonify({"error": "db connection error", "details": str(e)}), 500


# @auth_bp.route("/employee/logout", methods=["POST"])
# def employee_logout():
#     """
#     POST /employee/logout
#     Removes employee id from session.
#     """
#     session.pop("employee_id", None)
#     session.pop("employee_name", None)
#     session.pop("employee_role", None)
#     return jsonify({"message": "logged out"}), 200


# @auth_bp.route("/employee/me", methods=["GET"])
# def employee_me():
#     """
#     GET /employee/me
#     Returns current employee info from session (and DB) if logged in.
#     """
#     emp_id = session.get("employee_id")
#     if not emp_id:
#         return jsonify({"employee": None}), 200

#     conn = get_db_connection()
#     try:
#         cur = conn.cursor(dictionary=True)
#         try:
#             cur.execute("SELECT id, email, name, role, phone, created_at FROM employees WHERE id = %s", (emp_id,))
#             row = cur.fetchone()
#             cur.close()
#         except Exception as e:
#             cur.close()
#             return jsonify({"error": "db query failed", "details": str(e)}), 500

#         if not row:
#             # session may be stale; clear it
#             session.pop("employee_id", None)
#             session.pop("employee_name", None)
#             session.pop("employee_role", None)
#             return jsonify({"employee": None}), 200

#         # convert datetime to str if needed (Flask jsonify handles it, but being explicit is fine)
#         row["created_at"] = str(row["created_at"]) if row.get("created_at") else None
#         return jsonify({"employee": row}), 200

#     except Error as e:
#         return jsonify({"error": "db connection error", "details": str(e)}), 500
    

@auth_bp.route("/employee/register", methods=["POST"])
def employee_register():
    """
    POST /employee/register
    JSON body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "mypassword",
        "phone": "1234567890",
        "role": "staff"   # optional, default = "employee"
    }
    """
    payload = request.get_json() or {}
    name = payload.get("name")
    email = payload.get("email")
    password = payload.get("password")
    phone = payload.get("phone")
    role = payload.get("role", "employee")

    # Basic validation
    if not name or not email or not password:
        return jsonify({"error": "name, email, and password required"}), 400

    # Hash password before saving
    pw_hash = _sha256_hex(password)

    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)

        # Check if email already exists
        cur.execute("SELECT id FROM employees WHERE email = %s", (email,))
        existing = cur.fetchone()
        if existing:
            cur.close()
            return jsonify({"error": "email already registered"}), 400

        # Insert new employee
        cur.execute(
            """
            INSERT INTO employees (name, email, password, phone, role, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            """,
            (name, email, pw_hash, phone, role),
        )
        conn.commit()

        new_id = cur.lastrowid
        cur.close()

        # Auto-login after registration (optional)
        session["employee_id"] = new_id
        session["employee_name"] = name
        session["employee_role"] = role

        return jsonify({
            "message": "registration successful",
            "employee_id": new_id,
            "name": name,
            "email": email,
            "role": role,
        }), 201

    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500


# @auth_bp.route("/employee/dashboard/counts", methods=["GET"])
# def get_dashboard_counts():
#     """
#     GET /employee/dashboard/counts
#     Returns the total number of courses and volunteers.
#     """
#     conn = get_db_connection()
#     try:
#         cur = conn.cursor(dictionary=True, buffered=True)
        
#         # Get total courses
#         cur.execute("SELECT COUNT(*) as total_courses FROM courses")
#         total_courses = cur.fetchone()['total_courses']
        
#         # Get total volunteers
#         cur.execute("SELECT COUNT(*) as total_volunteers FROM volunteers")
#         total_volunteers = cur.fetchone()['total_volunteers']

#         # Get total users
#         cur.execute("SELECT COUNT(*) as total_users FROM users")
#         total_users = cur.fetchone()['total_users']
        
#         cur.close()
        
#         return jsonify({
#             "total_courses": total_courses,
#             "total_volunteers": total_volunteers,
#             "total_users": total_users
#         }), 200
        
#     except Error as e:
#         return jsonify({"error": "db connection error", "details": str(e)}), 500

@auth_bp.route("/employee/volunteers/pending", methods=["GET"])
def get_pending_volunteers():
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True, buffered=True)
        cur.execute("SELECT id, name, email FROM volunteers WHERE is_approved = FALSE")
        pending_volunteers = cur.fetchall()
        cur.close()
        return jsonify(pending_volunteers), 200
    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@auth_bp.route("/employee/volunteers/approve", methods=["POST"])
def approve_volunteer():
    payload = request.get_json() or {}
    volunteer_id = payload.get("volunteer_id")
    action = payload.get("action")

    if not volunteer_id or not action:
        return jsonify({"error": "volunteer_id and action required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        if action == "approve":
            cur.execute("UPDATE volunteers SET is_approved = TRUE WHERE id = %s", (volunteer_id,))
            conn.commit()
            cur.close()
            return jsonify({"message": "volunteer approved"}), 200
        elif action == "reject":
            cur.execute("DELETE FROM volunteers WHERE id = %s", (volunteer_id,))
            conn.commit()
            cur.close()
            return jsonify({"message": "volunteer rejected"}), 200
        else:
            return jsonify({"error": "invalid action"}), 400
    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@auth_bp.route("/employee/content/pending", methods=["GET"])
def get_pending_content():
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True, buffered=True)
        cur.execute("SELECT id, title, 'course' as type FROM courses WHERE is_approved = FALSE")
        pending_courses = cur.fetchall()
        cur.execute("SELECT id, title, 'blog' as type FROM blogs WHERE is_approved = FALSE")
        pending_blogs = cur.fetchall()
        cur.close()
        return jsonify(pending_courses + pending_blogs), 200
    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@auth_bp.route("/employee/content/approve", methods=["POST"])
def approve_content():
    payload = request.get_json() or {}
    content_id = payload.get("content_id")
    content_type = payload.get("content_type")
    action = payload.get("action")

    if not content_id or not content_type or not action:
        return jsonify({"error": "content_id, content_type and action required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        table_name = ""
        if content_type == "course":
            table_name = "courses"
        elif content_type == "blog":
            table_name = "blogs"
        else:
            return jsonify({"error": "invalid content_type"}), 400

        if action == "approve":
            cur.execute(f"UPDATE {table_name} SET is_approved = TRUE WHERE id = %s", (content_id,))
            conn.commit()
            cur.close()
            return jsonify({"message": f"{content_type} approved"}), 200
        elif action == "reject":
            cur.execute(f"DELETE FROM {table_name} WHERE id = %s", (content_id,))
            conn.commit()
            cur.close()
            return jsonify({"message": f"{content_type} rejected"}), 200
        else:
            return jsonify({"error": "invalid action"}), 400
    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500


# app/employee.py
# import hashlib
# from flask import Blueprint, request, jsonify, session
# from mysql.connector import Error
# from app.utils import get_db_connection

# auth_bp = Blueprint("auth_bp", __name__)

# def _sha256_hex(s: str) -> str:
#     return hashlib.sha256(s.encode("utf-8")).hexdigest()


# 🟢 Employee Login
@auth_bp.route("/employee/login", methods=["POST"])
def employee_login():
    payload = request.get_json() or {}
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, password, name, role FROM employees WHERE email = %s", (email,))
        row = cur.fetchone()
        cur.close()

        if not row:
            return jsonify({"error": "invalid credentials"}), 401

        db_pw = row["password"]
        if db_pw == password or db_pw == _sha256_hex(password):
            session["employee_id"] = int(row["id"])
            session["employee_name"] = row.get("name")
            session["employee_role"] = row.get("role")

            return jsonify({
                "message": "login successful",
                "employee_id": row["id"],
                "name": row["name"],
                "role": row["role"]
            }), 200
        else:
            return jsonify({"error": "invalid credentials"}), 401

    except Error as e:
        return jsonify({"error": "db query failed", "details": str(e)}), 500
    finally:
        if conn.is_connected():
            conn.close()


# 🟢 Logout
@auth_bp.route("/employee/logout", methods=["POST"])
def employee_logout():
    session.clear()
    return jsonify({"message": "logged out"}), 200


# 🟢 Current Session Info
@auth_bp.route("/employee/me", methods=["GET"])
def employee_me():
    emp_id = session.get("employee_id")
    if not emp_id:
        return jsonify({"employee": None}), 200

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, email, name, role, phone, created_at FROM employees WHERE id = %s", (emp_id,))
        row = cur.fetchone()
        cur.close()

        if not row:
            session.clear()
            return jsonify({"employee": None}), 200

        row["created_at"] = str(row["created_at"]) if row.get("created_at") else None
        return jsonify({"employee": row}), 200

    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500
    finally:
        if conn.is_connected():
            conn.close()


# 🟢 Dashboard Counts
@auth_bp.route("/employee/dashboard/counts", methods=["GET"])
def get_dashboard_counts():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor(dictionary=True, buffered=True)
        cur.execute("SELECT COUNT(*) AS total_courses FROM courses")
        total_courses = cur.fetchone()["total_courses"]

        cur.execute("SELECT COUNT(*) AS total_volunteers FROM volunteers")
        total_volunteers = cur.fetchone()["total_volunteers"]

        cur.execute("SELECT COUNT(*) AS total_users FROM users")
        total_users = cur.fetchone()["total_users"]

        cur.close()
        return jsonify({
            "total_courses": total_courses,
            "total_volunteers": total_volunteers,
            "total_users": total_users
        }), 200
    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500
    finally:
        if conn.is_connected():
            conn.close()


@auth_bp.route("/employee/course/<int:course_id>", methods=["GET"])
def get_course_by_id(course_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM courses WHERE id = %s", (course_id,))
        course = cur.fetchone()
        cur.close()
        
        if not course:
            return jsonify({"error": "Course not found"}), 404

        return jsonify(course), 200

    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500
    finally:
        if conn.is_connected():
            conn.close()


@auth_bp.route("/employee/blog/<int:id>", methods=["GET"])
def get_blog(id):
    """Fetch a single blog by ID"""
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT 
                b.id, b.title, b.content, b.image_url, b.image_alt, 
                b.created_at, v.name AS author_name
            FROM blogs b
            LEFT JOIN volunteers v ON b.author_id = v.id
            WHERE b.id = %s
        """, (id,))
        blog = cur.fetchone()
        if not blog:
            return jsonify({"error": "Blog not found"}), 404

        return jsonify({
            "id": blog["id"],
            "title": blog["title"],
            "content": blog["content"],
            "thumbnail": blog["image_url"],
            "imageAlt": blog["image_alt"],
            "author": blog["author_name"] or "Unknown",
            "createdAt": blog["created_at"].isoformat() if blog["created_at"] else None
        }), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch blog", "details": str(e)}), 500
    finally:
        cur.close()
        conn.close()