docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t gonefladvedotov/vibecheck-subscription-service:1.0 \
  -t gonefladvedotov/vibecheck-subscription-service:latest \
  -f ../../backend/SubscriptionService/Dockerfile \
  ../../backend \
  --push
