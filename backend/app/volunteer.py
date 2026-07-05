# app/volunteer_routes.py
from flask import Blueprint, request, jsonify, session
from mysql.connector import Error
from app.utils import get_db_connection
import hashlib
from flask_cors import CORS
def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

volunteer_bp = Blueprint("volunteer_bp", __name__)


@volunteer_bp.route("/register", methods=["POST"])
def register_volunteer():
    """
    Expected JSON body:
    {
      "email": "vol@example.com",
      "password": "plain-or-hashed",
      "name": "Full Name",         <-- optional
      "phone": "9999999999",      <-- optional
      "initial_comment": "..."    <-- optional, saved into approvals comment
    }
    This inserts into volunteers and creates a pending approvals row.
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")
    phone = data.get("phone")
    initial_comment = data.get("initial_comment")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            
            hashed_pw = _sha256_hex(password)
            insert_vol_sql = """
                INSERT INTO volunteers (email, password, name, phone)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(insert_vol_sql, (email, hashed_pw, name, phone))
            volunteer_id = cur.lastrowid

            # Create pending approval row
            insert_app_sql = """
                INSERT INTO approvals (volunteer_id, admin_id, status, comment)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(insert_app_sql, (volunteer_id, None, "pending", initial_comment))

            

            return jsonify({
                "message": "registered (pending approval)",
                "volunteer_id": volunteer_id,
                "approval_id": cur.lastrowid
            }), 201

        except Error as e:
            
            if getattr(e, "errno", None) == 1062:
                return jsonify({"error": "email already exists"}), 409
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500


@volunteer_bp.route("/login", methods=["POST"])
def volunteer_login():
    """
    Expected JSON body:
    {
      "email": "vol@example.com",
      "password": "plain-or-hashed"
    }
    
    Validates credentials and checks if volunteer is approved.
    If successful, stores volunteer_id in session.
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        try:
            # Get volunteer info
            select_sql = """
                SELECT id, email, password, name, is_approved
                FROM volunteers
                WHERE email = %s
            """
            cur.execute(select_sql, (email,))
            volunteer = cur.fetchone()

            if not volunteer:
                return jsonify({"error": "invalid credentials"}), 401

            
            if volunteer["password"] != _sha256_hex(password):
                return jsonify({"error": "invalid credentials"}), 401

            
            if not volunteer["is_approved"]:
                return jsonify({"error": "account not approved yet"}), 403
            
            
            session["volunteer_id"] = volunteer["id"]
            session["volunteer_name"] = volunteer["name"]
            session["volunteer_role"] = "volunteer"

            return jsonify({
                "message": "login successful",
                "volunteer_id": volunteer["id"],
                "name": volunteer["name"],
                "role": "volunteer"
            }), 200

        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500


@volunteer_bp.route("/logout", methods=["POST"])
def volunteer_logout():
    """
    Logs out the current volunteer by removing their ID from the session.
    No request body required.
    """
    session.pop("volunteer_id", None)
    session.pop("volunteer_name", None)
    session.pop("volunteer_role", None)
    return jsonify({"message": "logout successful"}), 200


@volunteer_bp.route("/dashboard", methods=["POST"])
def volunteer_dashboard():
    data = request.get_json() or {}
    volunteer_id = data.get("volunteer_id")

    if not volunteer_id:
        return jsonify({"error": "missing volunteer_id"}), 400

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        cur = conn.cursor(dictionary=True, buffered=True)
        
        cur.execute("SELECT * FROM courses WHERE author_id = %s", (volunteer_id,))
        courses = cur.fetchall()

        cur.execute("SELECT * FROM blogs WHERE author_id = %s", (volunteer_id,))
        blogs = cur.fetchall()

        return jsonify({
            "coursesCreated": len(courses),
            "articlesWritten": len(blogs),
            "courses": courses
        }), 200

    except Error as e:
        print("Database error:", e)
        return jsonify({
            "error": "db connection error",
            "details": str(e)
        }), 500

    except Exception as e:
        print("Unexpected error:", e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    finally:
        # ✅ Always close connections safely
        if cur:
            cur.close()
        if conn and conn.is_connected():
            conn.close()

@volunteer_bp.route("/approve", methods=["POST"])
def approve_or_reject():
    """
    Accepts JSON body:
    {
      "volunteer_id": 5,
      "admin_id": 2,
      "action": "approve"   # or "reject"
      "comment": "Optional comment"
    }

    Updates volunteers.is_approved and inserts an approvals record with status 'approved'/'rejected'.
    """
    data = request.get_json() or {}
    volunteer_id = data.get("volunteer_id")
    admin_id = data.get("admin_id")
    action = (data.get("action") or "").lower()
    comment = data.get("comment")

    if not volunteer_id or not admin_id or action not in ("approve", "reject"):
        return jsonify({"error": "volunteer_id, admin_id and action('approve'|'reject') required"}), 400

    new_status = "approved" if action == "approve" else "rejected"
    is_approved_value = 1 if action == "approve" else 0

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            # Update volunteer approval flag
            update_sql = """
                UPDATE volunteers
                SET is_approved = %s
                WHERE id = %s
            """
            cur.execute(update_sql, (is_approved_value, volunteer_id))

            # Insert an approvals audit row
            insert_app_sql = """
                INSERT INTO approvals (volunteer_id, admin_id, status, comment)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(insert_app_sql, (volunteer_id, admin_id, new_status, comment))

            # If autocommit is off, uncomment:
            # conn.commit()

            return jsonify({
                "message": f"volunteer {new_status}",
                "volunteer_id": volunteer_id,
                "approval_id": cur.lastrowid
            }), 200

        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/add-course", methods=["POST"])
def add_course():
    data = request.get_json() or {}
    title = data.get("title")
    course_description = data.get("course_description")
    video_url = data.get("video_url")
    author_id = data.get("author_id")

    if not title or not course_description or not author_id:
        return jsonify({"error": "title, course_description and author_id are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            insert_sql = """
                INSERT INTO courses (title, course_description, video_url, author_id)
                VALUES (%s, %s, %s, %s)
            """
            cur.execute(insert_sql, (title, course_description, video_url, author_id))
            return jsonify({"message": "course added successfully"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/add-blog", methods=["POST"])
def add_blog():
    data = request.get_json() or {}
    title = data.get("title")
    slug = data.get("slug")
    content = data.get("content")
    image_url = data.get("image_url")
    author_id = data.get("author_id")

    if not title or not slug or not content or not author_id:
        return jsonify({"error": "title, slug, content and author_id are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            insert_sql = """
                INSERT INTO blogs (title, slug, content, image_url, author_id)
                VALUES (%s, %s, %s, %s, %s)
            """
            cur.execute(insert_sql, (title, slug, content, image_url, author_id))
            return jsonify({"message": "blog added successfully"}), 201
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/courses/<volunteer_id>", methods=["GET"])
def get_courses(volunteer_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        try:
            cur.execute("SELECT * FROM courses WHERE author_id = %s", (volunteer_id,))
            courses = cur.fetchall()
            return jsonify(courses), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/blogs/<volunteer_id>", methods=["GET"])
def get_blogs(volunteer_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        try:
            cur.execute("SELECT * FROM blogs WHERE author_id = %s", (volunteer_id,))
            blogs = cur.fetchall()
            return jsonify(blogs), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/course/<int:course_id>", methods=["GET"])
def get_course(course_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        try:
            cur.execute("SELECT * FROM courses WHERE id = %s", (course_id,))
            course = cur.fetchone()
            if course:
                return jsonify(course), 200
            return jsonify({"error": "Course not found"}), 404
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/course/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    data = request.get_json() or {}
    title = data.get("title")
    course_description = data.get("course_description")
    thumbnail_url = data.get("thumbnail_url")
    video_url = data.get("video_url")
    content = data.get("content")

    if not title or not course_description or not content:
        return jsonify({"error": "title, course_description and content are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            update_sql = """
                UPDATE courses
                SET title = %s, course_description = %s, thumbnail_url = %s, video_url = %s, content = %s
                WHERE id = %s
            """
            cur.execute(update_sql, (title, course_description, thumbnail_url, video_url, content, course_id))
            if cur.rowcount == 0:
                return jsonify({"error": "Course not found or no changes made"}), 404
            return jsonify({"message": "Course updated successfully"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/blog/<int:blog_id>", methods=["GET"])
def get_blog(blog_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        try:
            cur.execute("SELECT * FROM blogs WHERE id = %s", (blog_id,))
            blog = cur.fetchone()
            if blog:
                return jsonify(blog), 200
            return jsonify({"error": "Blog not found"}), 404
        except Error as e:
            return jsonify({"error": "db connection error", "details": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/blog/<int:blog_id>", methods=["PUT"])
def update_blog(blog_id):
    data = request.get_json() or {}
    title = data.get("title")
    slug = data.get("slug")
    content = data.get("content")
    image_url = data.get("image_url")
    image_alt = data.get("image_alt")
    image_caption = data.get("image_caption")

    if not title or not slug or not content:
        return jsonify({"error": "title, slug and content are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            update_sql = """
                UPDATE blogs
                SET title = %s, slug = %s, content = %s, image_url = %s, image_alt = %s, image_caption = %s
                WHERE id = %s
            """
            cur.execute(update_sql, (title, slug, content, image_url, image_alt, image_caption, blog_id))
            if cur.rowcount == 0:
                return jsonify({"error": "Blog not found or no changes made"}), 404
            return jsonify({"message": "Blog updated successfully"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/profile/<int:volunteer_id>", methods=["GET"])
def get_volunteer_profile(volunteer_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        try:
            cur.execute("SELECT id, email, name, phone, is_approved FROM volunteers WHERE id = %s", (volunteer_id,))
            profile = cur.fetchone()
            if profile:
                return jsonify(profile), 200
            return jsonify({"error": "Volunteer not found"}), 404
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@volunteer_bp.route("/profile/<int:volunteer_id>", methods=["PUT"])
def update_volunteer_profile(volunteer_id):
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")

    if not name or not email:
        return jsonify({"error": "name and email are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        try:
            update_sql = """
                UPDATE volunteers
                SET name = %s, email = %s, phone = %s
                WHERE id = %s
            """
            cur.execute(update_sql, (name, email, phone, volunteer_id))
            if cur.rowcount == 0:
                return jsonify({"error": "Volunteer not found or no changes made"}), 404
            return jsonify({"message": "Profile updated successfully"}), 200
        except Error as e:
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
    except Exception as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500
