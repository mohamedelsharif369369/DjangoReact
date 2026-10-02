import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

function CartIcon() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function updateCartCount() {
      const username =
        localStorage.getItem("username")

      if (!username) {
        setCartCount(0)
        return
      }

      const cartKey = `cart_${username}`

      const cart =
        JSON.parse(
          localStorage.getItem(cartKey)
        ) || []

      const count = cart.reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      )

      setCartCount(count)
    }

    updateCartCount()

    window.addEventListener(
      "storage",
      updateCartCount
    )

    window.addEventListener(
      "cartUpdated",
      updateCartCount
    )

    return () => {
      window.removeEventListener(
        "storage",
        updateCartCount
      )

      window.removeEventListener(
        "cartUpdated",
        updateCartCount
      )
    }
  }, [])

  const hasProducts = cartCount > 0

  return (
    <Link
      to="/cart"
      style={{
        textDecoration: "none",
        display: "inline-block",
        marginLeft: "10px",
      }}
    >
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          backgroundColor: hasProducts
            ? "red"
            : "white",
          border: "2px solid red",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontSize: "22px",
        }}
      >
        🛒

        {hasProducts && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              backgroundColor: "white",
              color: "red",
              borderRadius: "50%",
              minWidth: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              border: "1px solid red",
            }}
          >
            {cartCount}
          </span>
        )}
      </div>
    </Link>
  )
}

export default CartIcon
