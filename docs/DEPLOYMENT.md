# Deployment & Operations Manual

This guide describes production release, continuous integration, and container operations for the platform.

## 1. Running Locally with Docker Compose

Deploy the complete multi-tier application instantly in any environment:

```bash
# 1. Access the docker folder
cd docker/

# 2. Configure variables in .env
echo "GEMINI_API_KEY=your_actual_key" > .env

# 3. Boot containers in detached mode
docker-compose --env-file .env up --build -d

# 4. Access the platform
# http://localhost:3000
```

---

## 2. CI/CD Release with GitHub Actions

Here is a ready-to-use production pipeline workflow (`.github/workflows/deploy.yml`):

```yaml
name: Production Continuous Integration & Release

on:
  push:
    branches: [ main ]

jobs:
  test_and_lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-size: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate types
        run: npm run lint

      - name: Execute tests
        run: npm test

  build_and_deploy:
    needs: test_and_lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Authenticate GCP
        uses: google-github-actions/auth@v1
        with:
          credentials_json: \${{ secrets.GCP_SA_KEY }}

      - name: Build & Publish Container
        run: |
          gcloud auth configure-docker gcr.io
          docker build -f docker/Dockerfile -t gcr.io/my-project/resume-intelligence:latest .
          docker push gcr.io/my-project/resume-intelligence:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy resume-intelligence \\
            --image gcr.io/my-project/resume-intelligence:latest \\
            --platform managed \\
            --region us-central1 \\
            --allow-unauthenticated
```
