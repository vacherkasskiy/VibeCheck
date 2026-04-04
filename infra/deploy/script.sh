#!/usr/bin/env bash
set -euo pipefail

# перейти в директорию скрипта, чтобы относительные пути работали стабильно
cd "$(dirname "$0")"

ensure_command() {
  local cmd="$1"
  local install_cmd="$2"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "$cmd not found, installing..."
    eval "$install_cmd"
  else
    echo "$cmd is already installed"
  fi
}

ensure_minikube_running() {
  if ! minikube status --format='{{.Host}}' 2>/dev/null | grep -qx "Running"; then
    echo "minikube is not running, starting..."
    minikube start --driver=docker
  else
    echo "minikube is already running"
  fi
}

ensure_namespace() {
  local ns="$1"
  kubectl get namespace "$ns" >/dev/null 2>&1 || kubectl create namespace "$ns"
}

# 1. проверить brew
if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is not installed. Install it first, then rerun the script."
  exit 1
fi

# 2. проверить minikube
ensure_command "minikube" "brew install minikube"

# 3. проверить kubectl
ensure_command "kubectl" "brew install kubectl"

# 4. запустить minikube, если не запущен
ensure_minikube_running

# 5. namespace
ensure_namespace "vibecheck"

# 6. ingress addon
minikube addons enable ingress

# 7. helm
ensure_command "helm" "brew install helm"

helm repo add bitnami https://charts.bitnami.com/bitnami || true
helm repo update

helm upgrade --install postgres bitnami/postgresql \
  -n vibecheck \
  -f ../manifests/pgsql_values.yaml

helm upgrade --install minio bitnami/minio \
  -n vibecheck \
  -f ../manifests/minio_values.yaml

#helm upgrade --install kafka bitnami/kafka \
#  -n vibecheck \
#  -f ../manifests/kafka_values.yaml

kubectl apply -f ../manifests/ingress.yaml

sudo minikube tunnel