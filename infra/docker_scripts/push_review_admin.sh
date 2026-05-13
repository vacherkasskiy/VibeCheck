#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKEND_DIR="${SCRIPT_DIR}/../../backend"

docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ikeeo/vibecheck-review-admin-service:1.0 \
  -t ikeeo/vibecheck-review-admin-service:latest \
  -f "${BACKEND_DIR}/ReviewService/Gateway/ReviewService.Admin.Api/Dockerfile" \
  "${BACKEND_DIR}" \
  --push
