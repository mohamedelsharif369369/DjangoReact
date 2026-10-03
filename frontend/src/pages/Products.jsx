import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import api from "../services/api"
import ProductCard from "../components/ProductCard"


function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sort, setSort] = useState("newest")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError("")

        const productsResponse =
          await api.get("products/")

        const categoriesResponse =
          await api.get("categories/")

        setProducts(
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : []
        )

        setCategories(
          Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : []
        )

      } catch (err) {
        console.error(
          "Products page error:",
          err
        )

        setError(
          "Could not load products or categories."
        )

      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])


  function handleCategoryChange(event) {
    setSelectedCategory(
      event.target.value
    )
  }


  function matchesProduct(product) {
    const searchValue =
      search.trim().toLowerCase()

    if (searchValue) {
      const name =
        String(product.name || "")
          .toLowerCase()

      const description =
        String(product.description || "")
          .toLowerCase()

      if (
        !name.includes(searchValue) &&
        !description.includes(searchValue)
      ) {
        return false
      }
    }


    if (selectedCategory) {
      if (
        String(product.category || "") !==
        String(selectedCategory)
      ) {
        return false
      }
    }


    return true
  }


  let visibleProducts = products.filter(
    matchesProduct
  )


  if (sort === "price-low") {
    visibleProducts = [
      ...visibleProducts,
    ].sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    )
  }


  if (sort === "price-high") {
    visibleProducts = [
      ...visibleProducts,
    ].sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    )
  }


  if (sort === "name") {
    visibleProducts = [
      ...visibleProducts,
    ].sort(
      (a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
    )
  }


  if (sort === "newest") {
    visibleProducts = [
      ...visibleProducts,
    ].sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
  }


  const visibleProductIds =
    new Set(
      visibleProducts.map(
        (product) => product.id
      )
    )


  if (loading) {
    return (
      <div>
        <h2>Products</h2>
        <p>Loading products...</p>
      </div>
    )
  }


  return (
    <div>

      <div className="products-header">

        <div>

          <h2>
            Products
          </h2>

          <p className="results-count">
            {visibleProducts.length}{" "}
            product
            {visibleProducts.length !== 1
              ? "s"
              : ""}
          </p>

        </div>


        <Link to="/add-product">

          <button type="button">
            Add Product
          </button>

        </Link>

      </div>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <div className="products-controls">

        <div className="search-box">

          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <div className="category-box">

          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
          >

            <option value="">
              All Categories
            </option>


            {categories.map(
              (item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              )
            )}

          </select>

        </div>


        <div className="sort-box">

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
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
              Name: A-Z
            </option>

          </select>

        </div>

      </div>


      <div className="product-grid">

        {products.map(
          (product) => {

            const isVisible =
              visibleProductIds.has(
                product.id
              )

            return (
              <div
                key={product.id}
                style={{
                  display: isVisible
                    ? "block"
                    : "none",
                }}
              >

                <ProductCard
                  product={product}
                />

              </div>
            )
          }
        )}

      </div>


      <div
        className="empty-state"
        style={{
          display:
            visibleProducts.length === 0
              ? "block"
              : "none",
        }}
      >

        <h3>
          No products found
        </h3>

        <p>
          Try another search or category.
        </p>

      </div>

    </div>
  )
}


export default Products
