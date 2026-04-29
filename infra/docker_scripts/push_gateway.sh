docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t gonefladvedotov/vibecheck-gateway-service:7.0 \
  -t gonefladvedotov/vibecheck-gateway-service:latest \
  -f ../../backend/GatewayService/Dockerfile \
  ../../backend/GatewayService \
  --push
