import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../services/api"

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    setError("")

    api
      .get(`products/${id}/`)
      .then((response) => {
        setProduct(response.data)
      })
      .catch((error) => {
        console.error("Product error:", error)

        if (error.response) {
          setError(
            `Error ${error.response.status}: ${error.response.statusText}`
          )
        } else {
          setError("Cannot connect to Django API")
        }
      })

    if (localStorage.getItem("access")) {
      api
        .get("me/")
        .then((response) => {
          setUser(response.data)
        })
        .catch((error) => {
          console.error("User error:", error)
        })
    }
  }, [id])

  function addToCart() {
    const username = localStorage.getItem("username")

    if (!username) {
      navigate("/login")
      return
    }

    const cartKey = `cart_${username}`

    const cart =
      JSON.parse(
        localStorage.getItem(cartKey)
      ) || []

    const existingItem = cart.find(
      (item) => item.id === product.id
    )

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      })
    }

    localStorage.setItem(
      cartKey,
      JSON.stringify(cart)
    )

    window.dispatchEvent(
      new Event("cartUpdated")
    )

    alert("Product added to cart")

    navigate("/cart")
  }

  function deleteProduct() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    )

    if (!confirmed) {
      return
    }

    api
      .delete(`products/${id}/`)
      .then(() => {
        navigate("/")
      })
      .catch((error) => {
        console.error("Delete error:", error)

        if (error.response) {
          setError(
            `Error ${error.response.status}: ${error.response.statusText}`
          )
        } else {
          setError("Cannot connect to Django API")
        }
      })
  }

  if (error) {
    return (
      <div className="product-card">
        <h2>Error</h2>

        <p>{error}</p>

        <Link to="/">
          <button type="button">
            Back to Products
          </button>
        </Link>
      </div>
    )
  }

  if (!product) {
    return <p>Loading...</p>
  }

  const canManageProduct =
    user &&
    (user.is_staff ||
      user.id === product.owner_id)

  return (
    <div className="product-card">

      <h2>Product Details</h2>

      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "350px",
            objectFit: "cover",
            borderRadius: "14px",
            marginBottom: "20px",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "350px",
            borderRadius: "14px",
            backgroundColor: "#e9ecef",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            fontSize: "80px",
          }}
        >
          📦
        </div>
      )}

      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <p>
        Price: {product.price} LYD
      </p>

      <p>
        Stock: {product.stock}
      </p>

      <p>
        Owner: {product.owner}
      </p>

      {user && (
        <p>
          Logged in as: {user.username}
        </p>
      )}

      <button
        type="button"
        onClick={addToCart}
        disabled={product.stock === 0}
      >
        Add to Cart
      </button>

      {canManageProduct && (
        <div>
          <br />

          <Link
            to={`/products/${product.id}/edit`}
          >
            <button type="button">
              Edit
            </button>
          </Link>

          <button
            type="button"
            onClick={deleteProduct}
          >
            Delete
          </button>
        </div>
      )}

      <br />
      <br />

      <Link to="/">
        <button type="button">
          Back to Products
        </button>
      </Link>

    </div>
  )
}

export default ProductDetails
