docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ikeeo/vibecheck-gamification-service:16 \
  -t ikeeo/vibecheck-gamification-service:latest \
  -f ../../backend/GamificationService/Gateway/GamificatonService.Gateway.API/Dockerfile \
  ../../backend \
  --push
