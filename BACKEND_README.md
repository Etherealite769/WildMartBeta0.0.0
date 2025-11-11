# WildMart E-commerce Backend (Spring Boot)

Complete Spring Boot REST API backend for the WildMart e-commerce platform.

## Features

✅ **User Authentication** - Register and login endpoints
✅ **User Management** - Profile and account management
✅ **Product Management** - CRUD operations for products
✅ **Shopping Cart** - Add, update, remove items
✅ **Order Management** - Checkout and order history
✅ **Wishlist/Likes** - Like/unlike products
✅ **Seller Features** - Seller profiles and product listings
✅ **CORS Enabled** - Configured for React frontend

## Tech Stack

- **Spring Boot 3.5.7**
- **Spring Data JPA** - Database operations
- **MySQL** - Database
- **Maven** - Dependency management

## Project Structure

```
src/main/java/com/ecommerce/WildMartV1/citccs/
├── model/              # Entity classes
│   ├── User.java
│   ├── Product.java
│   ├── Cart.java
│   ├── CartItem.java
│   ├── Order.java
│   └── OrderItem.java
├── dto/                # Data Transfer Objects
│   ├── SignupRequest.java
│   ├── LoginRequest.java
│   ├── AuthResponse.java
│   └── UserDTO.java
├── repository/         # JPA Repositories
│   ├── UserRepository.java
│   ├── ProductRepository.java
│   ├── CartRepository.java
│   ├── CartItemRepository.java
│   └── OrderRepository.java
├── service/            # Business Logic
│   ├── AuthService.java
│   └── UserService.java
├── controller/         # REST Controllers
│   ├── AuthController.java
│   ├── UserController.java
│   ├── ProductController.java
│   ├── CartController.java
│   ├── OrderController.java
│   └── SellerController.java
├── config/             # Configuration
│   └── WebConfig.java
└── CitccsApplication.java
```

## Prerequisites

1. **Java 17** or higher
2. **Maven 3.6+**
3. **MySQL 8.0+** (or MariaDB)

## Setup Instructions

### 1. Database Setup

Create a MySQL database (or it will be created automatically):

```sql
CREATE DATABASE wildmart;
```

### 2. Configure Database

Update `src/main/resources/application.properties` with your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/wildmart?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run the Application

```bash
# Using Maven
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/citccs-0.0.1-SNAPSHOT.jar
```

The server will start on **http://localhost:8080**

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

**Register Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "token_1",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    ...
  }
}
```

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get user profile | ✅ |
| PUT | `/api/user/profile` | Update profile | ✅ |
| GET | `/api/user/account` | Get account info | ✅ |
| PUT | `/api/user/account` | Update account | ✅ |
| GET | `/api/user/products` | Get user's products | ✅ |
| GET | `/api/user/likes` | Get liked products | ✅ |
| POST | `/api/user/likes/{productId}` | Like a product | ✅ |
| DELETE | `/api/user/likes/{productId}` | Unlike a product | ✅ |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | ❌ |
| GET | `/api/products/{id}` | Get product by ID | ❌ |
| POST | `/api/products` | Create product | ✅ |
| PUT | `/api/products/{id}` | Update product | ✅ |
| DELETE | `/api/products/{id}` | Delete product | ✅ |

### Cart

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get cart | ✅ |
| POST | `/api/cart/add` | Add item to cart | ✅ |
| PUT | `/api/cart/items/{itemId}` | Update cart item | ✅ |
| DELETE | `/api/cart/items/{itemId}` | Remove cart item | ✅ |

**Add to Cart Request:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/orders` | Get user orders | ✅ |
| POST | `/api/orders/checkout` | Checkout cart | ✅ |
| GET | `/api/user/purchases` | Get purchase history | ✅ |

### Sellers

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sellers/{id}` | Get seller info | ❌ |
| GET | `/api/sellers/{id}/products` | Get seller products | ❌ |

## Authentication

The API uses a simplified token-based authentication. In production, implement JWT tokens.

**Include token in headers:**
```
Authorization: Bearer token_1
```

## Database Schema

The application uses JPA with `ddl-auto=update`, so tables are created automatically:

- **users** - User accounts
- **products** - Product listings
- **carts** - Shopping carts
- **cart_items** - Cart line items
- **orders** - Order records
- **order_items** - Order line items
- **user_likes** - User product likes (many-to-many)

## CORS Configuration

CORS is configured to allow requests from `http://localhost:3000` (React frontend).

To change allowed origins, edit `WebConfig.java`:

```java
.allowedOrigins("http://localhost:3000", "https://yourdomain.com")
```

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get Products
curl http://localhost:8080/api/products
```

### Using Postman

1. Import the API endpoints
2. Set Authorization header: `Bearer token_1`
3. Test all endpoints

## Development Notes

### Password Security
⚠️ **Important:** Passwords are currently stored in plain text. For production:

1. Add Spring Security dependency
2. Use `BCryptPasswordEncoder`
3. Hash passwords before saving

```java
@Autowired
private PasswordEncoder passwordEncoder;

user.setPassword(passwordEncoder.encode(request.getPassword()));
```

### JWT Implementation
For production, replace simple token with JWT:

1. Add `jjwt` dependency
2. Create JWT utility class
3. Implement JWT filter
4. Add Spring Security configuration

## Troubleshooting

### Database Connection Error
- Ensure MySQL is running
- Check username/password in `application.properties`
- Verify database exists

### Port Already in Use
Change port in `application.properties`:
```properties
server.port=8081
```

### CORS Errors
- Verify frontend URL in `WebConfig.java`
- Check browser console for specific CORS error

## Next Steps

1. ✅ Start the Spring Boot application
2. ✅ Test API endpoints with Postman/cURL
3. ✅ Start the React frontend
4. ✅ Test full integration

## License

Part of the WildMart e-commerce platform.
