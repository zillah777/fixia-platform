# GitHub Secrets Configuration for SeeNode Deployment

## 🔐 Required GitHub Repository Secrets

To configure these secrets, go to:
**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

### Core Deployment Secrets

```bash
# SeeNode Platform Credentials
SEENODE_TOKEN=your-seenode-api-token-from-dashboard
SEENODE_APP_ID=fixia-backend
SEENODE_DEPLOYMENT_URL=https://your-app.seenode.com

# Database Configuration (SeeNode PostgreSQL)
DATABASE_URL=your-seenode-postgresql-database-url

# Authentication
JWT_SECRET=your-production-jwt-secret-64-characters-minimum

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key-here

# Payment Integration
MERCADOPAGO_ACCESS_TOKEN=demo_token

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn-here

# Cache (Optional)
REDIS_URL=redis://username:password@redis-host:6379

# Notifications (Optional)
SLACK_WEBHOOK=your-slack-webhook-for-deployment-notifications
```

## 📋 Quick Setup Checklist

### 1. Copy Environment Variables to SeeNode Dashboard

```env
# Go to SeeNode Dashboard > Your App > Environment Variables
# Add these variables:

NODE_ENV=production
PORT=8080
FRONTEND_URL=https://fixia-platform.vercel.app

DATABASE_URL=postgresql://db_an0a5d2ukdfu:1tTgUDPCUrcs237Hpyqo2Qu1@up-de-fra1-postgresql-1.db.run-on-seenode.com:11550/db_an0a5d2ukdfu
DB_HOST=up-de-fra1-postgresql-1.db.run-on-seenode.com
DB_PORT=11550
DB_NAME=db_an0a5d2ukdfu
DB_USER=db_an0a5d2ukdfu
DB_PASSWORD=1tTgUDPCUrcs237Hpyqo2Qu1
DB_SSL=true

JWT_SECRET=Fx_$ecur3_JWT_k3y_2024_Pr0ducti0n_R4ilw4y_D3pl0y_S3cr3t_K3y_
JWT_EXPIRE=7d

CORS_ORIGIN=https://fixia-platform.vercel.app,https://fixia.com.ar,https://www.fixia.com.ar

SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=permabaneatresh@gmail.com
SENDGRID_FROM_EMAIL=permabaneatresh@gmail.com
SENDGRID_FROM_NAME=Fixia - Marketplace de Servicios

MERCADOPAGO_ACCESS_TOKEN=demo_token
MERCADOPAGO_PUBLIC_KEY=demo_key
MP_ACCESS_TOKEN=demo_token
MP_PUBLIC_KEY=demo_key

GOOGLE_MAPS_API_KEY=demo_key

RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

BCRYPT_ROUNDS=12
ENABLE_REGISTRATION=true
ENABLE_PAYMENTS=true
ENABLE_CHAT=true
ENABLE_REVIEWS=true
ENABLE_NOTIFICATIONS=true
```

### 2. SeeNode Dashboard Configuration

1. **Application Settings:**
   - Name: `fixia-backend`
   - Runtime: Node.js 18
   - Repository: `zillah777/fixia-platform`
   - Directory: `/backend`
   - Branch: `main`

2. **Build Configuration:**
   - Build Command: `npm ci --production`
   - Start Command: `node server.js`
   - Dockerfile: `Dockerfile.seenode`

3. **Auto-scaling:**
   - Min Instances: 2
   - Max Instances: 10
   - CPU Threshold: 80%

### 3. DNS Configuration (After Deployment)

```bash
# Custom Domain Setup in SeeNode Dashboard
Domain: api.fixia.com.ar
Target: your-app.seenode.com

# DNS Configuration (in your DNS provider)
Type: CNAME
Name: api
Value: your-app.seenode.com
TTL: Auto/300
```

## 🚀 Deployment Steps

### Manual Deployment Process

1. **Configure GitHub Secrets** (all secrets listed above)

2. **Update SeeNode Dashboard** with environment variables

3. **Trigger Deployment:**
   ```bash
   git add .
   git commit -m "Configure SeeNode production deployment"
   git push origin main
   ```

4. **Monitor Deployment:**
   - Check GitHub Actions tab for workflow progress
   - Monitor SeeNode Dashboard > Deployments
   - Watch logs in SeeNode Dashboard > Logs

### Automated CI/CD Deployment

The GitHub Actions workflow will automatically:
- Run tests on every push to main
- Deploy to SeeNode upon successful tests
- Configure environment variables
- Run database migrations
- Perform health checks
- Send deployment notifications

## 🔍 Verification Commands

After successful deployment, test these endpoints:

```bash
# Health Check
curl https://your-app.seenode.com/health

# API Status
curl https://your-app.seenode.com/api/system/status

# Services Endpoint
curl https://your-app.seenode.com/api/services?limit=5

# Authentication Test
curl -X POST https://your-app.seenode.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

## 🚨 Important Security Notes

1. **Never commit real secrets to GitHub repository**
2. **Use GitHub Secrets for all sensitive values**
3. **Regularly rotate API keys and tokens**
4. **Monitor deployment logs for any exposed credentials**
5. **Use SeeNode's built-in SSL/TLS for all communications**

## 📞 Support Resources

- **SeeNode Dashboard:** https://dashboard.seenode.com
- **SeeNode Documentation:** https://docs.seenode.com
- **GitHub Actions:** https://github.com/zillah777/fixia-platform/actions
- **Repository Secrets:** https://github.com/zillah777/fixia-platform/settings/secrets/actions

---

**✅ Once configured, your Fixia backend will automatically deploy to SeeNode on every push to main branch with full CI/CD integration.**