import json
import os
from functools import lru_cache
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore, storage

from app.core.logging import get_logger

logger = get_logger(__name__)


@lru_cache(maxsize=1)
def get_firebase_app() -> firebase_admin.App:
    """Initialize Firebase Admin SDK once (singleton via lru_cache)."""
    sa_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "./firebase-service-account.json")
    bucket = os.environ.get("FIREBASE_STORAGE_BUCKET", "")

    if not Path(sa_path).exists():
        logger.warning(
            "firebase_service_account_not_found",
            path=sa_path,
            note="Running in offline/mock mode",
        )
        # Allow the app to start without Firebase for local dev without credentials
        try:
            return firebase_admin.get_app()
        except ValueError:
            pass
        cred = credentials.ApplicationDefault()
    else:
        cred = credentials.Certificate(sa_path)

    options = {"storageBucket": bucket} if bucket else {}
    app = firebase_admin.initialize_app(cred, options)
    logger.info("firebase_initialized", project=getattr(cred, "project_id", "unknown"))
    return app


def get_firestore_client():
    get_firebase_app()
    return firestore.client()


def get_storage_bucket():
    get_firebase_app()
    return storage.bucket()
