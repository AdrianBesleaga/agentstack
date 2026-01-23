# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0

from uuid import UUID

from pydantic import BaseModel


class CreateDiscoveryRequest(BaseModel):
    provider_id: UUID
