#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=./lib_vm.sh
source "${SCRIPT_DIR}/lib_vm.sh"

load_deploy_env
require_vm_tooling
ensure_k3s_ready
ensure_namespace
render_manifests
trap cleanup_rendered_manifests EXIT

add_helm_repos true
install_core_infra
wait_for_kafka_ready
create_kafka_topics

install_observability_infra
apply_runtime_secrets
apply_service_manifests
apply_app_ingresses
apply_observability_manifests

wait_for_app_rollouts
wait_for_observability_rollouts
print_access_urls true
