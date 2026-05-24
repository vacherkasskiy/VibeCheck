#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-2.0}"

ensure_builder
build_and_push \
  "ikeeo/vibecheck-gamification-kafka-consumers" \
  "${VERSION}" \
  "${BACKEND_DIR}/GamificationService/Gateway/GamificationService.Gateway.Kafka/Dockerfile" \
  "${BACKEND_DIR}"
