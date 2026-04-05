#!/usr/bin/env bash
set -euo pipefail

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

ensure_hosts_entry() {
  local ip="$1"
  local host="$2"
  local hosts_file="/etc/hosts"

  if sudo grep -Eq "^[[:space:]]*${ip}[[:space:]]+.*\b${host}\b" "$hosts_file" || \
     sudo grep -Eq "^[[:space:]]*[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+[[:space:]]+.*\b${host}\b" "$hosts_file"; then
    echo "/etc/hosts already contains '${host}'"
    return 0
  fi

  echo "Adding '${ip} ${host}' to /etc/hosts"
  printf "%s\t%s\n" "$ip" "$host" | sudo tee -a "$hosts_file" >/dev/null
}

ensure_hosts_entries() {
  local ip="${1:-127.0.0.1}"
  ensure_hosts_entry "$ip" "minio.console.local"
  ensure_hosts_entry "$ip" "minio.api.local"
  ensure_hosts_entry "$ip" "gamification.local"
  ensure_hosts_entry "$ip" "review.local"
}

wait_for_ingress_nginx_ready() {
  local ns="ingress-nginx"

  echo "waiting for ingress-nginx namespace..."
  kubectl wait --for=condition=Ready --timeout=180s -n "$ns" pod -l app.kubernetes.io/component=controller >/dev/null

  echo "waiting for ingress-nginx controller rollout..."
  kubectl rollout status -n "$ns" deployment/ingress-nginx-controller --timeout=180s >/dev/null

  # admission webhook: важно дождаться endpoints у сервиса, иначе будет connect refused
  echo "waiting for ingress-nginx admission endpoints..."
  local svc="ingress-nginx-controller-admission"
  local ok=""

  for i in {1..60}; do
    # endpointslice есть всегда на новых версиях k8s
    if kubectl get endpointslice -n "$ns" -l kubernetes.io/service-name="$svc" -o jsonpath='{range .items[*].endpoints[*]}{.conditions.ready}{"\n"}{end}' 2>/dev/null | grep -q "true"; then
      ok="yes"
      break
    fi
    sleep 2
  done

  if [[ -z "$ok" ]]; then
    echo "ingress-nginx admission endpoints did not become ready in time"
    kubectl get pods -n "$ns" -o wide || true
    kubectl get svc -n "$ns" || true
    kubectl get endpointslice -n "$ns" -l kubernetes.io/service-name="$svc" || true
    exit 1
  fi

  echo "ingress-nginx is ready"
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

# 4.1 hosts entries (если tunnel -> 127.0.0.1)
ensure_hosts_entries "127.0.0.1"

# 5. namespace
ensure_namespace "vibecheck"

# 6. ingress addon + ожидание готовности webhook
minikube addons enable ingress
wait_for_ingress_nginx_ready

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

kubectl apply -f ../manifests/my/service
kubectl apply -f ../manifests/my/ingress

sudo minikube tunnel