from flask import Blueprint, request, jsonify, session
from mysql.connector import Error
from app.utils import get_db_connection

course_bp = Blueprint("course_bp", __name__)

@course_bp.route("/", methods=["POST"])
def create_course():
    if "volunteer_id" not in session:
        return jsonify({"error": "unauthorized"}), 401

    payload = request.get_json() or {}
    title = payload.get("title")
    description = payload.get("description")
    content = payload.get("content")
    author_id = session["volunteer_id"]

    if not title or not description or not content:
        return jsonify({"error": "title, description, and content are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO courses (title, course_description, content, author_id) VALUES (%s, %s, %s, %s)",
            (title, description, content, author_id),
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.close()

        return jsonify({"message": "course created successfully", "course_id": new_id}), 201

    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500

@course_bp.route("/<int:course_id>", methods=["GET", "PUT"])
def manage_course(course_id):
    if "volunteer_id" not in session:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)

        if request.method == "GET":
            cur.execute("SELECT * FROM courses WHERE id = %s", (course_id,))
            course = cur.fetchone()
            cur.close()
            if not course:
                return jsonify({"error": "course not found"}), 404
            return jsonify(course), 200

        elif request.method == "PUT":
            payload = request.get_json() or {}
            title = payload.get("title")
            description = payload.get("description")
            content = payload.get("content")

            if not title or not description or not content:
                return jsonify({"error": "title, description, and content are required"}), 400

            cur.execute("SELECT author_id FROM courses WHERE id = %s", (course_id,))
            course = cur.fetchone()

            if not course:
                cur.close()
                return jsonify({"error": "course not found"}), 404

            if course["author_id"] != session["volunteer_id"]:
                cur.close()
                return jsonify({"error": "forbidden"}), 403

            cur.execute(
                "UPDATE courses SET title = %s, course_description = %s, content = %s WHERE id = %s",
                (title, description, content, course_id),
            )
            conn.commit()
            cur.close()

            return jsonify({"message": "course updated successfully"}), 200

    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500

@course_bp.route("/volunteer/<int:volunteer_id>", methods=["GET"])
def get_volunteer_courses(volunteer_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM courses WHERE author_id = %s", (volunteer_id,))
        courses = cur.fetchall()
        cur.close()
        return jsonify(courses), 200
    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500
    

@course_bp.route("/", methods=["GET"])
def get_all_courses():
    """
    Fetch all courses for frontend display.
    Returns a list of courses with fields matching frontend expectations:
    id, title, description, thumbnail, duration, students, rating, level, category
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT 
                id,
                title,
                course_description AS description,
                thumbnail_url AS thumbnail,
                video_url,
                rating,
                author_id,
                is_approved,
                content
            FROM courses
            WHERE is_approved = TRUE
        """)
        courses_db = cur.fetchall()
        cur.close()

        # Map DB columns to frontend expected fields
        courses = []
        for c in courses_db:
            courses.append({
                "id": c["id"],
                "title": c["title"],
                "description": c["description"] or "",
                "thumbnail": c["thumbnail"] or "/placeholder.svg",
                "duration": "N/A",   # Default since not in DB
                "students": 0,       # Default since not tracked
                "rating": float(c["rating"] or 0),
                "level": "N/A",      # Default
                "category": "N/A",   # Default
                "is_approved":c["is_approved"],
                "video_url":c["video_url"],
                "content":c["content"],
            })

        return jsonify(courses), 200

    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500
    

@course_bp.route("/public/<int:course_id>", methods=["GET"])
def get_course_public(course_id):
    """
    Fetch a single course by ID for public viewing (no login required)
    """
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("""
            SELECT 
                id,
                title,
                course_description AS description,
                thumbnail_url AS thumbnail,
                rating,
                author_id,
                video_url,
                content
            FROM courses
            WHERE id = %s AND is_approved = TRUE
        """, (course_id,))
        course = cur.fetchone()
        cur.close()

        if not course:
            return jsonify({"error": "course not found"}), 404

        # Map DB columns to frontend expected fields
        course_data = {
            "id": course["id"],
            "title": course["title"],
            "description": course["description"] or "",
            "thumbnail": course["thumbnail"] or "/placeholder.svg",
            "duration": "N/A",
            "students": 0,
            "rating": float(course["rating"] or 0),
            "level": "N/A",
            "category": "N/A",
            "video_url": course["video_url"],
            "content": course["content"],
        }

        return jsonify(course_data), 200
    
    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500