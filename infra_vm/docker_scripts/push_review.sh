#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-20}"

ensure_builder
build_and_push \
  "ikeeo/vibecheck-review-service" \
  "${VERSION}" \
  "${BACKEND_DIR}/ReviewService/Gateway/ReviewService.Gateway.Api/Dockerfile" \
  "${BACKEND_DIR}"
