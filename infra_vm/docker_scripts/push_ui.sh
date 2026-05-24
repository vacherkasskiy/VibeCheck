#!/usr/bin/env sh
set -eu

. "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)/_build_common.sh"

VERSION="${1:-1.0}"

ensure_builder
docker buildx build \
  --platform "${PLATFORMS}" \
  --build-arg API_URL=/ \
  --build-arg NGINX_CONF=nginx.vm.conf \
  -t "ikeeo/vibecheck-ui:${VERSION}" \
  -t "ikeeo/vibecheck-ui:latest" \
  -f "${REPO_ROOT}/ui/Dockerfile" \
  "${REPO_ROOT}/ui" \
  --push
