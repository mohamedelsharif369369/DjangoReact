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

        const productsData =
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : []

        const categoriesData =
          Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : []

        setProducts(productsData)
        setCategories(categoriesData)

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
    const value = event.target.value

    console.log(
      "Selected category:",
      value
    )

    setSelectedCategory(value)
  }


  let filteredProducts = products.filter(
    (product) => {
      const searchText =
        search.trim().toLowerCase()

      if (!searchText) {
        return true
      }

      const name =
        String(product.name || "")
          .toLowerCase()

      const description =
        String(product.description || "")
          .toLowerCase()

      return (
        name.includes(searchText) ||
        description.includes(searchText)
      )
    }
  )


  if (selectedCategory) {
    filteredProducts =
      filteredProducts.filter(
        (product) =>
          String(product.category || "") ===
          String(selectedCategory)
      )
  }


  filteredProducts = [
    ...filteredProducts,
  ]


  if (sort === "price-low") {
    filteredProducts.sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    )
  }


  if (sort === "price-high") {
    filteredProducts.sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    )
  }


  if (sort === "name") {
    filteredProducts.sort(
      (a, b) =>
        String(a.name || "").localeCompare(
          String(b.name || "")
        )
    )
  }


  if (sort === "newest") {
    filteredProducts.sort(
      (a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
    )
  }


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
          <h2>Products</h2>

          <p className="results-count">
            {filteredProducts.length}{" "}
            product
            {filteredProducts.length !== 1
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
              setSearch(event.target.value)
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

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}

          </select>

        </div>


        <div className="sort-box">

          <select
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
              Name: A-Z
            </option>

          </select>

        </div>

      </div>


      {filteredProducts.length === 0 ? (

        <div className="empty-state">

          <h3>
            No products found
          </h3>

          <p>
            Try another search or category.
          </p>

        </div>

      ) : (

        <div className="product-grid">

          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}

        </div>

      )}

    </div>
  )
}


export default Products
