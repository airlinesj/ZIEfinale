# ZIE Membership Portal - Deployment Guide

## Production Deployment

### Prerequisites
- Node.js v18+ on production server
- MongoDB (local or Atlas)
- SSL certificate (for HTTPS)
- Domain name
- Email account for notifications

### Hosting Options

#### Option 1: VPS (DigitalOcean, Linode, AWS EC2)

**1. Setup Server**
```bash
# SSH into your server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (or use MongoDB Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod

# Install PM2 for process management
npm install -g pm2
```

**2. Clone Repository**
```bash
cd /home/deployer
git clone https://github.com/your-org/zie-portal.git
cd zie-portal
```

**3. Build Backend**
```bash
cd backend
npm install
npm run build
```

**4. Build Frontend**
```bash
cd frontend
npm install
ng build --configuration production
```

**5. Setup Environment**
```bash
# Copy and configure .env
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

**6. Start with PM2**
```bash
# Start backend
pm2 start dist/index.js --name zie-backend

# Start frontend with static server (optional)
cd frontend
pm2 serve dist/zie-frontend 4200 --name zie-frontend --spa

# Save PM2 config
pm2 save
pm2 startup
```

**7. Setup Nginx Reverse Proxy**
```bash
apt install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/zie-portal > /dev/null <<EOF
upstream zie_backend {
    server localhost:5000;
}

upstream zie_frontend {
    server localhost:4200;
}

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://zie_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://zie_backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/zie-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl start nginx
```

**8. Setup SSL with Let's Encrypt**
```bash
apt install -y certbot python3-certbot-nginx

certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

#### Option 2: Platform as a Service (Heroku, Railway, Render)

**Using Heroku:**

```bash
# Login to Heroku
heroku login

# Create apps
heroku create zie-backend
heroku create zie-frontend

# Set environment variables
heroku config:set -a zie-backend MONGODB_URI=your_mongodb_uri
heroku config:set -a zie-backend JWT_SECRET=your_secret
# ... set other variables

# Deploy backend
cd backend
git subtree push --prefix backend heroku main

# Deploy frontend
cd frontend
git subtree push --prefix frontend heroku main
```

### Production Environment Variables

```env
# backend/.env (PRODUCTION)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/zie-db
JWT_SECRET=your_very_secure_random_string_here_min_32_chars
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@zie.co.zw
SMTP_PASS=your_app_password
FRONTEND_URL=https://your-domain.com
EXCHANGE_RATE=0.02
ENVIRONMENT=production
LOG_LEVEL=info
```

### Database Backup

```bash
# Backup MongoDB
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/zie-db" --archive=zie-db-backup.archive

# Restore MongoDB
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/zie-db" --archive=zie-db-backup.archive

# Schedule daily backups with cron
# 0 2 * * * /usr/local/bin/backup-zie-db.sh
```

### Monitoring & Logging

**Setup Log Collection**
```bash
# Using PM2 Plus for monitoring
pm2 plus

# View logs
pm2 logs zie-backend
pm2 logs zie-frontend

# Setup log rotation
pm2 install pm2-logrotate
```

**Monitor Resources**
```bash
# CPU, Memory, Disk
top
df -h
ps aux | grep node

# Network
netstat -tlnp | grep node
```

### Performance Optimization

**Backend**
```javascript
// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});

// Enable gzip compression
const compression = require('compression');
app.use(compression());
```

**Frontend**
```bash
# Build with production optimization
ng build --configuration production --optimization=true

# Analyze bundle size
ng build --stats-json
webpack-bundle-analyzer dist/zie-frontend/stats.json
```

### Security Hardening

```bash
# Keep dependencies updated
npm audit fix
npm update

# Setup firewall
ufw default deny incoming
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban for security
apt install -y fail2ban

# Auto-update security patches
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Scaling

**Database Scaling**
- Use MongoDB Atlas for automatic scaling
- Enable sharding for large datasets
- Setup read replicas for read-heavy operations

**Backend Scaling**
- Use PM2 cluster mode:
  ```bash
  pm2 start backend/dist/index.js -i max --name zie-backend
  ```
- Load balance with Nginx
- Horizontal scaling with multiple instances

**Frontend Caching**
- Use CDN (CloudFlare, AWS CloudFront)
- Setup cache headers
- Enable gzip compression

### Monitoring Checklist

- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] Database response time < 100ms
- [ ] API response time < 500ms
- [ ] Disk space > 20% free
- [ ] SSL certificate valid
- [ ] Email delivery working
- [ ] Error rate < 0.1%
- [ ] Uptime monitoring active
- [ ] Backup runs daily

### Disaster Recovery

**Backup Plan**
- Daily MongoDB backups to S3
- Frontend static files version control
- Environment variables in secure vault
- Database replication enabled

**Recovery Process**
1. Restore latest MongoDB backup
2. Redeploy frontend from git
3. Restart Node.js processes
4. Verify all systems operational
5. Check email notifications

### Post-Deployment Checklist

- [ ] HTTPS working
- [ ] Login functionality tested
- [ ] Form submission tested
- [ ] Email notifications verified
- [ ] Admin dashboard accessible
- [ ] Sponsor links functional
- [ ] Database backup automated
- [ ] Monitoring active
- [ ] SSL certificate auto-renewal
- [ ] Security headers present
