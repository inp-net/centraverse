set -xe

VERSION=0.0.1

echo "{ \"version\": \"$VERSION\", \"commit\": \"$(git rev-parse HEAD)\" }"

docker build -t harbor.k8s.inpt.fr/net7/centraverse:$VERSION .
docker push harbor.k8s.inpt.fr/net7/centraverse:$VERSION
