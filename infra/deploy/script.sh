kubectl create namespace vibecheck || true

minikube addons enable ingress

helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm upgrade --install postgres bitnami/postgresql \
  -n vibecheck \
  -f ../review_service/pgsql_values.yaml

helm upgrade --install minio bitnami/minio \
  -n vibecheck \
  -f ../review_service/minio_values.yaml

kubectl apply -f ../review_service/ingress.yaml

sudo minikube tunnel