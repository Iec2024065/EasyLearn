# # app.py
# from flask import Flask, jsonify
# from flask_cors import CORS
# from app.utils import init_db_connection   # your connection helpers (from your snippet)
# from app.volunteer import volunteer_bp  # blueprint file you created earlier
# from app.blog import blog_bp
# from app.course import course_bp
# from app.quiz import quiz_bp
# from app.employee import auth_bp
# from app.user import user_bp
# import os

# def create_app():
#     # app = Flask(__name__)
#     # app.secret_key = "supersecretkey"
#     # # app.secret_key = os.getenv("FLASK_SECRET_KEY", "change-me-replace-in-prod")
#     # # initialize global DB connection (prints connection status)
#     # init_db_connection()
#     # # Enable CORS for local Next.js dev and generic origins via env
#     # allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
#     # CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

#     app = Flask(__name__)
#     app.secret_key = "supersecretkey"

#     init_db_connection()

#     # CORS(app,
#     #      resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
#     #      supports_credentials=True)

#     CORS(app, supports_credentials=True, origins=[
#     "http://localhost:3000",
#     "http://127.0.0.1:3000"
#     ])

#     app.config.update(
#         SESSION_COOKIE_SAMESITE="None",
#         SESSION_COOKIE_SECURE=False  # use True if running HTTPS
#     )

#     # register blueprints
#     # volunteer_bp contains /register and /approve endpoints
#     app.register_blueprint(volunteer_bp, url_prefix="/volunteer")
#     app.register_blueprint(blog_bp, url_prefix="/blog")
#     app.register_blueprint(course_bp, url_prefix="/course")
#     app.register_blueprint(quiz_bp, url_prefix="/quiz")
#     app.register_blueprint(auth_bp)

#     # simple health endpoint
#     @app.route("/", methods=["GET"])
#     def index():
#         return jsonify({"status": "ok", "service": "EasyLearn Backend"})

#     return app

# if __name__ == "__main__":
#     app = create_app()
#     # use debug=True for development
#     app.run(host="0.0.0.0", port=5000, debug=True)


# run.py
from flask import Flask, jsonify
from flask_cors import CORS
from app.utils import get_db_connection
from app.volunteer import volunteer_bp
from app.blog import blog_bp
from app.course import course_bp
from app.quiz import quiz_bp
from app.employee import auth_bp
from app.user import user_bp
from app.support_routes import support_bp
import os





def create_app():
    app = Flask(__name__)
    app.secret_key = os.getenv("FLASK_SECRET_KEY", "supersecretkey")

    # ✅ Correct CORS setup for session cookies
    CORS(app,
         resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
         supports_credentials=True)

    # ✅ Proper session cookie setup for local development
    app.config.update(
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=False  # set True only for HTTPS
    )

    # Register blueprints
    app.register_blueprint(volunteer_bp, url_prefix="/volunteer")
    app.register_blueprint(blog_bp, url_prefix="/blog")
    app.register_blueprint(course_bp, url_prefix="/course")
    app.register_blueprint(quiz_bp, url_prefix="/quiz")
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(support_bp)


    @app.route("/", methods=["GET"])
    def index():
        return jsonify({"status": "ok", "service": "EasyLearn Backend"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)


from dotenv import load_dotenv
import os

# Load from backend/.env (relative to project root)
dotenv_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(dotenv_path)

print("Loaded EMAIL:", os.getenv("EMAIL"))  # Test line
