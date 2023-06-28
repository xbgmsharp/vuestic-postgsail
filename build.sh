
if [[ -z "${VITE_PGSAIL_URL}" ]]; then
  echo "VITE_PGSAIL_URL is undefined"
  exit 1
fi

export GIT_VERSION=`git rev-parse --short HEAD`
VITE_GIT_VERSION=`git rev-parse --short HEAD` NODE_ENV=production npm run build
