docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ikeeo/vibecheck-review-service:5.1 \
  -t ikeeo/vibecheck-review-service:latest \
  -f ../../backend/ReviewService/ReviewService.Gateway/Dockerfile \
  ../ \
  --push