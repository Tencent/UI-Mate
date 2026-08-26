"""
Custom exceptions for the desktop environment.
"""


class ScreenshotUnavailableError(Exception):
    """
    Raised when the VM screenshot service is persistently unreachable.

    After all retries at both the controller (HTTP) layer and the
    observation layer are exhausted, this exception signals that the
    current VM environment is unhealthy and the task should be
    restarted rather than continuing with a ``None`` screenshot.
    """
    pass


class SetupFailedError(Exception):
    """
    Raised when the environment setup phase fails in an unrecoverable way
    (e.g. Chrome remote debugging port unreachable after all retries).

    This signals that the VM environment is unhealthy and the whole
    episode should be restarted with a full environment revert, rather
    than being immediately marked as failed.
    """
    pass
