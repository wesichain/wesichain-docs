# Contributing to Wesichain

Thank you for your interest in contributing to Wesichain! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/wesichain.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `cargo test`
6. Commit with a descriptive message
7. Push and open a pull request

## Development Setup

### Prerequisites

- Rust 1.75+ (`rustup update`)
- Cargo
- (Optional) `cargo-nextest` for better test output: `cargo install cargo-nextest`

### Building

```bash
cd wesichain/
cargo build
```

For release builds:
```bash
cargo build --release
```

### Running Tests

```bash
# All tests
cargo test

# With nextest (recommended)
cargo nextest run

# Specific package
cargo test -p wesichain-core

# Specific test
cargo test test_name
```

### Code Quality

```bash
# Formatting
cargo fmt

# Linting
cargo clippy --all-targets --all-features

# Check all packages
cargo check --workspace
```

## Project Structure

```
wesichain/
├── wesichain/              # Umbrella crate
├── wesichain-core/         # Core traits
├── wesichain-prompt/       # Prompt templates
├── wesichain-llm/          # LLM providers
├── wesichain-agent/        # ReAct agent
├── wesichain-graph/        # Graph execution
├── wesichain-retrieval/    # Text splitting, documents
├── wesichain-rag/          # RAG pipelines
├── wesichain-embeddings/   # Embeddings
├── wesichain-checkpoint-sqlite/    # SQLite persistence
├── wesichain-checkpoint-postgres/  # PostgreSQL persistence
└── wesichain-langsmith/    # Observability
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

Scopes (examples):
- `core`, `agent`, `graph`, `llm`, `prompt`, `retrieval`, `rag`

Examples:
```
feat(agent): add streaming support for tool results

fix(core): handle timeout errors in retry logic

docs(graph): add checkpointing examples
```

## Pull Request Process

1. **Title**: Follow conventional commit format
2. **Description**: Explain what changed and why
3. **Tests**: Add tests for new functionality
4. **Documentation**: Update docs if needed
5. **Changelog**: Add entry to CHANGELOG.md if applicable

### PR Checklist

- [ ] Tests pass (`cargo test`)
- [ ] Code is formatted (`cargo fmt`)
- [ ] No clippy warnings (`cargo clippy`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for user-facing changes)

## Testing Guidelines

### Unit Tests

- Test public APIs
- Mock external dependencies (LLM providers, etc.)
- Use `tokio::test` for async tests

```rust
#[tokio::test]
async fn test_my_feature() {
    let mock_llm = MockLlm::new(vec!["response".to_string()]);
    let result = my_function(mock_llm).await.unwrap();
    assert_eq!(result, "expected");
}
```

### Integration Tests

- Test in `tests/` directories
- May use real dependencies sparingly
- Focus on user-facing behavior

## Documentation

- Use `///` for public API documentation
- Include examples in doc comments
- Run `cargo doc` to preview

```rust
/// Does something useful.
///
/// # Example
///
/// ```
/// use wesichain_core::MyStruct;
///
/// let s = MyStruct::new();
/// assert!(s.is_ready());
/// ```
pub fn my_function() { ... }
```

## Adding a New Crate

1. Create directory: `wesichain-my-crate/`
2. Add `Cargo.toml` with workspace metadata
3. Add to root `Cargo.toml` workspace members
4. Create `src/lib.rs` with crate documentation
5. Add tests in `src/` and `tests/`

## Feature Flags

When adding optional functionality:

```toml
[features]
default = []
full = ["serde", "tracing"]
serde = ["dep:serde", "dep:serde_json"]
tracing = ["dep:tracing"]
```

## Security

- Never commit secrets or API keys
- Report security issues privately to security@wesichain.dev
- Follow Rust security best practices

## Getting Help

- Discord: [discord.gg/wesichain](https://discord.gg/wesichain)
- GitHub Discussions: Use for questions and ideas
- Issues: Use for bug reports and feature requests

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what's best for the community
- Show empathy towards others

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (Apache-2.0 OR MIT).
