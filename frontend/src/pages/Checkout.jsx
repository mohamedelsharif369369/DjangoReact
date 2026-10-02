import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

function Checkout() {
  const navigate = useNavigate()

  const [customerName, setCustomerName] =
    useState("")

  const [phone, setPhone] = useState("")

  const [address, setAddress] =
    useState("")

  const [notes, setNotes] = useState("")

  const [error, setError] = useState("")

  const [loading, setLoading] =
    useState(false)

  const username =
    localStorage.getItem("username")

  const cartKey = username
    ? `cart_${username}`
    : "cart"

  const cart =
    JSON.parse(
      localStorage.getItem(cartKey)
    ) || []

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        item.quantity,
    0
  )

  function handleSubmit(event) {
    event.preventDefault()

    setError("")
    setLoading(true)

    const data = {
      customer_name: customerName,
      phone: phone,
      address: address,
      notes: notes,
      items: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
    }

    api
      .post("orders/", data)
      .then((response) => {
        console.log(
          "Order created:",
          response.data
        )

        localStorage.removeItem(cartKey)

        window.dispatchEvent(
          new Event("cartUpdated")
        )

        alert(
          `Order #${response.data.id} created successfully`
        )

        navigate("/")
      })
      .catch((error) => {
        console.error(
          "Order error:",
          error
        )

        if (error.response) {
          if (
            error.response.data?.error
          ) {
            setError(
              error.response.data.error
            )
          } else {
            setError(
              `Error ${error.response.status}: ${error.response.statusText}`
            )
          }
        } else {
          setError(
            "Cannot connect to Django API"
          )
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  if (cart.length === 0) {
    return (
      <div>
        <h2>Checkout</h2>

        <p>
          Your cart is empty.
        </p>

        <Link to="/">
          <button type="button">
            Back to Products
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="product-card">
      <h2>Checkout</h2>

      {error && (
        <p>{error}</p>
      )}

      <h3>
        Customer Information
      </h3>

      <form
        onSubmit={handleSubmit}
      >
        <div>
          <label>
            Name
          </label>

          <br />

          <input
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(
                event.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>
            Phone
          </label>

          <br />

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              setPhone(
                event.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>
            Address
          </label>

          <br />

          <textarea
            value={address}
            onChange={(event) =>
              setAddress(
                event.target.value
              )
            }
            required
          />
        </div>

        <br />

        <div>
          <label>
            Notes
          </label>

          <br />

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value
              )
            }
          />
        </div>

        <br />

        <h3>
          Order Summary
        </h3>

        {cart.map((item) => (
          <div key={item.id}>
            <p>
              {item.name} ×{" "}
              {item.quantity}
            </p>

            <p>
              Subtotal:{" "}
              {(
                Number(item.price) *
                item.quantity
              ).toFixed(2)}{" "}
              LYD
            </p>
          </div>
        ))}

        <h3>
          Total: {total.toFixed(2)} LYD
        </h3>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating Order..."
            : "Place Order"}
        </button>
      </form>

      <br />

      <Link to="/cart">
        <button type="button">
          Back to Cart
        </button>
      </Link>
    </div>
  )
}

export default Checkout
