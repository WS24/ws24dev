# WS24 Dev - Production Deployment Checklist

**Version:** 1.0.0  
**Last Updated:** 2025-08-21  
**Maintainer:** WS24 Dev Team  

## 📋 Pre-Deployment Checklist

### 🔧 Development Environment Preparation

- [ ] **Code Quality Checks**
  - [ ] All tests pass: `npm test`
  - [ ] Linting passes: `npm run lint`
  - [ ] TypeScript compilation successful: `npm run check`
  - [ ] No critical security vulnerabilities in dependencies
  - [ ] Code reviewed and approved

- [ ] **Environment Variables**
  - [ ] All production environment variables documented
  - [ ] `.env.example` updated with all required variables
  - [ ] No sensitive data committed to repository
  - [ ] Environment validation tests pass

- [ ] **Database Preparation**
  - [ ] All migrations created and tested: `npm run db:generate`
  - [ ] Database schema validated
  - [ ] Seed data prepared (if needed)
  - [ ] Database backup strategy defined

### 🚀 Production Infrastructure Setup

#### Server Requirements

- [ ] **Hardware Specifications**
  - [ ] Minimum 2GB RAM, 4GB recommended
  - [ ] Minimum 2 CPU cores
  - [ ] At least 20GB storage for application and logs
  - [ ] SSD storage recommended for database

- [ ] **Operating System**
  - [ ] Ubuntu 22.04 LTS or similar
  - [ ] Docker and Docker Compose installed
  - [ ] SSL certificates obtained (Let's Encrypt recommended)
  - [ ] Firewall configured (ports 80, 443, SSH only)

#### Docker Secrets Setup

```bash
# Create Docker secrets for production
echo "your-strong-postgres-password" | docker secret create ws24dev_postgres_password -
echo "your-64-char-session-secret" | docker secret create ws24dev_session_secret -
echo "your-pgadmin-password" | docker secret create ws24dev_pgadmin_password -
```

- [ ] **Required Docker Secrets Created:**
  - [ ] `ws24dev_postgres_password` - PostgreSQL database password
  - [ ] `ws24dev_session_secret` - Application session secret (64+ chars)
  - [ ] `ws24dev_pgadmin_password` - pgAdmin interface password

### 🔐 Security Configuration

- [ ] **SSL/TLS Setup**
  - [ ] SSL certificates installed
  - [ ] HTTPS redirect configured in nginx
  - [ ] Strong SSL ciphers configured
  - [ ] HSTS headers enabled

- [ ] **Application Security**
  - [ ] Session secret is cryptographically random (64+ chars)
  - [ ] Cookie settings configured for production
  - [ ] CSP headers properly configured
  - [ ] Rate limiting enabled

- [ ] **Network Security**
  - [ ] Database not exposed to public internet
  - [ ] Only necessary ports open (80, 443)
  - [ ] SSH key-based authentication only
  - [ ] Regular security updates configured

### 📧 External Services Configuration

- [ ] **Replit Authentication (if using)**
  - [ ] Replit App created and configured
  - [ ] `REPL_ID` obtained and set
  - [ ] `REPLIT_DOMAINS` configured with production domain
  - [ ] OAuth callbacks configured

- [ ] **Monitoring & Logging**
  - [ ] Log aggregation service configured (optional)
  - [ ] Error tracking service configured (optional)
  - [ ] Health monitoring configured

## 🚀 Deployment Process

### Step 1: Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

- [ ] Docker installed and configured
- [ ] Docker Compose installed
- [ ] User added to docker group

### Step 2: Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/ws24dev.git
cd ws24dev

# Create production environment file
cp .env.example .env.prod
# Edit .env.prod with production values

# Create Docker secrets (see above)
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build
```

- [ ] Repository cloned to production server
- [ ] Production environment file configured
- [ ] Docker secrets created
- [ ] Services built and started successfully

### Step 3: Database Setup

```bash
# Check database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U ws24user

# Run database migrations (if needed)
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate

# Verify database schema
docker-compose -f docker-compose.prod.yml exec postgres psql -U ws24user -d ws24_prod -c "\dt"
```

- [ ] Database container healthy
- [ ] Database migrations completed
- [ ] Database schema verified
- [ ] Initial data loaded (if applicable)

### Step 4: SSL/HTTPS Configuration

```bash
# Install certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Update nginx configuration for HTTPS
# Edit nginx/conf.d/ws24dev.conf to enable HTTPS section
```

- [ ] SSL certificate obtained
- [ ] Nginx configured for HTTPS
- [ ] HTTP to HTTPS redirect working
- [ ] SSL certificate auto-renewal configured

### Step 5: Verification & Testing

```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Check application health
curl -f http://localhost:3000/api/health

# Check nginx status
curl -f http://localhost/api/health

# Check logs
docker-compose -f docker-compose.prod.yml logs app
```

- [ ] All containers running and healthy
- [ ] Application health check responds correctly
- [ ] Frontend loads successfully
- [ ] Authentication flow works
- [ ] Database operations functional
- [ ] Logs show no critical errors

## 🔍 Post-Deployment Verification

### Functionality Testing

- [ ] **Frontend Application**
  - [ ] Home page loads correctly
  - [ ] Static assets serve properly
  - [ ] Responsive design works on mobile/desktop
  - [ ] No JavaScript console errors

- [ ] **Authentication System**
  - [ ] Login flow works correctly
  - [ ] User sessions persist across browser refreshes
  - [ ] Logout functionality works
  - [ ] Protected routes are secured

- [ ] **API Endpoints**
  - [ ] `/api/health` returns 200 OK
  - [ ] User authentication endpoints functional
  - [ ] Database CRUD operations working
  - [ ] Error handling returns appropriate responses

- [ ] **Database Operations**
  - [ ] Can create new records
  - [ ] Can read existing records
  - [ ] Can update records
  - [ ] Can delete records
  - [ ] Migrations applied correctly

### Performance Testing

- [ ] **Response Times**
  - [ ] Home page loads in < 2 seconds
  - [ ] API responses in < 500ms
  - [ ] Database queries optimized
  - [ ] Static assets cached properly

- [ ] **Resource Usage**
  - [ ] Memory usage within expected limits (< 1GB)
  - [ ] CPU usage reasonable under load
  - [ ] Disk usage monitored
  - [ ] No memory leaks detected

## 🔧 Monitoring & Maintenance

### Daily Monitoring

- [ ] **Application Health**
  - [ ] Health endpoint responding (automated)
  - [ ] Application logs reviewed
  - [ ] Error rates monitored
  - [ ] Response times tracked

- [ ] **Infrastructure Health**
  - [ ] All containers running
  - [ ] Database connectivity verified
  - [ ] SSL certificate validity checked
  - [ ] Disk space monitored

### Weekly Maintenance

- [ ] **Security Updates**
  - [ ] System packages updated
  - [ ] Docker images updated
  - [ ] Security patches applied
  - [ ] Vulnerability scans performed

- [ ] **Performance Review**
  - [ ] Application performance analyzed
  - [ ] Database performance reviewed
  - [ ] Log files rotated and archived
  - [ ] Backup integrity verified

### Monthly Reviews

- [ ] **Capacity Planning**
  - [ ] Resource usage trends analyzed
  - [ ] Scaling requirements assessed
  - [ ] Cost optimization reviewed
  - [ ] Architecture improvements identified

## 🆘 Troubleshooting Guide

### Common Issues

**Application Won't Start**
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs app

# Common causes:
# - Environment variables missing/incorrect
# - Database connection failed
# - Port conflicts
# - Permission issues
```

**Database Connection Issues**
```bash
# Check PostgreSQL container
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U ws24user

# Check environment variables
docker-compose -f docker-compose.prod.yml exec app env | grep DATABASE_URL

# Check network connectivity
docker-compose -f docker-compose.prod.yml exec app ping postgres
```

**SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --dry-run

# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### Emergency Procedures

**Quick Rollback**
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Deploy previous version
git checkout previous-stable-tag
docker-compose -f docker-compose.prod.yml up -d --build
```

**Database Backup/Restore**
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U ws24user ws24_prod > backup.sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U ws24user ws24_prod < backup.sql
```

## 📞 Support & Contact

- **Technical Issues:** Create GitHub issue
- **Security Issues:** Email security@ws24dev.com
- **Emergency Contact:** [Emergency contact information]

---

**✅ Deployment Completed Successfully**
- Date: _______________
- Deployed by: _______________
- Version: _______________
- Notes: _______________
