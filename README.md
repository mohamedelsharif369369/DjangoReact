# DjangoReact
ISKNDR

Modern full-stack e-commerce platform built with React.js, Django REST Framework, PostgreSQL, and PayPal.

ISKNDR is a complete e-commerce application featuring product management, categories, search, sorting, authentication, shopping cart, checkout, PayPal payments, and order management.

Live Demo

Frontend:
https://react-django-shop.onrender.com/

Backend API:
https://django-react-shop-api.onrender.com/

GitHub:
https://github.com/mohamedelsharif369369/DjangoReact

---

Version

v1.0.0

Initial production-ready release of the ISKNDR e-commerce platform.

---

Features

Products

- Product listing
- Product details
- Product images
- Product descriptions
- Product prices
- Stock management
- Product creation
- Product editing
- Product deletion
- Product ownership

Categories

- Product categories
- Category filtering
- Category management through Django Admin
- REST API support for categories

Search & Sorting

- Product search
- Search by product name
- Search by description
- Filter by category
- Sort by newest
- Sort by price: low to high
- Sort by price: high to low
- Sort by name

Authentication

- User registration
- User login
- JWT authentication
- Protected routes
- User-specific orders
- User-specific shopping carts
- Logout

Shopping Cart

- Add products to cart
- Increase quantity
- Decrease quantity
- Remove products
- Automatic subtotal calculation
- Automatic total calculation
- Persistent cart using browser local storage
- Separate carts for authenticated users

Checkout

- Customer information
- Customer name
- Phone number
- Address
- Order notes
- Order creation
- Order summary
- Total calculation

PayPal Payments

ISKNDR integrates PayPal for online payments.

Payment flow:

Product
   ↓
Shopping Cart
   ↓
Checkout
   ↓
Create Order
   ↓
PayPal
   ↓
Approve Payment
   ↓
Capture Payment
   ↓
Order Marked as Paid
   ↓
Cart Cleared

Customers can use PayPal's supported payment options, including eligible debit and credit card payments through PayPal.

Orders

- Create orders
- View authenticated user's orders
- Track order status
- Track payment status
- Store PayPal transaction information
- Record payment completion time

Cloudinary

Product images can be stored and served using Cloudinary.

This allows uploaded product images to remain available in production without depending on the local server filesystem.

---

Technology Stack

Frontend

- React.js
- React Router
- Axios
- Vite
- JavaScript
- HTML5
- CSS3

Backend

- Python
- Django
- Django REST Framework
- JWT Authentication
- PostgreSQL

Payments

- PayPal
- PayPal JavaScript SDK
- PayPal Orders API
- PayPal Capture API

Storage & Deployment

- Cloudinary
- Render
- GitHub

---

Project Architecture

ISKNDR
│
├── backend/
│   ├── config/
│   ├── products/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

---

Main Frontend Pages

/
├── Products
├── /products/:id
├── /products/:id/edit
├── /add-product
├── /cart
├── /checkout
├── /my-orders
├── /login
└── /register

---

REST API

The Django REST API is available at:

https://django-react-shop-api.onrender.com/api/

Products

GET    /api/products/
POST   /api/products/

Categories

GET    /api/categories/
POST   /api/categories/

Orders

POST   /api/orders/

PayPal

POST   /api/payments/paypal/create/
POST   /api/payments/paypal/capture/

Authentication-protected endpoints require a JWT access token.

---

Authentication

The frontend uses JWT authentication.

The access token is stored in browser local storage and automatically attached to API requests through Axios.

Protected functionality includes:

- Creating products
- Editing products
- Managing authenticated orders
- Checkout/order creation

---

Environment Variables

Frontend

The frontend requires the PayPal Client ID:

VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

For local development, create:

frontend/.env.local

Never commit real credentials or secret keys to GitHub.

Backend

Backend environment variables should also be configured in the deployment environment rather than committed to the repository.

---

Local Development

1. Clone the repository

git clone https://github.com/mohamedelsharif369369/DjangoReact.git
cd DjangoReact

---

2. Backend

Move into the backend directory:

cd backend

Create a virtual environment:

python -m venv .venv

Activate it:

source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Create an administrator:

python manage.py createsuperuser

Start Django:

python manage.py runserver

The API will be available at:

http://127.0.0.1:8000/

---

3. Frontend

Open another terminal and move into the frontend directory:

cd frontend

Install dependencies:

npm install

Create:

frontend/.env.local

Add:

VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

Start the development server:

npm run dev

---

Production Deployment

ISKNDR is deployed using Render.

Frontend

Static Site

Production URL:

https://react-django-shop.onrender.com/

Backend

Django Web Service

Production URL:

https://django-react-shop-api.onrender.com/

The frontend communicates with the Django REST API through Axios.

---

Database

The application is designed to use PostgreSQL in production.

The backend uses Django's ORM for:

- Users
- Products
- Categories
- Orders
- Order items
- Payment information
- Inventory data

---

Admin Panel

Django Admin provides management functionality for the backend.

Administrators can manage:

- Products
- Categories
- Orders
- Users
- Inventory
- Payment information

---

Security

The project follows several basic security practices:

- Environment variables are excluded from Git
- JWT authentication is used for protected API operations
- Django authentication and permissions are used
- Production credentials are not stored in source code
- ".env" files are excluded through ".gitignore"

---

Error Handling

The React application includes a runtime error boundary to prevent an unexpected component error from completely breaking the application interface.

API errors are also handled in the frontend and displayed to the user where appropriate.

---

Git Workflow

The project uses Git for version control.

Main branch:

main

Remote repository:

https://github.com/mohamedelsharif369369/DjangoReact.git

---

Developer

Mohamed Elsharif

Full-Stack Web Developer

Technologies

React.js
Python
Django
Django REST Framework
PostgreSQL
JavaScript
REST APIs
JWT
PayPal
Cloudinary
Git
GitHub
Render

---

License

This project is currently presented as a personal portfolio and demonstration project.

---

Release

ISKNDR v1.0.0

The v1.0.0 release represents the first complete production-ready version of the ISKNDR e-commerce platform, including:

- React frontend
- Django REST API
- Authentication
- Products
- Categories
- Search
- Sorting
- Shopping cart
- Checkout
- Orders
- PayPal payments
- Cloudinary images
- PostgreSQL support
- Render deployment

Status: Production Ready
