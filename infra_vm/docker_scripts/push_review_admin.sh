#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-1.0}"

ensure_builder
build_and_push \
  "ikeeo/vibecheck-review-admin-service" \
  "${VERSION}" \
  "${BACKEND_DIR}/ReviewService/Gateway/ReviewService.Admin.Api/Dockerfile" \
  "${BACKEND_DIR}"
