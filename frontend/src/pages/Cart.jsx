import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function Cart() {
  const [cart, setCart] = useState([])

  const username =
    localStorage.getItem("username")

  const cartKey = username
    ? `cart_${username}`
    : "cart"

  useEffect(() => {
    const savedCart =
      JSON.parse(
        localStorage.getItem(cartKey)
      ) || []

    setCart(savedCart)
  }, [cartKey])

  function updateCart(newCart) {
    setCart(newCart)

    localStorage.setItem(
      cartKey,
      JSON.stringify(newCart)
    )

    window.dispatchEvent(
      new Event("cartUpdated")
    )
  }

  function increaseQuantity(productId) {
    const newCart = cart.map((item) =>
      item.id === productId
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    )

    updateCart(newCart)
  }

  function decreaseQuantity(productId) {
    const newCart = cart
      .map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter(
        (item) => item.quantity > 0
      )

    updateCart(newCart)
  }

  function removeItem(productId) {
    const newCart = cart.filter(
      (item) => item.id !== productId
    )

    updateCart(newCart)
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        item.quantity,
    0
  )

  return (
    <div>
      <h2>Shopping Cart</h2>

      {cart.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>

          <Link to="/">
            <button type="button">
              Back to Products
            </button>
          </Link>
        </div>
      ) : (
        <div>
          {cart.map((item) => (
            <div
              className="product-card"
              key={item.id}
              style={{
                marginBottom: "20px",
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    marginBottom: "15px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "200px",
                    borderRadius: "12px",
                    backgroundColor: "#e9ecef",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "15px",
                    fontSize: "60px",
                  }}
                >
                  📦
                </div>
              )}

              <h3>{item.name}</h3>

              <p>
                Price: {item.price} LYD
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "15px",
                  marginBottom: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    decreaseQuantity(
                      item.id
                    )
                  }
                  style={{
                    width: "45px",
                    height: "45px",
                    padding: "0",
                    fontSize: "22px",
                  }}
                >
                  -
                </button>

                <span
                  style={{
                    minWidth: "40px",
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    increaseQuantity(
                      item.id
                    )
                  }
                  style={{
                    width: "45px",
                    height: "45px",
                    padding: "0",
                    fontSize: "22px",
                  }}
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeItem(item.id)
                  }
                  style={{
                    marginLeft: "5px",
                  }}
                >
                  Remove
                </button>
              </div>

              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "17px",
                }}
              >
                Subtotal:{" "}
                {(
                  Number(item.price) *
                  item.quantity
                ).toFixed(2)}{" "}
                LYD
              </p>
            </div>
          ))}

          <div
            className="product-card"
            style={{
              marginTop: "20px",
            }}
          >
            <h3>
              Total: {total.toFixed(2)} LYD
            </h3>

            <Link to="/checkout">
              <button type="button">
                Checkout
              </button>
            </Link>
          </div>
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

export default Cart
