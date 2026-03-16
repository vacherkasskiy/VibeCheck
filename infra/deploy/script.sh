kubectl create namespace vibecheck || true

minikube addons enable ingress

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm upgrade --install postgres bitnami/postgresql \
  -n vibecheck \
  -f ../manifests/pgsql_values.yaml

helm upgrade --install minio bitnami/minio \
  -n vibecheck \
  -f ../manifests/minio_values.yaml

helm upgrade --install kafka bitnami/kafka \
  -n vibecheck \
  -f ../manifests/kafka_values.yaml

kubectl apply -f ../manifests/ingress.yaml

sudo minikube tunnel