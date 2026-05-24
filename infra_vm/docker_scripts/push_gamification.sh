#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-25}"

ensure_builder
build_and_push \
  "ikeeo/vibecheck-gamification-service" \
  "${VERSION}" \
  "${BACKEND_DIR}/GamificationService/Gateway/GamificationService.Gateway.API/Dockerfile" \
  "${BACKEND_DIR}"
