# Deployment Guide - Virtual Learning Platform

This guide covers deploying the Virtual Learning Platform to various cloud providers and production environments.

## 🌐 Deployment Options

### 1. Heroku + Netlify (Recommended for beginners)
### 2. Railway + Vercel
### 3. DigitalOcean Droplet
### 4. AWS (Advanced)
### 5. Docker Deployment

---

## 🚀 Option 1: Heroku + Netlify

### Backend Deployment (Heroku)

1. **Install Heroku CLI:**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows - Download from heroku.com
# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login to Heroku:**
```bash
heroku login
```

3. **Create Heroku App:**
```bash
cd backend
heroku create your-vlp-backend
```

4. **Set Environment Variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_production_jwt_secret_here
heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
heroku config:set GEMINI_API_KEY=your_gemini_api_key
heroku config:set OPENAI_API_KEY=your_openai_api_key
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
```

5. **Deploy to Heroku:**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Frontend Deployment (Netlify)

1. **Build the frontend:**
```bash
cd frontend
npm run build
```

2. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

3. **Login to Netlify:**
```bash
netlify login
```

4. **Deploy:**
```bash
netlify deploy --prod --dir=build
```

5. **Set Environment Variables in Netlify:**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add: `REACT_APP_API_URL=https://your-vlp-backend.herokuapp.com/api`

---

## 🚄 Option 2: Railway + Vercel

### Backend Deployment (Railway)

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy:**
```bash
cd backend
railway login
railway init
railway up
```

3. **Set Environment Variables:**
```bash
railway variables:set NODE_ENV=production
railway variables:set JWT_SECRET=your_jwt_secret
railway variables:set MONGODB_URI=your_mongodb_uri
# ... add other variables
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd frontend
vercel --prod
```

3. **Set Environment Variables:**
```bash
vercel env add REACT_APP_API_URL production
# Enter your Railway backend URL
```

---

## 🖥️ Option 3: DigitalOcean Droplet

### Server Setup

1. **Create a Droplet:**
   - Ubuntu 22.04 LTS
   - At least 2GB RAM
   - Enable monitoring and backups

2. **Initial Server Setup:**
```bash
# Connect to your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-org

# Install FFmpeg
apt-get install -y ffmpeg

# Install PM2 (Process Manager)
npm install -g pm2

# Install Nginx
apt-get install -y nginx

# Install Certbot for SSL
apt-get install -y certbot python3-certbot-nginx
```

3. **Clone and Setup Application:**
```bash
# Clone repository
git clone https://github.com/your-username/virtual-learning-platform.git
cd virtual-learning-platform

# Install dependencies
npm run install-all

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Build frontend
cd frontend
npm run build
```

4. **Configure Nginx:**
```bash
# Create Nginx config
nano /etc/nginx/sites-available/vlp

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/virtual-learning-platform/frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        alias /path/to/virtual-learning-platform/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Enable site
ln -s /etc/nginx/sites-available/vlp /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

5. **Setup SSL Certificate:**
```bash
certbot --nginx -d your-domain.com
```

6. **Start Application with PM2:**
```bash
cd /path/to/virtual-learning-platform/backend
pm2 start server.js --name "vlp-backend"
pm2 startup
pm2 save
```

---

## ☁️ Option 4: AWS Deployment

### Architecture Overview
- **Frontend:** S3 + CloudFront
- **Backend:** EC2 or Elastic Beanstalk
- **Database:** MongoDB Atlas or DocumentDB
- **File Storage:** S3
- **CDN:** CloudFront

### Frontend (S3 + CloudFront)

1. **Build and Upload to S3:**
```bash
cd frontend
npm run build

# Install AWS CLI
pip install awscli
aws configure

# Create S3 bucket
aws s3 mb s3://your-vlp-frontend

# Upload build files
aws s3 sync build/ s3://your-vlp-frontend --delete
```

2. **Setup CloudFront Distribution:**
   - Origin: Your S3 bucket
   - Default root object: index.html
   - Error pages: 404 → /index.html (for SPA routing)

### Backend (Elastic Beanstalk)

1. **Install EB CLI:**
```bash
pip install awsebcli
```

2. **Initialize and Deploy:**
```bash
cd backend
eb init
eb create production
eb setenv NODE_ENV=production JWT_SECRET=your_secret MONGODB_URI=your_uri
eb deploy
```

---

## 🐳 Option 5: Docker Deployment

### Docker Compose Setup

1. **Create docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: vlp-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: vlp-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/vlp?authSource=admin
      JWT_SECRET: your_jwt_secret
      GEMINI_API_KEY: your_gemini_key
      OPENAI_API_KEY: your_openai_key
    volumes:
      - ./backend/uploads:/app/uploads
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: http://localhost:5000/api
    container_name: vlp-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: vlp-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  mongodb_data:
```

2. **Create Dockerfiles:**

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN apk add --no-cache ffmpeg

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

3. **Deploy with Docker Compose:**
```bash
docker-compose up -d
```

---

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create free cluster

2. **Setup Database:**
   - Create database user
   - Whitelist IP addresses (0.0.0.0/0 for development)
   - Get connection string

3. **Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/virtual_learning_platform?retryWrites=true&w=majority
```

---

## 🔒 Security Checklist

### Environment Variables
- [ ] Strong JWT secret (32+ characters)
- [ ] Secure database credentials
- [ ] API keys properly set
- [ ] No sensitive data in code

### Server Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Rate limiting enabled
- [ ] CORS properly configured

### Database Security
- [ ] Authentication enabled
- [ ] Network access restricted
- [ ] Regular backups
- [ ] Encryption at rest

---

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# Check API health
curl https://your-domain.com/api/health

# Monitor with PM2
pm2 monit

# Check logs
pm2 logs vlp-backend
```

### Backup Strategy
1. **Database Backups:**
   - MongoDB Atlas: Automatic backups
   - Self-hosted: Regular mongodump

2. **File Backups:**
   - Course videos and images
   - User uploads

3. **Code Backups:**
   - Git repository
   - Environment configurations

### Performance Optimization
1. **CDN for static assets**
2. **Database indexing**
3. **Image optimization**
4. **Caching strategies**
5. **Load balancing (for high traffic)**

---

## 🚨 Troubleshooting Production Issues

### Common Issues

1. **502 Bad Gateway:**
   - Check if backend is running
   - Verify Nginx configuration
   - Check firewall settings

2. **Database Connection Errors:**
   - Verify MongoDB is running
   - Check connection string
   - Confirm network access

3. **File Upload Issues:**
   - Check disk space
   - Verify upload directory permissions
   - Confirm file size limits

4. **SSL Certificate Issues:**
   - Renew certificates: `certbot renew`
   - Check certificate validity
   - Verify domain DNS settings

### Useful Commands
```bash
# Check service status
systemctl status nginx
systemctl status mongod

# View logs
journalctl -u nginx -f
tail -f /var/log/mongodb/mongod.log

# Restart services
systemctl restart nginx
pm2 restart vlp-backend

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx, AWS ALB)
- Multiple backend instances
- Database clustering
- CDN for global distribution

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching (Redis)
- Optimize file storage

---

## 🎯 Post-Deployment Checklist

- [ ] All services running
- [ ] HTTPS working
- [ ] Database connected
- [ ] File uploads working
- [ ] AI features functional
- [ ] Email notifications working
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Domain configured
- [ ] SSL certificate valid

---

Congratulations! Your Virtual Learning Platform is now live! 🎉
