import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js"

import api from "../services/api"


function Checkout() {
  const navigate = useNavigate()

  const [customerName, setCustomerName] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [address, setAddress] =
    useState("")

  const [notes, setNotes] =
    useState("")

  const [error, setError] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [localOrder, setLocalOrder] =
    useState(null)

  const [paymentLoading, setPaymentLoading] =
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

  const paypalClientId =
    import.meta.env.VITE_PAYPAL_CLIENT_ID

  function createLocalOrder(event) {
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

        setLocalOrder(response.data)
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

  async function createPayPalOrder() {
    if (!localOrder?.id) {
      throw new Error(
        "Local order has not been created"
      )
    }

    setError("")

    try {
      const response = await api.post(
        "payments/paypal/create/",
        {
          order_id: localOrder.id,
        }
      )

      return response.data.id
    } catch (error) {
      console.error(
        "PayPal create order error:",
        error
      )

      const message =
        error.response?.data?.error ||
        "Could not create PayPal order"

      setError(message)

      throw error
    }
  }

  async function capturePayPalOrder(
    data
  ) {
    if (!localOrder?.id) {
      throw new Error(
        "Local order has not been created"
      )
    }

    setPaymentLoading(true)
    setError("")

    try {
      const response = await api.post(
        "payments/paypal/capture/",
        {
          order_id: localOrder.id,
          paypal_order_id: data.orderID,
        }
      )

      if (
        response.data?.success &&
        response.data?.status === "paid"
      ) {
        localStorage.removeItem(
          cartKey
        )

        window.dispatchEvent(
          new Event("cartUpdated")
        )

        alert(
          `Payment successful! Order #${localOrder.id}`
        )

        navigate("/")
      } else {
        setError(
          "Payment was not completed."
        )
      }
    } catch (error) {
      console.error(
        "PayPal capture error:",
        error
      )

      const message =
        error.response?.data?.error ||
        "PayPal payment could not be completed."

      setError(message)
    } finally {
      setPaymentLoading(false)
    }
  }

  function handlePayPalCancel() {
    setError(
      "PayPal payment was cancelled. Your order is still pending."
    )
  }

  function handlePayPalError(error) {
    console.error(
      "PayPal error:",
      error
    )

    setError(
      "PayPal payment could not be completed. Please try again."
    )
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
        <p>
          {error}
        </p>
      )}

      <h3>
        Customer Information
      </h3>

      {!localOrder && (
        <form
          onSubmit={createLocalOrder}
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

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Order..."
              : "Continue to Payment"}
          </button>
        </form>
      )}

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

      {localOrder && (
        <div>
          <hr />

          <h3>
            Pay with PayPal
          </h3>

          <p>
            Order #{localOrder.id}
          </p>

          <p>
            Your order total is{" "}
            {Number(
              localOrder.total
            ).toFixed(2)}{" "}
            LYD.
          </p>

          <p>
            PayPal will process the
            converted USD amount.
          </p>

          {paymentLoading && (
            <p>
              Processing payment...
            </p>
          )}

          {!paypalClientId ? (
            <p>
              PayPal Client ID is missing.
            </p>
          ) : (
            <PayPalScriptProvider
              options={{
                "client-id":
                  paypalClientId,
                currency: "USD",
                intent: "capture",
                components: "buttons",
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  shape: "rect",
                  label: "paypal",
                }}
                disabled={
                  paymentLoading
                }
                createOrder={
                  createPayPalOrder
                }
                onApprove={
                  capturePayPalOrder
                }
                onCancel={
                  handlePayPalCancel
                }
                onError={
                  handlePayPalError
                }
              />
            </PayPalScriptProvider>
          )}
        </div>
      )}

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
