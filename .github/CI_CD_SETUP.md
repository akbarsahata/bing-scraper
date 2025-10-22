# CI/CD Setup Instructions

## Overview

This project uses GitHub Actions for continuous integration and deployment:
- **Test Workflow**: Runs unit tests and E2E tests on every push/PR to master
- **Deploy Workflow**: Automatically deploys to Cloudflare after tests pass

## Workflow Files

- `.github/workflows/test.yml` - Runs tests (unit + E2E)
- `.github/workflows/deploy.yml` - Deploys to Cloudflare (triggered after test success)

## Setup Instructions

### 1. Configure Cloudflare API Token

You need to create a Cloudflare API token and add it as a GitHub secret.

#### Create Cloudflare API Token:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on your profile → **API Tokens**
3. Click **Create Token**
4. Use the **Edit Cloudflare Workers** template or create custom token with:
   - **Permissions**:
     - Account - Cloudflare Workers - Edit
     - Account - Account Settings - Read
     - Zone - Workers Routes - Edit
   - **Account Resources**: Include your account
   - **Zone Resources**: All zones (or specific zones)

5. Click **Continue to summary** → **Create Token**
6. Copy the token (you won't be able to see it again)

#### Add to GitHub Secrets:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Value: Paste your Cloudflare API token
6. Click **Add secret**

### 2. Update Wrangler Configuration

Ensure your `wrangler.jsonc` files have the correct account ID:

```jsonc
{
  "account_id": "your-account-id-here"
}
```

You can find your account ID in the Cloudflare dashboard URL or run:
```bash
wrangler whoami
```

### 3. Test the Workflows

#### Trigger Test Workflow:
- Push to master branch: `git push origin master`
- Create a pull request to master

#### Check Workflow Status:
1. Go to your GitHub repository
2. Click **Actions** tab
3. View workflow runs and their status

## Workflow Details

### Test Workflow (`test.yml`)

Runs on:
- Every push to master
- Every pull request to master

Jobs:
1. **Unit Tests**
   - Runs on Ubuntu latest
   - Installs dependencies with pnpm
   - Builds data package
   - Runs unit tests in `packages/data`

2. **E2E Tests**
   - Runs on Ubuntu latest
   - Installs Playwright and Chromium
   - Runs E2E tests in `apps/web`
   - Uploads test artifacts on failure (screenshots, reports)

### Deploy Workflow (`deploy.yml`)

Runs on:
- After Test workflow completes successfully
- Only on master branch

Jobs:
1. **Deploy Web App**
   - Deploys `apps/web` to Cloudflare Workers
   - Requires `CLOUDFLARE_API_TOKEN` secret

2. **Deploy Scraper Worker**
   - Deploys `apps/scraper` to Cloudflare Workers
   - Runs after web app deployment succeeds
   - Requires `CLOUDFLARE_API_TOKEN` secret

## Workflow Features

### Caching
- Uses pnpm store cache to speed up installations
- Cache key based on `pnpm-lock.yaml` hash

### Failure Handling
- E2E tests upload screenshots and reports on failure
- Artifacts retained for 7 days for debugging

### Security
- Secrets never exposed in logs
- API token only accessible in authorized workflows

## Local Testing

Before pushing, test locally:

```bash
# Run unit tests
cd packages/data
pnpm test

# Run E2E tests
cd apps/web
pnpm test:e2e

# Build and deploy manually
cd apps/web
pnpm run deploy

cd ../scraper
pnpm run deploy
```

## Troubleshooting

### "CLOUDFLARE_API_TOKEN not found"
- Ensure the secret is added in GitHub Settings
- Check the secret name matches exactly: `CLOUDFLARE_API_TOKEN`

### "Unauthorized" errors during deployment
- Verify your API token has correct permissions
- Check that account_id in wrangler.jsonc is correct
- Token may have expired - generate a new one

### Tests failing in CI but passing locally
- Check Node.js version matches (CI uses Node 20)
- Ensure dependencies are locked in pnpm-lock.yaml
- Review test artifacts uploaded on failure

### Deploy workflow not triggering
- Ensure Test workflow completed successfully
- Check workflow_run trigger configuration
- Verify branch name is correct (master)

## Manual Deployment

If you need to deploy without running tests:

1. Go to **Actions** tab
2. Select **Deploy** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

Note: Manual runs still require Test workflow to have passed previously.

## Monitoring

### View Workflow Status:
- GitHub Actions tab shows all workflow runs
- Green checkmark = success
- Red X = failure
- Yellow dot = in progress

### View Deployment Logs:
- Click on any workflow run
- Expand job and steps to see detailed logs
- Download artifacts for failed E2E tests

### Cloudflare Deployment Status:
- Check Cloudflare dashboard → Workers & Pages
- View deployment history and logs
- Monitor worker analytics and errors

## Best Practices

1. **Always test locally before pushing**
2. **Keep dependencies up to date**
3. **Review CI logs for warnings**
4. **Don't commit secrets to repository**
5. **Use pull requests for code review**
6. **Monitor deployment logs after merging**

## Additional Configuration

### Branch Protection (Recommended)

1. Go to repository **Settings** → **Branches**
2. Add rule for `master` branch
3. Enable:
   - Require status checks to pass
   - Require branches to be up to date
   - Select: `Unit Tests` and `E2E Tests`
4. This prevents merging PRs with failing tests

### Notifications

Configure GitHub notifications:
- Settings → Notifications
- Enable Actions notifications
- Get alerts for workflow failures
