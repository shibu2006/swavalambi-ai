"""
dynamodb_service.py — DynamoDB CRUD helpers for Swavalambi user profiles.

Table: swavalambi_users
PK:   user_id  (phone number, e.g. "+919876543210")
"""

import boto3
import os
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

_TABLE_NAME = os.getenv("DYNAMODB_TABLE", "swavalambi_users")


def _get_table():
    session = boto3.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    )
    dynamodb = session.resource("dynamodb")
    return dynamodb.Table(_TABLE_NAME)


def create_or_update_user(user_id: str, name: str) -> dict:
    """
    Upsert a user record. Only sets name + created_at if not already present
    (so re-registration doesn't wipe assessment data).
    """
    table = _get_table()
    now = datetime.now(timezone.utc).isoformat()

    table.update_item(
        Key={"user_id": user_id},
        UpdateExpression=(
            "SET #n = if_not_exists(#n, :name), "
            "created_at = if_not_exists(created_at, :now), "
            "updated_at = :now"
        ),
        ExpressionAttributeNames={"#n": "name"},
        ExpressionAttributeValues={":name": name, ":now": now},
    )
    logger.info(f"Upserted user {user_id}")
    return {"user_id": user_id, "name": name}


def save_assessment(
    user_id: str,
    skill: str,
    intent: str,
    skill_rating: int,
    theory_score: int = 0,
    session_id: Optional[str] = None,
) -> None:
    """
    Persist the result of a skill assessment + profiling conversation.
    Called after vision analysis completes.
    """
    table = _get_table()
    now = datetime.now(timezone.utc).isoformat()

    update_expr = (
        "SET skill = :skill, intent = :intent, "
        "skill_rating = :rating, theory_score = :theory, "
        "updated_at = :now"
    )
    values = {
        ":skill": skill,
        ":intent": intent,
        ":rating": skill_rating,
        ":theory": theory_score,
        ":now": now,
    }
    if session_id:
        update_expr += ", session_id = :sid"
        values[":sid"] = session_id

    table.update_item(
        Key={"user_id": user_id},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=values,
    )
    logger.info(f"Saved assessment for {user_id}: skill={skill}, rating={skill_rating}")


def get_user(user_id: str) -> Optional[dict]:
    """
    Fetch a user record by user_id (phone number).
    Returns None if the user does not exist.
    """
    table = _get_table()
    resp = table.get_item(Key={"user_id": user_id})
    item = resp.get("Item")
    if not item:
        return None
    # Convert Decimal → int for JSON serialisation
    for key in ("skill_rating", "theory_score"):
        if key in item:
            item[key] = int(item[key])
    return item

def update_chat_history(user_id: str, chat_history: list) -> None:
    """
    Appends or overwrites the chat history for a specific user.
    """
    table = _get_table()
    now = datetime.now(timezone.utc).isoformat()
    
    table.update_item(
        Key={"user_id": user_id},
        UpdateExpression="SET chat_history = :history, updated_at = :now",
        ExpressionAttributeValues={
            ":history": chat_history,
            ":now": now
        }
    )
    logger.info(f"Updated chat history for user {user_id}")

