import logging
import os
from typing import Dict

logger = logging.getLogger("desktopenv.getters.gimp")


def get_gimp_config_file(env, config: Dict[str, str]):
    """
    Gets the config setting of GIMP.
    """

    os_type = env.vm_platform
    print(os_type)

    if os_type == "Linux":
        config_path = \
            env.controller.execute_python_command(f"import os; print("
                                                  f"os"
                                                  f".path.expanduser("
                                                  f"'~/.config/GIMP/2.10/"
                                                  f"{config['file_name']}'))")[
                'output'].strip()
    else:
        raise Exception("Unsupported operating system", os_type)

    # Write to eval_cache_dir to avoid polluting gold-standard cache
    _path = os.path.join(env.eval_cache_dir, config["dest"])
    content = env.controller.get_file(config_path)

    if not content:
        logger.error("Failed to get GIMP config file.")
        return None

    with open(_path, "wb") as f:
        f.write(content)

    return _path
