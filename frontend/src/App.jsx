import {
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom"

import Products from "./pages/Products"
import ProductDetails from "./pages/ProductDetails"
import AddProduct from "./pages/AddProduct"
import EditProduct from "./pages/EditProduct"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import MyOrders from "./pages/MyOrders"

import ProtectedRoute from "./components/ProtectedRoute"
import CartIcon from "./components/CartIcon"
import ErrorBoundary from "./components/ErrorBoundary"

import "./App.css"


function App() {
  const navigate = useNavigate()

  const token = localStorage.getItem("access")
  const username = localStorage.getItem("username")


  function handleLogout() {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("username")

    window.dispatchEvent(
      new Event("cartUpdated")
    )

    navigate("/login")
  }


  return (
    <div className="app">

      <header className="site-header">

        <div className="header-container">

          <Link
            to="/"
            className="brand"
          >
            ISKNDR
          </Link>


          <nav className="main-nav">

            <Link
              to="/"
              className="nav-link"
            >
              <button type="button">
                Products
              </button>
            </Link>


            {token ? (
              <>
                <span className="welcome">
                  Welcome,{" "}
                  <strong>{username}</strong>{" "}
                  👋
                </span>


                <Link
                  to="/my-orders"
                  className="nav-link"
                >
                  <button type="button">
                    My Orders
                  </button>
                </Link>


                <button
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link"
                >
                  <button type="button">
                    Login
                  </button>
                </Link>


                <Link
                  to="/register"
                  className="nav-link"
                >
                  <button type="button">
                    Register
                  </button>
                </Link>
              </>
            )}


            <CartIcon />

          </nav>

        </div>

      </header>


      <main className="main-content">

        <ErrorBoundary>

          <Routes>

            <Route
              path="/"
              element={<Products />}
            />


            <Route
              path="/products/:id"
              element={<ProductDetails />}
            />


            <Route
              path="/cart"
              element={<Cart />}
            />


            <Route
              path="/checkout"
              element={<Checkout />}
            />


            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />


            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />


            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />


            <Route
              path="/login"
              element={<Login />}
            />


            <Route
              path="/register"
              element={<Register />}
            />

          </Routes>

        </ErrorBoundary>

      </main>


      <footer className="site-footer">

        <div className="footer-container">

          <div className="footer-brand">

            <h2>ISKNDR</h2>

            <p>
              Modern e-commerce platform
              built with React and Django.
            </p>

          </div>


          <div className="footer-developer">

            <h3>
              Full-Stack Web Developer
            </h3>

            <p>
              Mohamed Elsharif
            </p>

            <p className="footer-tech">
              React.js • Python • Django •
              Django REST Framework •
              PostgreSQL
            </p>

          </div>


          <div className="footer-links">

            <h3>
              Project
            </h3>

            <a
              href="https://github.com/mohamedelsharif369369/DjangoReact"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>

          </div>

        </div>


        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} ISKNDR.
            All rights reserved.
          </p>

          <p>
            Developed by Mohamed Elsharif
          </p>

        </div>

      </footer>

    </div>
  )
}


export default App
