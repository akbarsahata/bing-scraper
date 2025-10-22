# GitHub Actions CI/CD Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Push to Master Branch                     │
│                  or Pull Request to Master                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     Test Workflow                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────┐      ┌────────────────────┐         │
│  │   Unit Tests      │      │    E2E Tests       │         │
│  │                   │      │                    │         │
│  │ • Build packages  │      │ • Install browsers │         │
│  │ • Run Vitest      │      │ • Run Playwright   │         │
│  │ • 22 tests        │      │ • 16 tests         │         │
│  └─────────┬─────────┘      └─────────┬──────────┘         │
│            │                           │                     │
│            └────────────┬──────────────┘                     │
│                         │                                     │
│                    ✅ All Pass?                              │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                    YES   │   NO
                          │    │
                          │    └──────► ❌ Stop (Fix tests)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Deploy Workflow                            │
│              (Only runs if tests pass)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │     Deploy Web App to Cloudflare           │             │
│  │                                             │             │
│  │  • Build production bundle                 │             │
│  │  • Deploy to Cloudflare Workers            │             │
│  │  • Update static assets on Pages           │             │
│  └──────────────────┬──────────────────────────┘             │
│                     │                                         │
│                     │ Success?                                │
│                     │                                         │
│                     ▼                                         │
│  ┌────────────────────────────────────────────┐             │
│  │   Deploy Scraper Worker to Cloudflare      │             │
│  │                                             │             │
│  │  • Build scraper worker                    │             │
│  │  • Deploy queue consumer                   │             │
│  │  • Deploy workflow definitions             │             │
│  └──────────────────┬──────────────────────────┘             │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
                      ▼
              ✅ Deployment Complete!
              🌐 Live on Cloudflare
```

## Workflow Triggers

### Test Workflow
- **Trigger**: `push` or `pull_request` to `master` branch
- **Purpose**: Ensure code quality before merge/deploy
- **Duration**: ~3-5 minutes

### Deploy Workflow
- **Trigger**: `workflow_run` when Test workflow completes successfully
- **Purpose**: Automatically deploy passing code to production
- **Duration**: ~2-3 minutes

## Status Badges

Add to your README:
```markdown
[![Test](https://github.com/akbarsahata/bing-scraper/actions/workflows/test.yml/badge.svg)](https://github.com/akbarsahata/bing-scraper/actions/workflows/test.yml)
[![Deploy](https://github.com/akbarsahata/bing-scraper/actions/workflows/deploy.yml/badge.svg)](https://github.com/akbarsahata/bing-scraper/actions/workflows/deploy.yml)
```

## Key Features

✅ **Parallel Test Execution** - Unit and E2E tests run simultaneously
✅ **Dependency Caching** - pnpm cache speeds up subsequent runs
✅ **Artifact Upload** - Failed E2E tests upload screenshots and reports
✅ **Sequential Deployment** - Web app deploys before scraper worker
✅ **Failure Prevention** - Deploy only runs if all tests pass
✅ **Branch Protection** - Can require passing tests before merge
