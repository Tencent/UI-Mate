"""Build the Docker/Ubuntu ``DesktopEnv`` shipped in this release."""

from __future__ import annotations

import logging

logger = logging.getLogger("desktopenv.env_factory")


def resolve_stack(os_type: str = "Ubuntu") -> None:
    """Validate the environment supported by this release."""
    if os_type != "Ubuntu":
        raise ValueError(
            f"Unsupported os_type={os_type!r}; this distribution supports only 'Ubuntu'."
        )


def build_desktop_env(
    *,
    provider_name: str = "docker",
    os_type: str = "Ubuntu",
    **env_kwargs,
):
    """Construct the Docker/Ubuntu ``DesktopEnv``."""
    resolve_stack(os_type)
    if provider_name != "docker":
        raise ValueError("This release supports only provider_name='docker'.")

    from desktop_env.desktop_env import DesktopEnv

    logger.info(
        "Building DesktopEnv: provider=%s os_type=%s",
        provider_name,
        os_type,
    )
    return DesktopEnv(provider_name=provider_name, os_type=os_type, **env_kwargs)
