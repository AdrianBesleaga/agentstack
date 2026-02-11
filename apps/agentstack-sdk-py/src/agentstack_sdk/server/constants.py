# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0

from __future__ import annotations

from typing import Final

from agentstack_sdk.a2a.extensions import BaseExtensionServer
from agentstack_sdk.a2a.extensions.services.platform import PlatformApiExtensionServer, PlatformApiExtensionSpec
from agentstack_sdk.a2a.extensions.ui.error import ErrorExtensionParams, ErrorExtensionServer, ErrorExtensionSpec

DEFAULT_IMPLICIT_EXTENSIONS: Final[dict[str, BaseExtensionServer]] = {
    ErrorExtensionSpec.URI: ErrorExtensionServer(ErrorExtensionSpec(ErrorExtensionParams())),
    PlatformApiExtensionSpec.URI: PlatformApiExtensionServer(PlatformApiExtensionSpec()),
}


__all__ = []
