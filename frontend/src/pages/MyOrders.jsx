import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("my-orders/")
      .then((response) => {
        setOrders(response.data)
      })
      .catch((error) => {
        console.error(
          "My Orders error:",
          error
        )

        if (error.response) {
          setError(
            `Error ${error.response.status}: ${error.response.statusText}`
          )
        } else {
          setError(
            "Cannot connect to Django API"
          )
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <p>Loading orders...</p>
  }

  if (error) {
    return (
      <div className="product-card">
        <h2>My Orders</h2>

        <p>{error}</p>

        <Link to="/">
          <button type="button">
            Back to Products
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div className="product-card">
          <p>
            You do not have any orders yet.
          </p>

          <Link to="/">
            <button type="button">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div
              className="product-card"
              key={order.id}
              style={{
                marginBottom: "20px",
              }}
            >
              <h3>
                Order {order.id}
              </h3>

              <p>
                Customer:{" "}
                {order.customer_name}
              </p>

              <p>
                Phone: {order.phone}
              </p>

              <p>
                Address: {order.address}
              </p>

              <p>
                Status: {order.status}
              </p>

              <p>
                Order Date:{" "}
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </p>

              {order.notes && (
                <p>
                  Notes: {order.notes}
                </p>
              )}

              <p>
                Total:{" "}
                {Number(
                  order.total
                ).toFixed(2)}{" "}
                LYD
              </p>

              <h4>
                Products
              </h4>

              {order.items &&
                order.items.map(
                  (item) => (
                    <div
                      key={item.id}
                      style={{
                        borderTop:
                          "1px solid #ddd",
                        paddingTop:
                          "10px",
                        marginTop:
                          "10px",
                      }}
                    >
                      <p>
                        {item.product_name}
                      </p>

                      <p>
                        Quantity:{" "}
                        {item.quantity}
                      </p>

                      <p>
                        Price:{" "}
                        {item.price} LYD
                      </p>

                      <p>
                        Subtotal:{" "}
                        {(
                          Number(
                            item.price
                          ) *
                          item.quantity
                        ).toFixed(2)}{" "}
                        LYD
                      </p>
                    </div>
                  )
                )}
            </div>
          ))}
        </div>
      )}

      <br />

      <Link to="/">
        <button type="button">
          Back to Products
        </button>
      </Link>
    </div>
  )
}

export default MyOrders
