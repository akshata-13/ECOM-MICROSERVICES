### 🛍️ EcoMicro - Local Shop Management Platform

An e-commerce management system designed specifically for local shops and supermarts to efficiently manage their daily operations through an intuitive admin dashboard.

### 🚀 Quick Start
Clone and Run:
```bash
# Clone the repository
git clone https://github.com/akshata-13/ECOM-MICROSERVICES.git
cd ECOM-MICROSERVICES

# Start all services with Docker
docker-compose up
```
**Using Docker**
```bash
docker-compose up
```

**Access the Application:**

- Frontend: http://localhost:3000
- Product Service: http://localhost:8081
- Inventory Service: http://localhost:8082
- User Service: http://localhost:8083
- Order Service: http://localhost:8084

### 📦 Services

- User Service - Customer management and profiles
- Product Service - Product catalog and pricing
- Inventory Service - Real-time stock management
- Order Service - Order processing and validation
- React Frontend - Admin dashboard and UI

### 🛠️ Tech Stack

- Frontend: React, Tailwind CSS, Axios
- Backend: Node.js, Express.js
- Database: PostgreSQL (separate DB per service)
- Containerization: Docker, Docker Compose
- API: RESTful endpoints

### 🔧 Development
Manual Setup:
```bash
# Install dependencies for each service
cd user-service && npm install
cd ../product-service && npm install
cd ../inventory-service && npm install
cd ../order-service && npm install
cd ../frontend && npm install
# Start services individually
npm start
```
### 📄 License
MIT License - feel free to use this project for learning and development.
