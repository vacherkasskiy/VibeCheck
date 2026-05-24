#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-18.1}"

ensure_builder
build_and_push \
  "gonefladvedotov/vibecheck-user-service" \
  "${VERSION}" \
  "${BACKEND_DIR}/UserService/Dockerfile" \
  "${BACKEND_DIR}"
