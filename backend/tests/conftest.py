import os
from pathlib import Path

TEST_DATABASE = Path(__file__).parent / "test_travel_planner.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE.as_posix()}"
os.environ["PRESET_USER_EMAIL"] = "demo@travel-planner.example.com"
os.environ["PRESET_USER_PASSWORD"] = "change-this-development-password"


def pytest_sessionfinish(session, exitstatus):
    from app.core.database import engine

    engine.dispose()
    TEST_DATABASE.unlink(missing_ok=True)
