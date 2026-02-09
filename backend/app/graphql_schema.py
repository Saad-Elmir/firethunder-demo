import strawberry # type: ignore
from strawberry.types import Info # type: ignore
from datetime import datetime
from decimal import Decimal

from app.database import SessionLocal
from app.security import create_access_token, decode_token
from app.crud_users import (
    get_user_by_username,
    get_user_by_email,
    create_user_default_role,
    authenticate,
    get_user_by_id,
)
from app.crud_products import (
    list_products,
    get_product_by_id,
    create_product,
    update_product,
    delete_product,
)


# GraphQL Types


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
class GQLProduct:
    id: str
    name: str
    description: str | None
    price: str          # on renvoie en string pour éviter soucis float
    quantity: int
    created_at: str
    updated_at: str

def _to_gql_product(p) -> GQLProduct:
    return GQLProduct(
        id=str(p.id),
        name=p.name,
        description=p.description,
        price=str(p.price),
        quantity=p.quantity,
        created_at=p.created_at.isoformat() if isinstance(p.created_at, datetime) else str(p.created_at),
        updated_at=p.updated_at.isoformat() if isinstance(p.updated_at, datetime) else str(p.updated_at),
    )


# Auth Helpers (strict messages)

def _get_bearer_token(info: Info) -> str:
    request = info.context["request"]
    auth = request.headers.get("authorization")
    if not auth or not auth.lower().startswith("bearer "):
        raise ValueError("Unauthorized")
    token = auth.split(" ", 1)[1].strip()
    if not token:
        raise ValueError("Unauthorized")
    return token

def _require_auth(info: Info) -> dict:
    token = _get_bearer_token(info)
    payload = decode_token(token)  # raises ValueError("Unauthorized")
    if not payload.get("userId"):
        raise ValueError("Unauthorized")
    return payload

def _require_admin(info: Info) -> dict:
    payload = _require_auth(info)
    if payload.get("role") != "ADMIN":
        raise ValueError("Forbidden")
    return payload


# Inputs


@strawberry.input
class ProductInput:
    name: str
    description: str | None = None
    price: float
    quantity: int

@strawberry.input
class ProductUpdateInput:
    name: str | None = None
    description: str | None = None
    price: float | None = None
    quantity: int | None = None


# Query


@strawberry.type
class Query:
    @strawberry.field
    def ping(self) -> str:
        return "pong"

    @strawberry.field
    def me(self, info: Info) -> GQLUser:
        payload = _require_auth(info)
        user_id = payload.get("userId")

        db = SessionLocal()
        try:
            user = get_user_by_id(db, user_id)
            if not user:
                raise ValueError("Unauthorized")
            return GQLUser(id=str(user.id), username=user.username, role=user.role)
        finally:
            db.close()

    # US-5.1 products() - requires auth + ordered created_at desc
    @strawberry.field
    def products(self, info: Info) -> list[GQLProduct]:
        _require_auth(info)

        db = SessionLocal()
        try:
            products = list_products(db)
            return [_to_gql_product(p) for p in products]
        finally:
            db.close()

    # US-5.2 productById(id) - requires auth
    @strawberry.field(name="productById")
    def product_by_id(self, info: Info, id: str) -> GQLProduct:
        _require_auth(info)

        db = SessionLocal()
        try:
            product = get_product_by_id(db, id)
            if not product:
                raise ValueError("Product not found")
            return _to_gql_product(product)
        finally:
            db.close()


# Mutation


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

    
    @strawberry.mutation(name="createProduct")
    def create_product_mutation(self, info: Info, input: ProductInput) -> GQLProduct:
        _require_auth(info)

        # Validations (exact message format)
        if not input.name or len(input.name.strip()) < 2:
            raise ValueError("Validation error: name")
        if input.price is None or input.price < 0:
            raise ValueError("Validation error: price")
        if input.quantity is None or input.quantity < 0:
            raise ValueError("Validation error: quantity")

        db = SessionLocal()
        try:
            product = create_product(
                db,
                name=input.name.strip(),
                description=input.description,
                price=Decimal(str(input.price)),
                quantity=int(input.quantity),
            )
            return _to_gql_product(product)
        finally:
            db.close()

    #  updateProduct(id, input) - requires auth + generic validation error
    @strawberry.mutation(name="updateProduct")
    def update_product_mutation(self, info: Info, id: str, input: ProductUpdateInput) -> GQLProduct:
        _require_auth(info)

        # invalid input -> "Validation error"
        if (
            input.name is None
            and input.description is None
            and input.price is None
            and input.quantity is None
        ):
            raise ValueError("Validation error")

        if input.name is not None and len(input.name.strip()) < 2:
            raise ValueError("Validation error")
        if input.price is not None and input.price < 0:
            raise ValueError("Validation error")
        if input.quantity is not None and input.quantity < 0:
            raise ValueError("Validation error")

        db = SessionLocal()
        try:
            product = get_product_by_id(db, id)
            if not product:
                raise ValueError("Product not found")

            updated = update_product(
                db,
                product=product,
                name=input.name.strip() if input.name is not None else None,
                description=input.description,
                price=Decimal(str(input.price)) if input.price is not None else None,
                quantity=int(input.quantity) if input.quantity is not None else None,
            )
            return _to_gql_product(updated)
        finally:
            db.close()

    #  deleteProduct(id) - ADMIN only
    @strawberry.mutation(name="deleteProduct")
    def delete_product_mutation(self, info: Info, id: str) -> bool:
        _require_admin(info)  # Unauthorized / Forbidden exact

        db = SessionLocal()
        try:
            product = get_product_by_id(db, id)
            if not product:
                raise ValueError("Product not found")

            delete_product(db, product)
            return True
        finally:
            db.close()

schema = strawberry.Schema(query=Query, mutation=Mutation)
