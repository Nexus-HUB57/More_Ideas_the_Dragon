#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "$0")" && pwd)"
cd "$root"

link_pkg() {
  local pkg="$1"
  local target="node_modules/$pkg"
  local source
  source="$(find node_modules/.pnpm -path "*/node_modules/$pkg" -type d | head -1 || true)"
  if [[ -z "$source" ]]; then
    echo "missing: $pkg"
    return 0
  fi
  if [[ -e "$target" && ! -L "$target" ]]; then
    echo "present: $pkg"
    return 0
  fi
  if [[ -L "$target" ]]; then
    rm "$target"
  fi
  mkdir -p "$(dirname "$target")"
  ln -s "$root/$source" "$target"
  echo "linked: $pkg -> $source"
}

link_pkg "react"
link_pkg "react-dom"
link_pkg "lucide-react"
link_pkg "typescript"
link_pkg "vite"
link_pkg "tailwindcss"
link_pkg "tw-animate-css"
link_pkg "@vitejs/plugin-react"
link_pkg "@tailwindcss/vite"
link_pkg "@builder.io/vite-plugin-jsx-loc"
link_pkg "vite-plugin-manus-runtime"
link_pkg "@types/node"
link_pkg "tsx"
link_pkg "esbuild"
