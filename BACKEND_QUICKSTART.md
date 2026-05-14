# Backend Quick Start Guide

## Prerequisites
- Java 17+ installed
- PostgreSQL database access (already configured for Supabase)
- Maven installed (or use the included mvnw)

## Build Instructions

### Clean Build
```bash
cd c:\Users\Ethereal\citccs
.\mvnw.cmd clean package -DskipTests
```

### Compile Only (without packaging)
```bash
.\mvnw.cmd clean compile
```

## Running the Application

### Option 1: Run from JAR
```bash
java -jar target/citccs-0.0.1-SNAPSHOT.jar
```

### Option 2: Run via Maven
```bash
.\mvnw.cmd spring-boot:run
```

### Expected Output
```
Started CitccsApplication in X.XXX seconds
Initializing Flyway (database migration)...
Creating default categories...
Creating sample vouchers...
Server running on http://localhost:8080
```

## API Endpoints

### Authentication
- **POST** `/api/auth/signup` - Register new user
- **POST** `/api/auth/login` - Login user

### Products
- **GET** `/api/products` - Get all products
- **GET** `/api/products/{id}` - Get product details
- **POST** `/api/products` - Create product (seller only)
- **PUT** `/api/products/{id}` - Update product
- **DELETE** `/api/products/{id}` - Delete product

### Orders
- **GET** `/api/orders` - Get user's orders
- **POST** `/api/orders` - Create order
- **GET** `/api/orders/{id}` - Get order details

### Cart
- **GET** `/api/cart` - Get user's cart
- **POST** `/api/cart/items` - Add item to cart
- **DELETE** `/api/cart/items/{itemId}` - Remove item from cart

### Messages
- **GET** `/api/messages` - Get messages
- **POST** `/api/messages` - Send message

## Frontend Integration

The backend is configured for CORS with the frontend running on `http://localhost:3000`:

```bash
# In another terminal, navigate to frontend directory
cd frontend
npm start
```

The React app will communicate with the backend at `http://localhost:8080`

## Database Migrations

Migrations run automatically on startup:
1. **V1** - Initial schema (users, products, orders, etc.)
2. **V2** - Schema updates and type changes
3. **V3** - Add phone number to users
4. **V4** - Add delivery confirmation image
5. **V5** - Add messages table
6. **V6** - Add missing user columns
7. **V7** - Add missing category columns
8. **V8** - Restructure orders table
9. **V9** - Add cart items table
10. **V10** - Update likes and reviews tables

## Testing the Backend

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.com",
    "password": "password123"
  }'
```

### Test Product List
```bash
curl http://localhost:8080/api/products
```

### Test Protected Endpoint (requires JWT token)
```bash
curl -X GET http://localhost:8080/api/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuration

Main configuration file: `src/main/resources/application.properties`

Key settings:
- **Server Port**: 8080
- **Database**: PostgreSQL (Supabase)
- **JWT Expiration**: 7 days
- **CORS Origin**: http://localhost:3000
- **Connection Pool**: HikariCP with 10 max connections

## Troubleshooting

### Issue: "Cannot connect to database"
- Verify Supabase database is running
- Check internet connection to AWS
- Verify credentials in application.properties

### Issue: "Port 8080 already in use"
```bash
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or use a different port
java -Dserver.port=8081 -jar target/citccs-0.0.1-SNAPSHOT.jar
```

### Issue: "JWT validation failed"
- Ensure token is passed in Authorization header
- Check token hasn't expired (expires in 7 days)
- Verify email used in token matches database

## Useful Commands

### View Logs with Timestamps
```bash
java -jar target/citccs-0.0.1-SNAPSHOT.jar 2>&1 | tee app.log
```

### Debug Mode
```bash
set JAVA_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005
java %JAVA_OPTS% -jar target/citccs-0.0.1-SNAPSHOT.jar
```

### Check Application Health
```bash
curl http://localhost:8080/actuator/health
```

## Production Deployment

Before deploying to production:

1. Update database credentials (move to environment variables)
2. Set `spring.jpa.hibernate.ddl-auto=none` (already set)
3. Enable HTTPS/SSL
4. Configure CORS for production domain
5. Set appropriate JWT expiration
6. Use environment-specific properties file
7. Set up database backups
8. Enable application monitoring

## Contact & Support

For issues with:
- **Backend API**: Check logs at startup and API responses
- **Database**: Verify Supabase connection
- **Frontend Integration**: Check CORS configuration
