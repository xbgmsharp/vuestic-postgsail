export GIT_VERSION=`git rev-parse --short HEAD`
VITE_GIT_VERSION=`git rev-parse --short HEAD` npm run dev -- --host 0.0.0.0 --port 8080