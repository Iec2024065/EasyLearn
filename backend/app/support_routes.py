from flask import Blueprint, request, jsonify, session
from mysql.connector import Error
from app.utils import get_db_connection
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
load_dotenv()
import os

support_bp = Blueprint("support_bp", __name__)

# ===== Submit Support Query =====
@support_bp.route("/support/submit", methods=["POST"])
def submit_query():
    data = request.get_json() or {}
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")
    user_id = session.get("user_id") or data.get("user_id")

    if not email or not subject or not message:
        return jsonify({"error": "All fields are required"}), 400

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        sql = """
            INSERT INTO support_queries (user_id, email, subject, message)
            VALUES (%s, %s, %s, %s)
        """
        cur.execute(sql, (user_id, email, subject, message))
        conn.commit()
        return jsonify({"message": "Query submitted successfully"}), 201
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ===== Get All Queries (Admin Dashboard) =====
@support_bp.route("/support/all", methods=["GET"])
def get_all_queries():
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM support_queries ORDER BY created_at DESC")
        queries = cur.fetchall()
        return jsonify(queries), 200
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ===== Mark Query as Resolved + Send Email =====
@support_bp.route("/support/resolve/<int:query_id>", methods=["POST"])
def resolve_query(query_id):
    conn = get_db_connection()
    try:
        cur = conn.cursor(dictionary=True)

        # Fetch the query
        cur.execute("SELECT * FROM support_queries WHERE id = %s", (query_id,))
        query = cur.fetchone()
        if not query:
            return jsonify({"error": "Query not found"}), 404

        # Update status
        cur.execute("UPDATE support_queries SET status = 'resolved' WHERE id = %s", (query_id,))
        conn.commit()

        # Send email notification
        sender_email = os.getenv("EMAIL_ADDRESS")
        sender_password = os.getenv("EMAIL_APP_PASSWORD")
        receiver_email = query["email"]

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Support Query Has Been Resolved - {query['subject']}"
        msg["From"] = sender_email
        msg["To"] = receiver_email

        text = f"Hello,\n\nYour query has been resolved.\n\nQuery:\n{query['message']}\n\nThank you for reaching out."
        msg.attach(MIMEText(text, "plain"))

        # try:
        #     with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        #         server.login(sender_email, sender_password)
        #         server.sendmail(sender_email, receiver_email, msg.as_string())
        # except Exception as e:
        #     print("Mail send failed:", e)

        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
                print(f"✅ Resolution email sent to {receiver_email}")
        except Exception as e:
            print(f"❌ Mail send failed: {e}")

        return jsonify({"message": "Query marked as resolved and email sent"}), 200

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
