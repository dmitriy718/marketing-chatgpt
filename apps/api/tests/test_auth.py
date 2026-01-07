from jose import jwt

from marketing_api.auth.security import hash_password, verify_password
from marketing_api.auth.tokens import create_access_token
from marketing_api.settings import settings


def test_hash_and_verify_password() -> None:
    password = "super-secret"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong", hashed) is False


def test_create_access_token_contains_subject() -> None:
    subject = "user-id-123"
    token = create_access_token(subject, expires_minutes=5)
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    assert payload["sub"] == subject
