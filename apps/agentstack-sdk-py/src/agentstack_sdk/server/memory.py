# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0
import asyncio
import os
import uuid
from typing import Any

import asyncpg
import psycopg2
from mem0 import AsyncMemory as AsyncMem
from mem0 import Memory as Mem

os.environ["DB_URL"] = "postgresql://agentstack-user:password@postgresql:5432/agentstack"

config = {
    "vector_store": {
        "provider": "pgvector",
        "config": {
            "connection_string": os.getenv("DB_URL"),
            "embedding_model_dims": 768,
        },
    },
    "llm": {"provider": "ollama", "config": {"model": "llama3.1:8b"}},
    "embedder": {
        "provider": "ollama", 
        "config": {
            "model": "nomic-embed-text:latest", 
            "embedding_dims": 768
            }
        },
    # "graph_store": { 
    #     "provider": "neo4j",
    #     "config": {
    #         "url": os.getenv("NEO4J_URL", "bolt://neo4j:7687"),
    #         "username": os.getenv("NEO4J_USER", "neo4j"),
    #         "password": os.getenv("NEO4J_PASSWORD", "neo4j-password")
    #     }
    # }
}

create_table_str = """
                CREATE TABLE IF NOT EXISTS mem0_history (
                    id           TEXT PRIMARY KEY,
                    memory_id    TEXT,
                    old_memory   TEXT,
                    new_memory   TEXT,
                    event        TEXT,
                    created_at   TIMESTAMP,
                    updated_at   TIMESTAMP,
                    is_deleted   INTEGER,
                    actor_id     TEXT,
                    role         TEXT
                )
            """


class PostgresHistoryManager:
    def __init__(self, connection_string: str):
        self.conn = psycopg2.connect(connection_string)
        self._create_history_table()

    def _create_history_table(self):
        with self.conn.cursor() as cur:
            cur.execute(create_table_str)
            self.conn.commit()

    def add_history(
        self,
        memory_id: str,
        old_memory: str | None,
        new_memory: str | None,
        event: str,
        *,
        created_at: str | None = None,
        updated_at: str | None = None,
        is_deleted: int = 0,
        actor_id: str | None = None,
        role: str | None = None,
    ) -> None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO mem0_history (id, memory_id, old_memory, new_memory, event,
                                    created_at, updated_at, is_deleted, actor_id, role)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    str(uuid.uuid4()),
                    memory_id,
                    old_memory,
                    new_memory,
                    event,
                    created_at,
                    updated_at,
                    is_deleted,
                    actor_id,
                    role,
                ),
            )
            self.conn.commit()

    def get_history(self, memory_id: str) -> list[dict[str, Any]]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, memory_id, old_memory, new_memory, event,
                       created_at, updated_at, is_deleted, actor_id, role
                FROM mem0_history WHERE memory_id = %s
                ORDER BY created_at ASC
            """,
                (memory_id,),
            )
            rows = cur.fetchall()
        return [
            {
                "id": r[0],
                "memory_id": r[1],
                "old_memory": r[2],
                "new_memory": r[3],
                "event": r[4],
                "created_at": r[5],
                "updated_at": r[6],
                "is_deleted": bool(r[7]),
                "actor_id": r[8],
                "role": r[9],
            }
            for r in rows
        ]

    def reset(self) -> None:
        with self.conn.cursor() as cur:
            cur.execute("DROP TABLE IF EXISTS mem0_history")
            self.conn.commit()
        self._create_history_table()

    def close(self) -> None:
        if self.conn:
            self.conn.close()


class AsyncPostgresHistoryManager:
    """Native async PostgreSQL history manager - optimal for AsyncMemory"""

    def __init__(self, pool: asyncpg.Pool):
        self._pool = pool

    @classmethod
    async def create(cls, connection_string: str, min_size: int = 2, max_size: int = 10):
        """Factory method to create manager with connection pool"""
        pool = await asyncpg.create_pool(connection_string, min_size=min_size, max_size=max_size)
        instance = cls(pool)
        await instance._create_history_table()
        return instance

    async def _create_history_table(self) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute(create_table_str)
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_memory_id ON mem0_history(memory_id)")

    async def add_history(
        self,
        memory_id: str,
        old_memory: str | None,
        new_memory: str | None,
        event: str,
        *,
        created_at: str | None = None,
        updated_at: str | None = None,
        is_deleted: int = 0,
        actor_id: str | None = None,
        role: str | None = None,
    ) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO mem0_history
                (id, memory_id, old_memory, new_memory, event, created_at, updated_at, is_deleted, actor_id, role)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """,
                str(uuid.uuid4()),
                memory_id,
                old_memory,
                new_memory,
                event,
                created_at,
                updated_at,
                is_deleted,
                actor_id,
                role,
            )

    async def get_history(self, memory_id: str) -> list[dict[str, Any]]:
        async with self._pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT id, memory_id, old_memory, new_memory, event,
                       created_at, updated_at, is_deleted, actor_id, role
                FROM mem0_history WHERE memory_id = $1
                ORDER BY created_at ASC
            """,
                memory_id,
            )

        return [
            {
                "id": r["id"],
                "memory_id": r["memory_id"],
                "old_memory": r["old_memory"],
                "new_memory": r["new_memory"],
                "event": r["event"],
                "created_at": str(r["created_at"]) if r["created_at"] else None,
                "updated_at": str(r["updated_at"]) if r["updated_at"] else None,
                "is_deleted": bool(r["is_deleted"]),
                "actor_id": r["actor_id"],
                "role": r["role"],
            }
            for r in rows
        ]

    async def reset(self) -> None:
        async with self._pool.acquire() as conn:
            await conn.execute("DROP TABLE IF EXISTS mem0_history")
        await self._create_history_table()

    async def close(self) -> None:
        await self._pool.close()

    # # Sync wrappers for compatibility with Memory class (if needed)
    # def add_history_sync(self, *args, **kwargs):
    #     import asyncio
    #     loop = asyncio.get_event_loop()
    #     return loop.run_until_complete(self.add_history(*args, **kwargs))

    # def get_history_sync(self, *args, **kwargs):
    #     import asyncio
    #     loop = asyncio.get_event_loop()
    #     return loop.run_until_complete(self.get_history(*args, **kwargs))


class Memory(Mem):
    @classmethod
    def from_config(cls, config_dict=config, postgres_conn_string: str = os.getenv("DB_URL", "")):
        instance = super(Memory, cls).from_config(config_dict)
        # Replace SQLite with Postgres
        instance.db = PostgresHistoryManager(postgres_conn_string)
        return instance


class AsyncMemory(AsyncMem):
    @classmethod
    async def from_config(cls, config_dict=config, postgres_conn_string: str = os.getenv("DB_URL", "")):
        instance = await super(AsyncMemory, cls).from_config(config_dict)
        # Replace SQLite with Postgres
        instance.db = await AsyncPostgresHistoryManager.create(postgres_conn_string)
        return instance

        