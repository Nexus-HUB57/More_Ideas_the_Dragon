#!/bin/sh
set -eu

load_secret() {
  name="$1"
  file_name="${name}_FILE"
  file_path="$(printenv "$file_name" 2>/dev/null || true)"
  if [ -n "$file_path" ] && [ -r "$file_path" ]; then
    export "$name=$(cat "$file_path")"
  fi
}

load_secret DATABASE_URL
load_secret JWT_SECRET
load_secret OAUTH_SERVER_URL
load_secret OWNER_OPEN_ID
load_secret BUILT_IN_FORGE_API_KEY

exec "$@"
