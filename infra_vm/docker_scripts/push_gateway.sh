#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-16.0}"

ensure_builder
build_and_push \
  "gonefladvedotov/vibecheck-gateway-service" \
  "${VERSION}" \
  "${BACKEND_DIR}/GatewayService/Dockerfile" \
  "${BACKEND_DIR}/GatewayService"
