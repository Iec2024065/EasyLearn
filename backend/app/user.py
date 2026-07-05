from flask import Blueprint, request, jsonify, session
from mysql.connector import Error
from app.utils import get_db_connection
import hashlib
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

user_bp = Blueprint("user_bp", __name__)

def _sha256_hex(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

# @user_bp.route("/users", methods=["POST"])
# def create_user():
#     payload = request.get_json() or {}
#     name = payload.get("name")
#     email = payload.get("email")
#     password = payload.get("password")

#     if not name or not email or not password:
#         return jsonify({"error": "name, email, and password required"}), 400

#     pw_hash = _sha256_hex(password)

#     conn = get_db_connection()
#     try:
#         cur = conn.cursor(dictionary=True)

#         cur.execute("SELECT id FROM users WHERE email = %s", (email,))
#         if cur.fetchone():
#             cur.close()
#             return jsonify({"error": "email already registered"}), 400

#         cur.execute(
#             "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
#             (name, email, pw_hash),
#         )
#         conn.commit()
#         new_id = cur.lastrowid
#         cur.close()

#         # Send verification email
#         message = Mail(
#             from_email='your_email@example.com',
#             to_emails=email,
#             subject='Verify your EasyLearn account',
#             html_content=f'<strong>Click the link to verify your email:</strong> <a href="http://localhost:3000/verify?email={email}">Verify</a>'
#         )
#         try:
#             sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
#             response = sg.send(message)
#             print(response.status_code)
#             print(response.body)
#             print(response.headers)
#         except Exception as e:
#             print(e)

#         return jsonify({
#             "message": "registration successful, please check your email to verify your account",
#             "user_id": new_id,
#         }), 201

#     except Error as e:
#         return jsonify({"error": "db error", "details": str(e)}), 500

from dotenv import load_dotenv
load_dotenv()

@user_bp.route("/users", methods=["POST"])
def create_user():
    payload = request.get_json() or {}
    name = payload.get("name")
    email = payload.get("email")
    password = payload.get("password")

    if not name or not email or not password:
        return jsonify({"error": "name, email, and password required"}), 400

    pw_hash = _sha256_hex(password)

    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)

        # Check if email already exists
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            return jsonify({"error": "email already registered"}), 400

        # Insert new user
        cur.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, pw_hash),
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.close()

        # -----------------------------
        # Send verification email via Gmail SMTP
        # -----------------------------
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        import os

        sender_email = os.getenv("EMAIL_ADDRESS")
        sender_password = os.getenv("EMAIL_APP_PASSWORD")

        if sender_email and sender_password:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Verify your EasyLearn Account"
            msg["From"] = sender_email
            msg["To"] = email

            html_content = f"""
            <html>
              <body>
                <h2>Welcome to EasyLearn!</h2>
                <p>Click the link below to verify your account:</p>
                <a href="http://localhost:3000/verify?email={email}" target="_blank">Verify Email</a>
              </body>
            </html>
            """

            msg.attach(MIMEText(html_content, "html"))

            try:
                with smtplib.SMTP("smtp.gmail.com", 587) as server:
                    server.starttls()
                    server.login(sender_email, sender_password)
                    server.send_message(msg)
                    print(f"✅ Verification email sent to {email}")
            except Exception as e:
                print(f"❌ Failed to send verification email: {e}")
        else:
            print("⚠️ Missing EMAIL_ADDRESS or EMAIL_APP_PASSWORD environment variables")

        # -----------------------------
        # Return success response
        # -----------------------------
        return jsonify({
            "message": "Registration successful, please check your email to verify your account",
            "user_id": new_id,
        }), 201

    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500



@user_bp.route("/users/login", methods=["POST"])
def user_login():
    payload = request.get_json() or {}
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()

        if not user:
            return jsonify({"error": "invalid credentials"}), 401

        if not user['isVerified']:
            return jsonify({"error": "please verify your email before logging in"}), 401

        if user["password"] == _sha256_hex(password):
            session["user_id"] = user["id"]
            session["user_name"] = user["name"]
            session["user_role"] = "user"
            return jsonify({
                "message": "login successful",
                "user_id": user["id"],
                "name": user["name"],
                "role": "user"
            }), 200
        else:
            return jsonify({"error": "invalid credentials"}), 401

    except Error as e:
        return jsonify({"error": "db connection error", "details": str(e)}), 500

@user_bp.route("/users/verify", methods=["POST"])
def verify_user():
    payload = request.get_json() or {}
    email = payload.get("email")

    if not email:
        return jsonify({"error": "email is required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("UPDATE users SET isVerified = 1 WHERE email = %s", (email,))
        conn.commit()
        cur.close()
        return jsonify({"message": "email verified successfully"}), 200
    except Error as e:
        return jsonify({"error": "db error", "details": str(e)}), 500

@user_bp.route("/user/logout", methods=["POST"])
def user_logout():
    session.pop("user_id", None)
    session.pop("user_name", None)
    session.pop("user_role", None)
    return jsonify({"message": "logout successful"}), 200
