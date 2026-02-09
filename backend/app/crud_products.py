from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models import Product


def list_products(db: Session) -> list[Product]:
    # created_at desc
    stmt = select(Product).order_by(Product.created_at.desc())
    return list(db.execute(stmt).scalars().all())


def get_product_by_id(db: Session, product_id: str) -> Product | None:
    return db.get(Product, product_id)


def create_product(db: Session, name: str, description: str | None, price, quantity: int) -> Product:
    product = Product(
        name=name,
        description=description,
        price=price,
        quantity=quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(
    db: Session,
    product: Product,
    name: str | None,
    description: str | None,
    price,
    quantity: int | None,
) -> Product:
    if name is not None:
        product.name = name
    if description is not None:
        product.description = description
    if price is not None:
        product.price = price
    if quantity is not None:
        product.quantity = quantity

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
