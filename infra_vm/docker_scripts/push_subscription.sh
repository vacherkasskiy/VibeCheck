#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-6.0}"

ensure_builder
build_and_push \
  "gonefladvedotov/vibecheck-subscription-service" \
  "${VERSION}" \
  "${BACKEND_DIR}/SubscriptionService/Dockerfile" \
  "${BACKEND_DIR}"
