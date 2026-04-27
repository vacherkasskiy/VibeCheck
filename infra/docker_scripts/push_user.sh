docker buildx create --name multi --use || docker buildx use multi
docker buildx inspect --bootstrap

# CHANGE VERSION BEFORE PUSH

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t gonefladvedotov/vibecheck-user-service:9.1 \
  -t gonefladvedotov/vibecheck-user-service:latest \
  -f ../../backend/UserService/Dockerfile \
  ../../backend \
  --push
