# Configuration of Docker

---

Welcome to the Docker VM Management documentation.

## Prerequisite: Check if your machine supports KVM

We recommend running the VM with KVM support. To check if your hosting platform supports KVM, run

```
egrep -c '(vmx|svm)' /proc/cpuinfo
```

on Linux. If the return value is greater than zero, the processor should be able to support KVM.

## Install Docker

Install [Docker Engine on Linux](https://docs.docker.com/engine/install/).

## Running Experiments

Add the following arguments when initializing `DesktopEnv`: 
- `provider_name`: `docker`
- `os_type`: `Ubuntu`

Please allow for some time to download the virtual machine snapshot on your first run.
