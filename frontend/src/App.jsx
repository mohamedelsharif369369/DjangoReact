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
    <div>

      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "15px 20px",
          marginBottom: "25px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >

        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >

          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#222",
            }}
          >
            React Django Shop
          </Link>


          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <Link
              to="/"
              style={{
                textDecoration: "none",
              }}
            >
              <button type="button">
                Products
              </button>
            </Link>


            {token ? (
              <>
                <span
                  style={{
                    fontSize: "15px",
                    color: "#555",
                  }}
                >
                  Welcome,{" "}
                  <strong>
                    {username}
                  </strong>{" "}
                  👋
                </span>


                <Link
                  to="/my-orders"
                  style={{
                    textDecoration: "none",
                  }}
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
                  style={{
                    textDecoration: "none",
                  }}
                >
                  <button type="button">
                    Login
                  </button>
                </Link>


                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                  }}
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


      <main
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 20px 40px",
        }}
      >

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

      </main>

    </div>
  )
}


export default App
