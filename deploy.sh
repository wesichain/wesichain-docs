#!/usr/bin/env bash
# Wesichain Docs — deploy to Cloudflare Pages
# Usage: ./deploy.sh [--prod]
#   (no flag)  → preview deployment
#   --prod     → production deployment

set -euo pipefail

RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"
CYAN="\033[36m"

info() { printf "  ${DIM}·${RESET} %s\n" "$*"; }
ok()   { printf "  ${GREEN}✓${RESET} %s\n" "$*"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$*"; }
die()  { printf "\n  ${RED}error:${RESET} %s\n\n" "$*" >&2; exit 1; }

# ── Args ──────────────────────────────────────────────────────────────────────

PROD=false
for arg in "$@"; do
  case "$arg" in
    --prod) PROD=true ;;
    *) die "Unknown argument: $arg  (usage: ./deploy.sh [--prod])" ;;
  esac
done

# ── Checks ────────────────────────────────────────────────────────────────────

printf "\n"
printf "  ${BOLD}Wesichain Docs${RESET}  ${DIM}deploy${RESET}\n"
printf "\n"

if ! command -v npm >/dev/null 2>&1; then
  die "'npm' is required but not installed."
fi

if ! command -v wrangler >/dev/null 2>&1; then
  die "'wrangler' is required but not installed.\n  Install: npm install -g wrangler\n  Then: wrangler login"
fi

# ── Build ─────────────────────────────────────────────────────────────────────

info "Building site..."
npm run build

ok "Build complete → dist/"
printf "\n"

# ── Deploy ────────────────────────────────────────────────────────────────────

if $PROD; then
  printf "  ${YELLOW}!${RESET} Deploying to ${BOLD}production${RESET} (wesichain.dev)\n"
  printf "\n"
  wrangler pages deploy dist --project-name=wesichain --branch=main
else
  info "Deploying preview..."
  printf "\n"
  wrangler pages deploy dist --project-name=wesichain
fi

printf "\n"
ok "Done!"
if $PROD; then
  printf "  ${DIM}Live at: https://wesichain.pages.dev${RESET}\n"
else
  printf "  ${DIM}Preview URL printed above${RESET}\n"
fi
printf "\n"
