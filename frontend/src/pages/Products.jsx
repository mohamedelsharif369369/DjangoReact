import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import ProductCard from "../components/ProductCard"

function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")

  const token = localStorage.getItem("access")

  useEffect(() => {
    api
      .get("products/")
      .then((response) => {
        setProducts(response.data)
      })
      .catch((error) => {
        console.error(
          "Error fetching products:",
          error
        )

        if (error.response) {
          setError(
            `Error ${error.response.status}: ${error.response.statusText}`
          )
        } else {
          setError("Cannot connect to Django API")
        }
      })
  }, [])

  return (
    <div>
      <h2>Products</h2>

      {token && (
        <Link to="/add-product">
          <button type="button">
            Add Product
          </button>
        </Link>
      )}

      <br />
      <br />

      {error && <p>{error}</p>}

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  )
}

export default Products
