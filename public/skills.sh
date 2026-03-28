#!/usr/bin/env bash
# Wesichain Skills Pack — one-line installer
# https://wesichain.pages.dev
#
# Usage:
#   curl -fsSL https://wesichain.pages.dev/skills.sh | bash
#
# Supports: Claude Code, Cursor, Windsurf, GitHub Copilot, Continue.dev, Aider, OpenCode
#
# Options (env vars):
#   WESICHAIN_VERSION   Override version to install (default: latest)
#   WESICHAIN_TOOL      Target tool(s) — auto | all | claude-code | cursor |
#                       windsurf | copilot | continue | aider | opencode
#                       Comma-separated for multiple: cursor,aider
#   WESICHAIN_FORCE     Overwrite existing files without prompting (default: false)

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────

VERSION="${WESICHAIN_VERSION:-0.4.0}"
SKILLS_FILE="wesichain.skills"
DOWNLOAD_URL="https://github.com/wesichain/wesichain/releases/download/v${VERSION}/${SKILLS_FILE}"
WESICHAIN_TOOL="${WESICHAIN_TOOL:-auto}"
WESICHAIN_FORCE="${WESICHAIN_FORCE:-false}"

# ── Colors ────────────────────────────────────────────────────────────────────

RESET="\033[0m"
BOLD="\033[1m"
DIM="\033[2m"
GREEN="\033[32m"
YELLOW="\033[33m"
RED="\033[31m"

info() { printf "  ${DIM}·${RESET} %s\n" "$*"; }
ok()   { printf "  ${GREEN}✓${RESET} %s\n" "$*"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$*"; }
die()  { printf "\n  ${RED}error:${RESET} %s\n\n" "$*" >&2; exit 1; }

# ── Platform: default Claude Code skills dir ──────────────────────────────────

default_claude_dir() {
  case "$(uname -s 2>/dev/null || echo Unknown)" in
    Darwin|Linux) echo "${HOME}/.config/claude/skills" ;;
    MINGW*|CYGWIN*|MSYS*) echo "${APPDATA:-$HOME}/Claude/skills" ;;
    *) echo "${HOME}/.config/claude/skills" ;;
  esac
}

# ── Cleanup ───────────────────────────────────────────────────────────────────

TMP_DIR=""
cleanup() {
  [[ -n "${TMP_DIR}" && -d "${TMP_DIR}" ]] && rm -rf "${TMP_DIR}"
}
trap cleanup EXIT

# ── Download ──────────────────────────────────────────────────────────────────

download_skills() {
  local dest="$1"
  if ! curl -fsSL "${DOWNLOAD_URL}" -o "${dest}" 2>/dev/null; then
    if command -v wget >/dev/null 2>&1; then
      warn "curl failed, trying wget..."
      wget -q "${DOWNLOAD_URL}" -O "${dest}" || return 1
    else
      return 1
    fi
  fi
  [[ -f "${dest}" && -s "${dest}" ]]
}

# ── Tool detection ────────────────────────────────────────────────────────────

detect_tools() {
  local found=()

  # Claude Code
  if command -v claude >/dev/null 2>&1 \
      || [[ -d "${HOME}/.config/claude" ]] \
      || [[ -d "${APPDATA:-/nonexistent}/Claude" ]]; then
    found+=("claude-code")
  fi

  # Cursor
  if command -v cursor >/dev/null 2>&1 \
      || [[ -d "${HOME}/Library/Application Support/Cursor" ]] \
      || [[ -d "${HOME}/.cursor" ]] \
      || [[ -d ".cursor" ]]; then
    found+=("cursor")
  fi

  # Windsurf
  if [[ -d "${HOME}/Library/Application Support/Windsurf" ]] \
      || [[ -d "${HOME}/.codeium" ]] \
      || [[ -d ".windsurf" ]]; then
    found+=("windsurf")
  fi

  # GitHub Copilot (VS Code extension or existing .github/ dir)
  if [[ -d "${HOME}/.vscode/extensions" ]] \
      && ls "${HOME}/.vscode/extensions/github.copilot-"* >/dev/null 2>&1; then
    found+=("copilot")
  elif [[ -d ".github" ]]; then
    found+=("copilot")
  fi

  # Continue.dev
  if [[ -d "${HOME}/.continue" ]] || [[ -d ".continue" ]]; then
    found+=("continue")
  fi

  # Aider
  if command -v aider >/dev/null 2>&1; then
    found+=("aider")
  fi

  # OpenCode
  if command -v opencode >/dev/null 2>&1 \
      || [[ -d "${HOME}/.config/opencode" ]]; then
    found+=("opencode")
  fi

  printf '%s\n' "${found[@]}"
}

# ── Per-tool install ──────────────────────────────────────────────────────────

install_claude_code() {
  local extract_dir="$1"
  local dest="${HOME}/.config/claude/skills"
  [[ -n "${WESICHAIN_SKILLS_DIR:-}" ]] && dest="${WESICHAIN_SKILLS_DIR}"

  mkdir -p "${dest}" || die "Cannot create ${dest}"

  # Copy Claude Code skill folders (root-level directories, not _adapters)
  local installed=0
  for skill_dir in "${extract_dir}"/wesichain-*/; do
    [[ -d "${skill_dir}" ]] || continue
    local skill_name
    skill_name="$(basename "${skill_dir}")"
    local target="${dest}/${skill_name}"

    if [[ -d "${target}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
      warn "  ${skill_name} already installed — skipping (set WESICHAIN_FORCE=true to overwrite)"
      continue
    fi
    cp -r "${skill_dir}" "${dest}/"
    installed=$((installed + 1))
  done

  ok "Claude Code: ${installed} skills → ${dest}/"
}

install_cursor() {
  local extract_dir="$1"
  local src="${extract_dir}/_adapters/cursor"
  local dest=".cursor/rules"

  [[ -d "${src}" ]] || { warn "Cursor adapters not found in tarball"; return 1; }

  mkdir -p "${dest}" || die "Cannot create ${dest}"

  local count=0
  for f in "${src}"/*.mdc; do
    [[ -f "${f}" ]] || continue
    local name
    name="$(basename "${f}")"
    if [[ -f "${dest}/${name}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
      warn "  ${name} already exists — skipping"
      continue
    fi
    cp "${f}" "${dest}/"
    count=$((count + 1))
  done

  ok "Cursor: ${count} rules → ${dest}/"
  info "  Rules activate automatically when relevant (alwaysApply: false)"
}

install_windsurf() {
  local extract_dir="$1"
  local src="${extract_dir}/_adapters/windsurf"
  local dest=".windsurf/rules"

  [[ -d "${src}" ]] || { warn "Windsurf adapters not found in tarball"; return 1; }

  mkdir -p "${dest}" || die "Cannot create ${dest}"

  local count=0
  for f in "${src}"/*.md; do
    [[ -f "${f}" ]] || continue
    local name
    name="$(basename "${f}")"
    if [[ -f "${dest}/${name}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
      warn "  ${name} already exists — skipping"
      continue
    fi
    cp "${f}" "${dest}/"
    count=$((count + 1))
  done

  ok "Windsurf: ${count} rules → ${dest}/"
}

install_copilot() {
  local extract_dir="$1"
  local src="${extract_dir}/_adapters/copilot/copilot-instructions.md"
  local dest=".github/copilot-instructions.md"

  [[ -f "${src}" ]] || { warn "Copilot adapter not found in tarball"; return 1; }

  mkdir -p ".github" || die "Cannot create .github/"

  if [[ -f "${dest}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
    warn "Existing .github/copilot-instructions.md found — appending Wesichain section"
    printf '\n\n' >> "${dest}"
    # Skip the 4-line header and append the skills content
    tail -n +5 "${src}" >> "${dest}"
  else
    cp "${src}" "${dest}"
  fi

  ok "Copilot: installed → ${dest}"
  info "  Copilot reads this automatically for all files in the repo"
}

install_continue() {
  local extract_dir="$1"
  local src="${extract_dir}/_adapters/continue"
  local dest=".continue/rules"

  [[ -d "${src}" ]] || { warn "Continue.dev adapters not found in tarball"; return 1; }

  mkdir -p "${dest}" || die "Cannot create ${dest}"

  local count=0
  for f in "${src}"/*.md; do
    [[ -f "${f}" ]] || continue
    local name
    name="$(basename "${f}")"
    if [[ -f "${dest}/${name}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
      warn "  ${name} already exists — skipping"
      continue
    fi
    cp "${f}" "${dest}/"
    count=$((count + 1))
  done

  ok "Continue.dev: ${count} rules → ${dest}/"
  info "  Rules auto-apply to *.rs files (globs: \"*.rs\")"
}

install_aider() {
  local extract_dir="$1"
  local src="${extract_dir}/_adapters/aider/CONVENTIONS.md"
  local dest="CONVENTIONS.md"

  [[ -f "${src}" ]] || { warn "Aider adapter not found in tarball"; return 1; }

  if [[ -f "${dest}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
    warn "Existing CONVENTIONS.md found — appending Wesichain section"
    printf '\n\n' >> "${dest}"
    # Skip the 4-line header and append the skills content
    tail -n +5 "${src}" >> "${dest}"
  else
    cp "${src}" "${dest}"
  fi

  ok "Aider: installed → ./${dest}"
  info "  Run: aider --read CONVENTIONS.md  (or add to .aider.conf.yml)"
}

install_opencode() {
  local extract_dir="$1"
  local src="${extract_dir}/_adapters/opencode/.opencode/skills"
  local dest="${HOME}/.config/opencode/skills"
  [[ -n "${WESICHAIN_SKILLS_DIR:-}" ]] && dest="${WESICHAIN_SKILLS_DIR}/.opencode/skills"

  [[ -d "${src}" ]] || { warn "OpenCode adapters not found in tarball"; return 1; }

  mkdir -p "${dest}" || die "Cannot create ${dest}"

  local installed=0
  for skill_dir in "${src}"/wesichain-*/; do
    [[ -d "${skill_dir}" ]] || continue
    local skill_name
    skill_name="$(basename "${skill_dir}")"
    local target="${dest}/${skill_name}"

    if [[ -d "${target}" ]] && [[ "${WESICHAIN_FORCE}" != "true" ]]; then
      warn "  ${skill_name} already installed — skipping (set WESICHAIN_FORCE=true to overwrite)"
      continue
    fi
    cp -r "${skill_dir}" "${dest}/"
    installed=$((installed + 1))
  done

  ok "OpenCode: ${installed} skills → ${dest}/"
  info "  Skills auto-discovered by OpenCode's skill tool"
}

# ── Main ──────────────────────────────────────────────────────────────────────

main() {
  printf "\n"
  printf "  ${BOLD}Wesichain Skills Pack${RESET}  ${DIM}v${VERSION}${RESET}\n"
  printf "  ${DIM}Instant Wesichain knowledge for AI coding tools${RESET}\n"
  printf "\n"

  if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
    die "'curl' or 'wget' is required but neither is installed."
  fi

  info "Version    v${VERSION}"

  # Download
  TMP_DIR=$(mktemp -d)
  local tarball="${TMP_DIR}/${SKILLS_FILE}"
  local extract_dir="${TMP_DIR}/extracted"
  mkdir -p "${extract_dir}"

  info "Downloading..."
  if ! download_skills "${tarball}"; then
    die "Download failed.\n  URL: ${DOWNLOAD_URL}\n  Check your connection and that v${VERSION} exists at github.com/wesichain/wesichain/releases"
  fi

  # Extract to temp dir (needed for per-tool adapter installs)
  tar -xzf "${tarball}" -C "${extract_dir}" 2>/dev/null \
    || die "Failed to extract tarball"

  ok "Downloaded wesichain.skills"
  printf "\n"

  # Resolve target tools
  local tools=()

  if [[ "${WESICHAIN_TOOL}" == "all" ]]; then
    tools=(claude-code cursor windsurf copilot continue aider opencode)
  elif [[ "${WESICHAIN_TOOL}" == "auto" ]]; then
    while IFS= read -r t; do
      [[ -n "${t}" ]] && tools+=("${t}")
    done < <(detect_tools)

    if [[ ${#tools[@]} -eq 0 ]]; then
      warn "No supported tools detected — defaulting to Claude Code"
      tools=(claude-code)
    fi
  else
    IFS=',' read -ra tools <<< "${WESICHAIN_TOOL}"
  fi

  info "Installing for: ${tools[*]}"
  printf "\n"

  # Install per tool
  local installed_tools=()
  for tool in "${tools[@]}"; do
    case "${tool}" in
      claude-code) install_claude_code "${extract_dir}" && installed_tools+=("claude-code") ;;
      cursor)      install_cursor      "${extract_dir}" && installed_tools+=("cursor")      ;;
      windsurf)    install_windsurf    "${extract_dir}" && installed_tools+=("windsurf")    ;;
      copilot)     install_copilot     "${extract_dir}" && installed_tools+=("copilot")     ;;
      continue)    install_continue    "${extract_dir}" && installed_tools+=("continue")    ;;
      aider)       install_aider       "${extract_dir}" && installed_tools+=("aider")       ;;
      opencode)    install_opencode    "${extract_dir}" && installed_tools+=("opencode")    ;;
      *) warn "Unknown tool '${tool}' — skipping" ;;
    esac
  done

  printf "\n"

  # Skills summary
  printf "  ${BOLD}11 skills installed:${RESET}\n"
  printf "  ${DIM}wesichain-core  · wesichain-graph   · wesichain-react${RESET}\n"
  printf "  ${DIM}wesichain-rag   · wesichain-llm     · wesichain-memory${RESET}\n"
  printf "  ${DIM}wesichain-tools · wesichain-prompt  · wesichain-checkpoint${RESET}\n"
  printf "  ${DIM}wesichain-embeddings · wesichain-langsmith${RESET}\n"
  printf "\n"

  # Per-tool next steps
  if [[ ${#installed_tools[@]} -gt 0 ]]; then
    printf "  ${BOLD}${GREEN}Ready!${RESET} Try these prompts:\n"
    printf "\n"
    for t in "${installed_tools[@]}"; do
      case "${t}" in
        claude-code) printf "  ${DIM}Claude Code  \"Create a ReAct agent with web search tools\"${RESET}\n" ;;
        cursor)      printf "  ${DIM}Cursor       Open a .rs file and ask about Runnable composition${RESET}\n" ;;
        windsurf)    printf "  ${DIM}Windsurf     Ask about RAG pipelines in your Rust project${RESET}\n" ;;
        copilot)     printf "  ${DIM}Copilot      Autocomplete now uses Wesichain patterns automatically${RESET}\n" ;;
        continue)    printf "  ${DIM}Continue     @wesichain-core in chat, or open a .rs file and ask${RESET}\n" ;;
        aider)       printf "  ${DIM}Aider        aider --read CONVENTIONS.md  (conventions auto-loaded)${RESET}\n" ;;
        opencode)    printf "  ${DIM}OpenCode     Ask about wesichain-core Runnable composition patterns${RESET}\n" ;;
      esac
    done
    printf "\n"
  fi

  printf "  ${DIM}Docs: https://wesichain.pages.dev/docs/claude-code/skills-pack${RESET}\n"
  printf "\n"
}

main "$@"
