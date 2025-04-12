import importlib
import os
from elasticsearch import Elasticsearch

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")

MIGRATION_DIR = "migrations"
MIGRATION_VERSION_FILE = os.path.join(MIGRATION_DIR, "version.txt")

# Ensure migrations directory exists
if not os.path.exists(MIGRATION_DIR):
    os.makedirs(MIGRATION_DIR)
    open(MIGRATION_VERSION_FILE, "w").close()  # Create version file if not exists


def get_current_version():
    """Reads the last applied migration version."""
    if not os.path.exists(MIGRATION_VERSION_FILE):
        return "0000"
    with open(MIGRATION_VERSION_FILE, "r") as f:
        return f.read().strip()


def set_current_version(version):
    """Updates the current migration version."""
    with open(MIGRATION_VERSION_FILE, "w") as f:
        f.write(version)


def run_migrations():
    """Finds and applies new migrations."""
    current_version = get_current_version()

    # Ensure the directory exists before listing files
    if not os.path.exists(MIGRATION_DIR):
        print("⚠️ Migrations directory not found, creating it...")
        os.makedirs(MIGRATION_DIR)
    print(MIGRATION_DIR)
    migration_files = sorted(
        [f for f in os.listdir(MIGRATION_DIR) if f.endswith(".py") and f.startswith("000")]
    )

    if not migration_files:
        print("✅ No new migrations to apply.")
        return

    for migration in migration_files:
        migration_version = migration.split("_")[0]
        # print(current_version)
        # if migration_version > current_version:
        module_name = f"migrations.{migration[:-3]}"  # Remove .py
        migration_module = importlib.import_module(module_name)

        print(f"🚀 Applying migration {migration_version} ...")
        migration_module.upgrade(es)
        set_current_version(migration_version)

    print("✅ All migrations applied successfully!")


if __name__ == "__main__":
    run_migrations()
