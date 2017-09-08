NAME="Delivery Dashboard"
SOURCE=$(git config remote.origin.url | sed -e 's|git@|https://|g' | sed -e 's|github.com:|github.com/|g')
VERSION=$(git describe --always --tag)
COMMIT=$(git log --pretty=format:'%H' -n 1)
echo "{\"name\":\"${NAME}\",\"version\":\"${VERSION}\",\"source\":\"${SOURCE}\",\"commit\":\"${COMMIT}\"}" > src/version.json

