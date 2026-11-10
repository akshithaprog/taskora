"""Authentication routes: register, login, profile."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from extensions import db
from models import User
from validation import EMAIL_RE, ValidationError, clean_name, validate_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def current_user():
    """The logged-in user (or None). Always derived from the JWT, never from request data."""
    return db.session.get(User, int(get_jwt_identity()))


def token_response(user, status=200):
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.to_dict()}), status


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    errors = {}
    name = clean_name(data.get("name"), errors)
    email = (data.get("email") or "").strip().lower() if isinstance(data.get("email"), str) else ""
    if not EMAIL_RE.match(email) or len(email) > 254:
        errors["email"] = "Enter a valid email address."
    elif User.query.filter_by(email=email).first():
        errors["email"] = "An account with this email already exists."
    pw_error = validate_password(data.get("password"))
    if pw_error:
        errors["password"] = pw_error
    if errors:
        raise ValidationError(errors)

    user = User(name=name, email=email)
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return token_response(user, 201)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower() if isinstance(data.get("email"), str) else ""
    password = data.get("password") if isinstance(data.get("password"), str) else ""
    user = User.query.filter_by(email=email).first()
    # Same message for "no such user" and "wrong password" so emails can't be probed.
    if not user or not user.check_password(password):
        return jsonify({"error": "Email or password is incorrect."}), 401
    return token_response(user)


@auth_bp.get("/me")
@jwt_required()
def me():
    user = current_user()
    if not user:
        return jsonify({"error": "Account not found."}), 401
    return jsonify({"user": user.to_dict()})


@auth_bp.patch("/me")
@jwt_required()
def update_me():
    user = current_user()
    errors = {}
    name = clean_name((request.get_json(silent=True) or {}).get("name"), errors)
    if errors:
        raise ValidationError(errors)
    user.name = name
    db.session.commit()
    return jsonify({"user": user.to_dict()})


@auth_bp.post("/password")
@jwt_required()
def change_password():
    user = current_user()
    data = request.get_json(silent=True) or {}
    errors = {}
    if not user.check_password(data.get("current_password") or ""):
        errors["current_password"] = "That isn't your current password."
    pw_error = validate_password(data.get("new_password"))
    if pw_error:
        errors["new_password"] = pw_error
    if errors:
        raise ValidationError(errors)
    user.set_password(data["new_password"])
    db.session.commit()
    return jsonify({"ok": True})
