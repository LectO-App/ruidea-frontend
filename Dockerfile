# Static build of the pasaporte SPA served by unprivileged nginx on port 8080, with the same
# routing as public/_redirects: SPA fallback, and /api/* proxied to the backend (API_UPSTREAM) so
# the session cookie is first-party (needed for Safari/iOS).
#
#   docker build -t ruidea-frontend .
#   docker run -p 8080:8080 -e API_UPSTREAM=https://<backend host> ruidea-frontend
#   az acr build --registry <acr> --image ruidea-frontend:<tag> .
#
# Build arguments (compiled into the bundle; not secret):
#   REACT_APP_SERVER_URL  API base URL as the browser sees it. Default "/api" = same-origin proxy,
#                         as production uses today; one image then serves any environment and
#                         API_UPSTREAM picks the backend at run time. An absolute URL makes the
#                         browser call the API directly (cross-site; see the PR description).
#   REACT_APP_GA_KEY      Google Analytics id; empty (default) disables analytics.

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY public ./public
COPY src ./src
ARG REACT_APP_SERVER_URL=/api
ARG REACT_APP_GA_KEY=
# CI=false: CRA would otherwise fail the build on lint warnings (the GitHub workflow does the same).
# No source maps, as in production today.
ENV REACT_APP_SERVER_URL=$REACT_APP_SERVER_URL \
    REACT_APP_GA_KEY=$REACT_APP_GA_KEY \
    GENERATE_SOURCEMAP=false \
    CI=false
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30-alpine AS runtime
ENV PORT=8080 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/nginx/api-proxy.conf docker/nginx/security-headers.conf /etc/nginx/snippets/
COPY docker/nginx/05-ruidea-env.envsh /docker-entrypoint.d/05-ruidea-env.envsh
COPY --from=build /app/build /usr/share/nginx/html
# The base image already runs as the unprivileged "nginx" user (uid 101).
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/health" || exit 1
