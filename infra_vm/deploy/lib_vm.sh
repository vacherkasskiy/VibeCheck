#!/usr/bin/env bash

INFRA_VM_DIR=$(CDPATH= cd -- "${SCRIPT_DIR}/.." && pwd)
MANIFESTS_DIR="${INFRA_VM_DIR}/manifests"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-${SCRIPT_DIR}/.env}"
HELM_TIMEOUT="${HELM_TIMEOUT:-10m}"
RENDERED_MANIFESTS_DIR=""

load_deploy_env() {
  if [[ ! -f "${DEPLOY_ENV_FILE}" ]]; then
    echo "deploy env file not found: ${DEPLOY_ENV_FILE}"
    echo "create it from ${SCRIPT_DIR}/env.example and rerun the script"
    exit 1
  fi

  set -a
  source "${DEPLOY_ENV_FILE}"
  set +a

  NAMESPACE="${NAMESPACE:-vibecheck}"
  VM_PUBLIC_IP="${VM_PUBLIC_IP:-66.151.43.218}"
  BASE_DOMAIN="${BASE_DOMAIN:-${VM_PUBLIC_IP}.sslip.io}"
  INGRESS_CLASS_NAME="${INGRESS_CLASS_NAME:-traefik}"
  KUBECONFIG="${KUBECONFIG:-/etc/rancher/k3s/k3s.yaml}"
  MINIO_PUBLIC_ENDPOINT="${MINIO_PUBLIC_ENDPOINT:-http://minio.api.${BASE_DOMAIN}}"
  KIBANA_PUBLIC_BASE_URL="${KIBANA_PUBLIC_BASE_URL:-http://kibana.${BASE_DOMAIN}}"

  export NAMESPACE VM_PUBLIC_IP BASE_DOMAIN INGRESS_CLASS_NAME KUBECONFIG
  export MINIO_PUBLIC_ENDPOINT KIBANA_PUBLIC_BASE_URL
}

require_command() {
  local cmd="$1"
  local hint="${2:-install it and rerun the script}"

  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "${cmd} not found: ${hint}"
    exit 1
  fi
}

ensure_envsubst() {
  if command -v envsubst >/dev/null 2>&1; then
    return 0
  fi

  echo "envsubst not found, installing gettext-base..."
  local maybe_sudo=()
  if [[ "${EUID}" -ne 0 ]]; then
    maybe_sudo=(sudo)
  fi

  "${maybe_sudo[@]}" apt-get update
  "${maybe_sudo[@]}" apt-get install -y gettext-base
}

require_vm_tooling() {
  require_command kubectl "k3s should create /usr/local/bin/kubectl"
  require_command helm "install Helm 3 on the VM"
  ensure_envsubst
}

ensure_k3s_ready() {
  if [[ ! -r "${KUBECONFIG}" ]]; then
    echo "KUBECONFIG is not readable: ${KUBECONFIG}"
    echo "run as root or set KUBECONFIG to a readable k3s kubeconfig"
    exit 1
  fi

  echo "checking k3s node readiness..."
  kubectl get nodes
  kubectl wait --for=condition=Ready node --all --timeout=180s

  if ! kubectl get ingressclass "${INGRESS_CLASS_NAME}" >/dev/null 2>&1; then
    echo "ingress class '${INGRESS_CLASS_NAME}' was not found"
    echo "k3s normally installs Traefik as ingress class 'traefik'"
    kubectl get ingressclass || true
    exit 1
  fi

  if kubectl -n kube-system get deployment traefik >/dev/null 2>&1; then
    echo "waiting for Traefik..."
    kubectl -n kube-system rollout status deployment/traefik --timeout=300s
  fi
}

ensure_namespace() {
  kubectl get namespace "${NAMESPACE}" >/dev/null 2>&1 || kubectl create namespace "${NAMESPACE}"
  kubectl config set-context --current --namespace="${NAMESPACE}" >/dev/null
}

render_manifests() {
  RENDERED_MANIFESTS_DIR=$(mktemp -d "${TMPDIR:-/tmp}/vibecheck-vm-manifests.XXXXXX")
  local vars='${NAMESPACE} ${BASE_DOMAIN} ${INGRESS_CLASS_NAME} ${MINIO_PUBLIC_ENDPOINT} ${KIBANA_PUBLIC_BASE_URL}'

  while IFS= read -r -d '' file; do
    local rel="${file#${MANIFESTS_DIR}/}"
    local dest="${RENDERED_MANIFESTS_DIR}/${rel}"
    mkdir -p "$(dirname "${dest}")"
    envsubst "${vars}" < "${file}" > "${dest}"
  done < <(find "${MANIFESTS_DIR}" -type f -name '*.yaml' -print0)

  echo "rendered manifests into ${RENDERED_MANIFESTS_DIR}"
}

cleanup_rendered_manifests() {
  if [[ -n "${RENDERED_MANIFESTS_DIR}" && -d "${RENDERED_MANIFESTS_DIR}" ]]; then
    rm -rf "${RENDERED_MANIFESTS_DIR}"
  fi
}

add_helm_repos() {
  local with_observability="${1:-false}"

  helm repo add bitnami https://charts.bitnami.com/bitnami >/dev/null 2>&1 || true

  if [[ "${with_observability}" == "true" ]]; then
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null 2>&1 || true
    helm repo add grafana https://grafana.github.io/helm-charts >/dev/null 2>&1 || true
  fi

  helm repo update
}

helm_upgrade_wait() {
  helm upgrade --install "$@" --wait --timeout "${HELM_TIMEOUT}"
}

install_core_infra() {
  helm_upgrade_wait postgres bitnami/postgresql \
    -n "${NAMESPACE}" \
    -f "${RENDERED_MANIFESTS_DIR}/pgsql_values.yaml"

  helm_upgrade_wait redis bitnami/redis \
    -n "${NAMESPACE}" \
    -f "${RENDERED_MANIFESTS_DIR}/redis_values.yaml"

  helm_upgrade_wait minio bitnami/minio \
    -n "${NAMESPACE}" \
    -f "${RENDERED_MANIFESTS_DIR}/minio_values.yaml"

  helm_upgrade_wait kafka bitnami/kafka \
    -n "${NAMESPACE}" \
    -f "${RENDERED_MANIFESTS_DIR}/kafka_values.yaml"
}

install_observability_infra() {
  helm_upgrade_wait prometheus prometheus-community/prometheus \
    -n "${NAMESPACE}" \
    -f "${RENDERED_MANIFESTS_DIR}/prometheus_values.yaml"

  helm_upgrade_wait grafana grafana/grafana \
    -n "${NAMESPACE}" \
    -f "${RENDERED_MANIFESTS_DIR}/grafana_values.yaml"
}

wait_for_kafka_ready() {
  echo "waiting for kafka controller..."
  kubectl -n "${NAMESPACE}" rollout status statefulset/kafka-controller --timeout=600s

  echo "waiting for kafka broker..."
  kubectl -n "${NAMESPACE}" rollout status statefulset/kafka-broker --timeout=600s

  echo "kafka is ready"
}

create_kafka_topics() {
  echo "creating kafka topics..."
  kubectl delete job -n "${NAMESPACE}" kafka-topic-admin --ignore-not-found >/dev/null

  kubectl apply -n "${NAMESPACE}" -f - <<'YAML'
apiVersion: batch/v1
kind: Job
metadata:
  name: kafka-topic-admin
spec:
  backoffLimit: 3
  ttlSecondsAfterFinished: 300
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: kafka-topic-admin
          image: docker.io/bitnamilegacy/kafka:4.0.0-debian-12-r10
          imagePullPolicy: IfNotPresent
          env:
            - name: KAFKA_CLIENT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: kafka-user-passwords
                  key: client-passwords
            - name: KAFKA_HEAP_OPTS
              value: "-Xms64m -Xmx128m"
          resources:
            requests:
              cpu: 50m
              memory: 128Mi
            limits:
              cpu: 250m
              memory: 256Mi
          command:
            - /bin/bash
            - -ec
          args:
            - |
              CLIENT_PROPS=/tmp/client.properties
              CLIENT_PASSWORD="${KAFKA_CLIENT_PASSWORD%%,*}"

              printf '%s\n' \
                "security.protocol=SASL_PLAINTEXT" \
                "sasl.mechanism=PLAIN" \
                "sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required username=\"app_user\" password=\"${CLIENT_PASSWORD}\";" \
                > "$CLIENT_PROPS"

              for topic in reviews-written reviews-updated reviews-liked gamification-achievement gamification-level subscriptions users reports; do
                /opt/bitnami/kafka/bin/kafka-topics.sh \
                  --create \
                  --if-not-exists \
                  --bootstrap-server kafka:9092 \
                  --command-config "$CLIENT_PROPS" \
                  --topic "$topic" \
                  --partitions 1 \
                  --replication-factor 1
              done

              echo "listing kafka topics..."
              /opt/bitnami/kafka/bin/kafka-topics.sh \
                --list \
                --bootstrap-server kafka:9092 \
                --command-config "$CLIENT_PROPS"
YAML

  if ! kubectl wait -n "${NAMESPACE}" --for=condition=complete --timeout=300s job/kafka-topic-admin; then
    kubectl logs -n "${NAMESPACE}" job/kafka-topic-admin || true
    kubectl describe job -n "${NAMESPACE}" kafka-topic-admin || true
    exit 1
  fi

  kubectl logs -n "${NAMESPACE}" job/kafka-topic-admin || true
}

apply_runtime_secrets() {
  : "${USER_SERVICE_SMTP_PASSWORD:?USER_SERVICE_SMTP_PASSWORD is required in ${DEPLOY_ENV_FILE}}"

  kubectl create secret generic user-service-mail-secrets \
    -n "${NAMESPACE}" \
    --from-literal=SPRING_MAIL_PASSWORD="${USER_SERVICE_SMTP_PASSWORD}" \
    --dry-run=client \
    -o yaml | kubectl apply -f -
}

apply_service_manifests() {
  kubectl apply -f "${RENDERED_MANIFESTS_DIR}/my/service"
}

apply_app_ingresses() {
  local ingress_dir="${RENDERED_MANIFESTS_DIR}/my/ingress"
  local files=(
    gateway_ingress.yaml
    review_admin_ingress.yaml
    user_ingress.yaml
    minio_console_ingress.yaml
    minio_api_ingress.yaml
    gamification_ingress.yaml
    review_ingress.yaml
    kafka_ui_ingress.yaml
  )

  for file in "${files[@]}"; do
    kubectl apply -f "${ingress_dir}/${file}"
  done
}

apply_observability_manifests() {
  kubectl delete job -n "${NAMESPACE}" kibana-init-data-view --ignore-not-found >/dev/null
  kubectl apply -f "${RENDERED_MANIFESTS_DIR}/my/observability/elastic_stack.yaml"
  kubectl apply -f "${RENDERED_MANIFESTS_DIR}/my/observability/filebeat_daemonset.yaml"
  kubectl apply -f "${RENDERED_MANIFESTS_DIR}/my/observability/kibana_ingress.yaml"
  kubectl apply -f "${RENDERED_MANIFESTS_DIR}/my/ingress/grafana_ingress.yaml"
}

wait_for_app_rollouts() {
  local deployments=(
    gateway-service
    user-service
    subscription-service
    review-service
    review-admin-service
    gamification-service
    gamification-kafka-consumers
    kafka-ui
  )

  for deployment in "${deployments[@]}"; do
    kubectl -n "${NAMESPACE}" rollout status "deployment/${deployment}" --timeout=420s
  done
}

wait_for_observability_rollouts() {
  kubectl -n "${NAMESPACE}" rollout status statefulset/elasticsearch --timeout=600s
  kubectl -n "${NAMESPACE}" rollout status deployment/kibana --timeout=600s
  kubectl -n "${NAMESPACE}" rollout status daemonset/filebeat --timeout=300s
  kubectl wait -n "${NAMESPACE}" --for=condition=complete --timeout=300s job/kibana-init-data-view || true
}

print_access_urls() {
  local with_observability="${1:-false}"

  echo
  echo "VibeCheck VM deployment is ready."
  echo "Gateway:      http://gateway.${BASE_DOMAIN}"
  echo "User:         http://user.${BASE_DOMAIN}"
  echo "Review:       http://review.${BASE_DOMAIN}"
  echo "Review admin: http://review-admin.${BASE_DOMAIN}"
  echo "Gamification: http://gamification.${BASE_DOMAIN}"
  echo "Kafka UI:     http://kafka-ui.${BASE_DOMAIN}"
  echo "MinIO API:    http://minio.api.${BASE_DOMAIN}"
  echo "MinIO UI:     http://minio.console.${BASE_DOMAIN}"

  if [[ "${with_observability}" == "true" ]]; then
    echo "Grafana:      http://grafana.${BASE_DOMAIN}"
    echo "Kibana:       http://kibana.${BASE_DOMAIN}"
  fi
  echo
}
