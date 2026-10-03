import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import api from "../services/api"
import ProductCard from "../components/ProductCard"


function Products() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("newest")

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
          setError(
            "Cannot connect to Django API"
          )
        }
      })
  }, [])


  const filteredProducts = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase()

    let result = products.filter((product) => {
      if (!searchText) {
        return true
      }

      const name =
        product.name?.toLowerCase() || ""

      const description =
        product.description?.toLowerCase() || ""

      return (
        name.includes(searchText) ||
        description.includes(searchText)
      )
    })


    result = [...result].sort(
      (a, b) => {
        if (sort === "price-low") {
          return (
            Number(a.price) -
            Number(b.price)
          )
        }

        if (sort === "price-high") {
          return (
            Number(b.price) -
            Number(a.price)
          )
        }

        if (sort === "name") {
          return (
            (a.name || "").localeCompare(
              b.name || ""
            )
          )
        }

        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        )
      }
    )


    return result
  }, [products, search, sort])


  return (
    <div>

      <div className="products-header">

        <div>
          <h2>ISKNDR Products</h2>

          <p className="products-subtitle">
            Discover our products
          </p>
        </div>

        {token && (
          <Link to="/add-product">
            <button type="button">
              + Add Product
            </button>
          </Link>
        )}

      </div>


      <div className="products-controls">

        <div className="search-box">

          <span className="search-icon">
            🔎
          </span>

          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <div className="sort-box">

          <label htmlFor="sort">
            Sort by
          </label>

          <select
            id="sort"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
          >
            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="name">
              Name: A to Z
            </option>
          </select>

        </div>

      </div>


      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {!error && (
        <p className="results-count">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "product"
            : "products"}{" "}
          found
        </p>
      )}


      {filteredProducts.length > 0 ? (
        <div className="products-grid">

          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}

        </div>
      ) : (
        !error && (
          <div className="empty-products">

            <div className="empty-icon">
              🔍
            </div>

            <h3>
              No products found
            </h3>

            <p>
              Try another search term.
            </p>

          </div>
        )
      )}

    </div>
  )
}


export default Products
