# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0

from typing import Annotated
from uuid import UUID

import fastapi
from fastapi import Depends

from agentstack_server.api.dependencies import RequiresPermissions
from agentstack_server.api.schema.provider_discovery import CreateDiscoveryRequest
from agentstack_server.domain.models.permissions import AuthorizedUser
from agentstack_server.domain.models.provider_discovery import DiscoveryState, ProviderDiscovery

router = fastapi.APIRouter()


@router.post("")
async def create_provider_discovery(
    user: Annotated[AuthorizedUser, Depends(RequiresPermissions(providers={"write"}))],
    request: CreateDiscoveryRequest,
) -> ProviderDiscovery:
    return ProviderDiscovery(
        status=DiscoveryState.PENDING,
        provider_id=request.provider_id,
        created_by=user.user.id,
    )


@router.get("/{id}")
async def get_provider_discovery(
    _: Annotated[AuthorizedUser, Depends(RequiresPermissions(providers={"read"}))],
    id: UUID,
) -> ProviderDiscovery:
    raise fastapi.HTTPException(status_code=404, detail="Not found")
