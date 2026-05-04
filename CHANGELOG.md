# Changelog

All notable changes to CityExpress Frontend G15 are documented here.

## [1.1.0] - 2026-05-04

### Features
- **frontend**: add packages and routes views with mocks
- **frontend**: add API service using mocks
- **frontend**: add Auth0 integration
- **frontend**: add integration with real API (backend)
- **ui**: improve styles and layout

### Fixes
- **api**: handle protected data responses after auth
- **auth**: wire setTokenProvider and switch services to httpClient
- fix navbar to pass app smoke test heading
- fix tests and delete unused variables

### Tests
- align fetch mocks with httpClient response.text() usage

### Docs
- add AI usage documentation for frontend sessions

## [1.0.0] - 2026-04-29

- Initial release — CI verde, Copilot fixes, httpClient, unit tests (coverage 96.91%), Auth0 config, architecture docs.
