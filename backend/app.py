"""Taskora API entry point.  Run with:  python app.py"""
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from config import Config
from extensions import cors, db, jwt
from validation import ValidationError


def create_app(overrides=None):
    app = Flask(__name__)
    app.config.from_object(Config)
    if overrides:
        app.config.update(overrides)
    app.url_map.strict_slashes = False

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    @app.route("/api")
    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "app": "Taskora API"})

    from routes.auth import auth_bp
    from routes.stats import stats_bp
    from routes.tasks import tasks_bp

    for bp in (auth_bp, tasks_bp, stats_bp):
        app.register_blueprint(bp)

    register_error_handlers(app)

    with app.app_context():
        db.create_all()
        if not app.config.get("TESTING"):
            try:
                from seed import seed_demo_data
                seed_demo_data()
            except Exception:
                pass
    return app


def register_error_handlers(app):
    @app.errorhandler(ValidationError)
    def handle_validation(err):
        return jsonify({"error": str(err), "fields": err.fields}), 400

    @app.errorhandler(HTTPException)
    def handle_http(err):
        return jsonify({"error": err.description if err.code != 404 else "Not found."}), err.code

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        app.logger.exception(err)
        db.session.rollback()
        return jsonify({"error": "Something went wrong on our side. Please try again."}), 500

    # Flask-JWT-Extended: turn auth failures into the same JSON shape.
    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "Please sign in to continue."}), 401

    @jwt.invalid_token_loader
    def bad_token(reason):
        return jsonify({"error": "Your session is invalid. Please sign in again."}), 401

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify({"error": "Your session expired. Please sign in again."}), 401


if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
