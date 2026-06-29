import json
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from models import Collection, Request, Environment, EnvironmentVariable, History

async def seed_db(db: AsyncSession) -> None:
    """Seeds the database with initial collections, requests, environments, and history if it's empty or has old data."""
    # Check if collections already exist
    result = await db.execute(select(Collection))
    collections = result.scalars().all()
    
    # If the database contains old mock data, clear it to allow fresh seeding
    has_old_data = any(c.name in ["Postman Echo", "Local API"] for c in collections)
    
    if len(collections) > 0 and not has_old_data:
        # DB is not empty, skip seeding
        print("Database is not empty. Skipping seed.")
        return

    if has_old_data:
        print("Old mock data detected. Clearing database for fresh seeding...")
        await db.execute(delete(Request))
        await db.execute(delete(Collection))
        await db.execute(delete(EnvironmentVariable))
        await db.execute(delete(Environment))
        await db.execute(delete(History))
        await db.commit()

    print("Seeding database...")

    # ==========================================
    # 1. Collection: JSONPlaceholder Tests
    # ==========================================
    c1 = Collection(
        name="JSONPlaceholder Tests",
        description="Test endpoints using public JSONPlaceholder api"
    )
    db.add(c1)
    # Flush to get the ID for association if needed
    await db.flush()

    requests_c1 = [
        Request(
            collection_id=c1.id,
            name="Get All Posts",
            method="GET",
            url="{{base_url}}/posts",
            headers={"Accept": "application/json"},
            params={},
            body_type="none",
            body_content=None,
            auth_type="none",
            auth_config={}
        ),
        Request(
            collection_id=c1.id,
            name="Get Post by ID",
            method="GET",
            url="{{base_url}}/posts/1",
            headers={"Accept": "application/json"},
            params={},
            body_type="none",
            body_content=None,
            auth_type="none",
            auth_config={}
        ),
        Request(
            collection_id=c1.id,
            name="Create Post",
            method="POST",
            url="{{base_url}}/posts",
            headers={"Content-Type": "application/json"},
            params={},
            body_type="raw",
            body_content=json.dumps({"title": "foo", "body": "bar", "userId": 1}),
            auth_type="none",
            auth_config={}
        ),
        Request(
            collection_id=c1.id,
            name="Update Post",
            method="PUT",
            url="{{base_url}}/posts/1",
            headers={"Content-Type": "application/json"},
            params={},
            body_type="raw",
            body_content=json.dumps({"title": "foo updated", "body": "bar updated", "userId": 1}),
            auth_type="none",
            auth_config={}
        ),
        Request(
            collection_id=c1.id,
            name="Delete Post",
            method="DELETE",
            url="{{base_url}}/posts/1",
            headers={},
            params={},
            body_type="none",
            body_content=None,
            auth_type="none",
            auth_config={}
        ),
    ]
    db.add_all(requests_c1)

    # ==========================================
    # 2. Collection: HTTPBin Tests
    # ==========================================
    c2 = Collection(
        name="HTTPBin Tests",
        description="Verify requests using HTTPBin testing service"
    )
    db.add(c2)
    await db.flush()

    requests_c2 = [
        Request(
            collection_id=c2.id,
            name="GET Request",
            method="GET",
            url="{{base_url}}/get",
            headers={"X-Test-Header": "httpbin"},
            params={"foo": "bar"},
            body_type="none",
            body_content=None,
            auth_type="none",
            auth_config={}
        ),
        Request(
            collection_id=c2.id,
            name="POST Request",
            method="POST",
            url="{{base_url}}/post",
            headers={"Content-Type": "application/json"},
            params={},
            body_type="raw",
            body_content=json.dumps({"hello": "world"}),
            auth_type="bearer",
            auth_config={"token": "{{api_key}}"}
        ),
        Request(
            collection_id=c2.id,
            name="Inspect Headers",
            method="GET",
            url="{{base_url}}/headers",
            headers={"X-Custom-Auth": "{{api_key}}"},
            params={},
            body_type="none",
            body_content=None,
            auth_type="none",
            auth_config={}
        ),
    ]
    db.add_all(requests_c2)

    # ==========================================
    # 3. Environments
    # ==========================================
    env_dev = Environment(name="Development")
    db.add(env_dev)
    await db.flush()

    vars_dev = [
        EnvironmentVariable(
            environment_id=env_dev.id,
            key="base_url",
            value="https://jsonplaceholder.typicode.com",
            enabled=True
        ),
        EnvironmentVariable(
            environment_id=env_dev.id,
            key="api_key",
            value="dev-key-123",
            enabled=True
        ),
    ]
    db.add_all(vars_dev)

    env_prod = Environment(name="Production")
    db.add(env_prod)
    await db.flush()

    vars_prod = [
        EnvironmentVariable(
            environment_id=env_prod.id,
            key="base_url",
            value="https://httpbin.org",
            enabled=True
        ),
        EnvironmentVariable(
            environment_id=env_prod.id,
            key="api_key",
            value="prod-key-456",
            enabled=True
        ),
    ]
    db.add_all(vars_prod)

    # ==========================================
    # 4. History Entries
    # ==========================================
    h1 = History(
        method="GET",
        url="https://jsonplaceholder.typicode.com/posts/1",
        headers={"Accept": "application/json"},
        params={},
        body_type="none",
        body_content=None,
        auth_type="none",
        auth_config={},
        response_status=200,
        response_time_ms=120,
        response_size_bytes=292,
        response_headers={"Content-Type": "application/json; charset=utf-8", "Server": "cloudflare"},
        response_body=json.dumps({
            "userId": 1,
            "id": 1,
            "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
        }),
        executed_at=datetime.utcnow() - timedelta(minutes=15)
    )

    h2 = History(
        method="POST",
        url="https://jsonplaceholder.typicode.com/posts",
        headers={"Content-Type": "application/json"},
        params={},
        body_type="raw",
        body_content=json.dumps({"title": "foo", "body": "bar", "userId": 1}),
        auth_type="none",
        auth_config={},
        response_status=201,
        response_time_ms=210,
        response_size_bytes=65,
        response_headers={"Content-Type": "application/json; charset=utf-8", "Server": "cloudflare"},
        response_body=json.dumps({
            "title": "foo",
            "body": "bar",
            "userId": 1,
            "id": 101
        }),
        executed_at=datetime.utcnow() - timedelta(minutes=10)
    )

    h3 = History(
        method="GET",
        url="https://httpbin.org/headers",
        headers={"X-Custom-Auth": "dev-key-123"},
        params={},
        body_type="none",
        body_content=None,
        auth_type="none",
        auth_config={},
        response_status=200,
        response_time_ms=350,
        response_size_bytes=150,
        response_headers={"Content-Type": "application/json", "Server": "gunicorn"},
        response_body=json.dumps({
            "headers": {
                "Accept": "*/*",
                "Host": "httpbin.org",
                "X-Custom-Auth": "dev-key-123"
            }
        }),
        executed_at=datetime.utcnow() - timedelta(minutes=5)
    )

    db.add_all([h1, h2, h3])
    
    await db.commit()
    print("Database seeding completed successfully.")
