#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "${SCRIPT_DIR}/../.." && pwd)
BACKEND_DIR="${REPO_ROOT}/backend"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"
BUILDX_BUILDER="${BUILDX_BUILDER:-vibecheck-multi}"

ensure_builder() {
  if docker buildx inspect "${BUILDX_BUILDER}" >/dev/null 2>&1; then
    docker buildx use "${BUILDX_BUILDER}"
  else
    docker buildx create --name "${BUILDX_BUILDER}" --use
  fi

  docker buildx inspect --bootstrap
}

build_and_push() {
  image="$1"
  version="$2"
  dockerfile="$3"
  context="$4"

  docker buildx build \
    --platform "${PLATFORMS}" \
    -t "${image}:${version}" \
    -t "${image}:latest" \
    -f "${dockerfile}" \
    "${context}" \
    --push
}
