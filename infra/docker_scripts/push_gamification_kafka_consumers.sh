docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ikeeo/vibecheck-gamification-kafka-consumers:2.0 \
  -t ikeeo/vibecheck-gamification-kafka-consumers:latest \
  -f ./GamificationService/Gateway/GamificationService.Gateway.Kafka/Dockerfile \
  . \
  --push
