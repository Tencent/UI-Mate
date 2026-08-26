"""Docker provider factory for the public release."""

from desktop_env.providers.base import Provider, VMManager


def create_vm_manager_and_provider(
    provider_name: str,
    region: str,
) -> tuple[VMManager, Provider]:
    if provider_name.strip().lower() != "docker":
        raise ValueError("This release supports only provider_name='docker'.")

    from desktop_env.providers.docker.manager import DockerVMManager
    from desktop_env.providers.docker.provider import DockerProvider

    return DockerVMManager(), DockerProvider(region)
