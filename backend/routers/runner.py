import re
import time
import json
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import History
from schemas import RunRequest, RunResponse

router = APIRouter(prefix="/api", tags=["Request Runner"])

def resolve_string(val: str, env_vars: dict) -> str:
    """Helper to resolve {{variable}} placeholders in a string using environment variables."""
    if not isinstance(val, str):
        return val
    def replacer(match):
        var_name = match.group(1).strip()
        # Return resolved value or keep the original template if not found
        return env_vars.get(var_name, match.group(0))
    return re.sub(r"\{\{([^}]+)\}\}", replacer, val)


def resolve_dict(d: dict, env_vars: dict) -> dict:
    """Helper to resolve placeholders recursively inside a dictionary."""
    if not d:
        return d
    resolved = {}
    for k, v in d.items():
        resolved_key = resolve_string(k, env_vars)
        if isinstance(v, str):
            resolved[resolved_key] = resolve_string(v, env_vars)
        elif isinstance(v, dict):
            resolved[resolved_key] = resolve_dict(v, env_vars)
        else:
            resolved[resolved_key] = v
    return resolved


@router.post("/run", response_model=RunResponse)
async def run_http_request(run_req: RunRequest, db: AsyncSession = Depends(get_db)) -> RunResponse:
    """
    Executes an HTTP request with variable interpolation, timing, size calculation,
    auth configuration, history tracking, and error mapping.
    """
    env_vars = run_req.environment_variables

    # 1. Resolve templates
    resolved_method = resolve_string(run_req.method.upper(), env_vars)
    resolved_url = resolve_string(run_req.url, env_vars)
    resolved_headers = resolve_dict(run_req.headers, env_vars)
    resolved_params = resolve_dict(run_req.params, env_vars)
    resolved_auth_config = resolve_dict(run_req.auth_config, env_vars)
    
    resolved_body_content = ""
    if run_req.body_content:
        resolved_body_content = resolve_string(run_req.body_content, env_vars)

    # 2. Setup Authentication
    auth = None
    if run_req.auth_type == "bearer":
        token = resolved_auth_config.get("token", "")
        if token:
            resolved_headers["Authorization"] = f"Bearer {token}"
    elif run_req.auth_type == "basic":
        username = resolved_auth_config.get("username", "")
        password = resolved_auth_config.get("password", "")
        auth = httpx.BasicAuth(username, password)

    # 3. Setup Body Payload
    data_payload = None
    content_payload = None

    if run_req.body_type == "raw" and resolved_body_content:
        content_payload = resolved_body_content.encode("utf-8")
    elif run_req.body_type in ("form-data", "urlencoded") and resolved_body_content:
        try:
            # Check if it is a JSON object representing fields
            parsed = json.loads(resolved_body_content)
            if isinstance(parsed, dict):
                data_payload = parsed
            else:
                content_payload = resolved_body_content.encode("utf-8")
        except json.JSONDecodeError:
            # Fallback to key-value string if JSON decode fails
            content_payload = resolved_body_content.encode("utf-8")

    # 4. Perform Request & Measure Metrics
    start_time = time.perf_counter()
    error_message = None
    error_type = None
    status_code = 0
    response_headers = {}
    response_body = ""
    size_bytes = 0

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=resolved_method,
                url=resolved_url,
                headers=resolved_headers,
                params=resolved_params,
                content=content_payload,
                data=data_payload,
                auth=auth,
            )
            # End time measurement
            time_ms = int((time.perf_counter() - start_time) * 1000)
            status_code = response.status_code
            response_headers = dict(response.headers)
            response_body = response.text
            size_bytes = len(response.content)

    except httpx.TimeoutException:
        time_ms = int((time.perf_counter() - start_time) * 1000)
        error_message = "Request timed out after 30 seconds"
        error_type = "timeout"
    except httpx.ConnectError:
        time_ms = int((time.perf_counter() - start_time) * 1000)
        error_message = "Failed to establish connection to the server"
        error_type = "connection_error"
    except (httpx.UnsupportedProtocol, httpx.InvalidURL, ValueError) as e:
        time_ms = int((time.perf_counter() - start_time) * 1000)
        error_message = f"Invalid URL or request format: {str(e)}"
        error_type = "invalid_url"
    except Exception as e:
        time_ms = int((time.perf_counter() - start_time) * 1000)
        error_message = f"An unexpected error occurred: {str(e)}"
        error_type = "unknown"

    # 5. Save execution to history table
    history_entry = History(
        method=run_req.method,
        url=run_req.url,
        headers=run_req.headers,
        params=run_req.params,
        body_type=run_req.body_type,
        body_content=run_req.body_content,
        auth_type=run_req.auth_type,
        auth_config=run_req.auth_config,
        response_status=status_code,
        response_time_ms=time_ms,
        response_size_bytes=size_bytes,
        response_headers=response_headers,
        response_body=response_body if error_message is None else error_message,
    )
    db.add(history_entry)
    await db.commit()

    return RunResponse(
        status_code=status_code,
        headers=response_headers,
        body=response_body if error_message is None else None,
        time_ms=time_ms,
        size_bytes=size_bytes,
        error=error_message,
        error_type=error_type,
    )
