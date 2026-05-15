#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BACKEND_DIR="${SCRIPT_DIR}/../../backend"
VERSION="${1:-25}"

docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# Usage: sh infra/docker_scripts/push_gamification.sh 16

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t "ikeeo/vibecheck-gamification-service:${VERSION}" \
  -t ikeeo/vibecheck-gamification-service:latest \
  -f "${BACKEND_DIR}/GamificationService/Gateway/GamificationService.Gateway.API/Dockerfile" \
  "${BACKEND_DIR}" \
  --push
