# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0

from procrastinate import Blueprint

from agentstack_server.jobs.queues import Queues

blueprint = Blueprint()


@blueprint.task(queue=str(Queues.PROVIDER_DISCOVERY))
async def discover_provider(provider_discovery_id: str):
    pass
