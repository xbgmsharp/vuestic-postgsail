export GIT_VERSION=`git rev-parse --short HEAD`
VITE_GIT_VERSION=`git rev-parse --short HEAD` NODE_ENV=production npm run build
