# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0

from enum import StrEnum
from uuid import UUID, uuid4

from a2a.types import AgentCard
from pydantic import AwareDatetime, BaseModel, Field

from agentstack_server.utils.utils import utc_now


class DiscoveryState(StrEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ProviderDiscovery(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    created_at: AwareDatetime = Field(default_factory=utc_now)
    status: DiscoveryState
    provider_id: UUID
    created_by: UUID
    agent_card: AgentCard | None = None
    error_message: str | None = None
