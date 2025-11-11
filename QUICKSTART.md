# WildMart Quick Start Guide

Get your WildMart e-commerce platform running in minutes!

## 🚀 Quick Setup

### 1. Start MySQL Database

Make sure MySQL is running on your machine. The database will be created automatically.

### 2. Configure Database Password

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Start Backend (Spring Boot)

```bash
# Navigate to project root
cd c:\Users\Ethereal\citccs

# Run Spring Boot
mvn spring-boot:run
```

Backend will start on **http://localhost:8080**

### 4. Start Frontend (React)

Open a new terminal:

```bash
# Navigate to frontend
cd c:\Users\Ethereal\citccs\frontend

# Start React app (if not already running)
npm start
```

Frontend will open on **http://localhost:3000**

## ✅ Test the Application

1. **Open browser**: http://localhost:3000
2. **Click "Get Started"**
3. **Sign up** with your details
4. **Start shopping!**

## 📝 Test User Registration

1. Go to Signup page
2. Enter:
   - Username: `testuser`
   - Email: `test@wildmart.com`
   - Password: `password123`
3. Click "Sign Up"
4. Login with the same credentials

## 🛠️ Troubleshooting

### Backend won't start?

**Check MySQL:**
```bash
# Windows
net start MySQL80

# Or check if MySQL service is running
```

**Database connection error?**
- Verify MySQL username/password in `application.properties`
- Ensure MySQL is running on port 3306

### Frontend shows "Registration failed"?

- Make sure backend is running on port 8080
- Check browser console for errors
- Verify CORS is configured correctly

### Port already in use?

**Backend (8080):**
Edit `application.properties`:
```properties
server.port=8081
```

**Frontend (3000):**
React will automatically suggest port 3001

## 📚 What's Next?

### Add Sample Products

Use Postman or cURL to add products:

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_1" \
  -d '{
    "name": "Sample Product",
    "description": "This is a sample product",
    "price": 29.99,
    "category": "Electronics",
    "stock": 100
  }'
```

### Test Features

1. ✅ Browse products on Dashboard
2. ✅ Add products to cart
3. ✅ Like/unlike products
4. ✅ View profile
5. ✅ Place orders
6. ✅ View order history

## 🎯 API Endpoints

Base URL: `http://localhost:8080`

- **POST** `/api/auth/register` - Sign up
- **POST** `/api/auth/login` - Login
- **GET** `/api/products` - Get all products
- **GET** `/api/user/profile` - Get profile (requires auth)
- **POST** `/api/cart/add` - Add to cart (requires auth)
- **POST** `/api/orders/checkout` - Checkout (requires auth)

See `BACKEND_README.md` for complete API documentation.

## 💡 Tips

1. **Keep both terminals open** - one for backend, one for frontend
2. **Check browser console** for frontend errors
3. **Check terminal** for backend errors
4. **Use Postman** to test API endpoints directly

## 🔐 Default Configuration

- **Backend Port**: 8080
- **Frontend Port**: 3000
- **Database**: wildmart
- **Database Port**: 3306

## 📞 Need Help?

Check the detailed documentation:
- Frontend: `frontend/README.md`
- Backend: `BACKEND_README.md`

Happy coding! 🎉
