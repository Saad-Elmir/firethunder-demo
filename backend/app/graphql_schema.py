import strawberry
from strawberry.types import Info

from app.database import SessionLocal
from app.security import create_access_token, decode_token
from app.crud_users import (
    get_user_by_username,
    get_user_by_email,
    create_user_default_role,
    authenticate,
    get_user_by_id,
)

@strawberry.type
class GQLUser:
    id: str
    username: str
    role: str

@strawberry.type
class LoginResult:
    token: str
    user: GQLUser

@strawberry.type
class Query:
    @strawberry.field
    def ping(self) -> str:
        return "pong"

    @strawberry.field
    def me(self, info: Info) -> GQLUser:
        request = info.context["request"]
        auth = request.headers.get("authorization")

        if not auth or not auth.lower().startswith("bearer "):
            raise ValueError("Unauthorized")

        token = auth.split(" ", 1)[1].strip()
        if not token:
            raise ValueError("Unauthorized")

        payload = decode_token(token)  # raises ValueError("Unauthorized") if invalid/expired
        user_id = payload.get("userId")
        if not user_id:
            raise ValueError("Unauthorized")

        db = SessionLocal()
        try:
            user = get_user_by_id(db, user_id)
            if not user:
                raise ValueError("Unauthorized")
            return GQLUser(id=str(user.id), username=user.username, role=user.role)
        finally:
            db.close()

@strawberry.type
class Mutation:
    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> GQLUser:
        if not username:
            raise ValueError("username required")
        if not email:
            raise ValueError("email required")
        if not password or len(password) < 6:
            raise ValueError("password required (min 6)")

        db = SessionLocal()
        try:
            if get_user_by_username(db, username):
                raise ValueError("Username already exists")
            if get_user_by_email(db, email):
                raise ValueError("Email already exists")

            user = create_user_default_role(db, username, email, password)
            return GQLUser(id=str(user.id), username=user.username, role=user.role)
        finally:
            db.close()

    @strawberry.mutation
    def login(self, username: str, password: str) -> LoginResult:
        if not username:
            raise ValueError("username required")
        if not password or len(password) < 6:
            raise ValueError("password required (min 6)")

        db = SessionLocal()
        try:
            user = authenticate(db, username, password)
            if not user:
                raise ValueError("Invalid credentials")

            token = create_access_token(str(user.id), user.username, user.role)
            return LoginResult(
                token=token,
                user=GQLUser(id=str(user.id), username=user.username, role=user.role),
            )
        finally:
            db.close()

schema = strawberry.Schema(query=Query, mutation=Mutation)
