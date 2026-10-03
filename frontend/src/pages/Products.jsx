import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import api from "../services/api"
import ProductCard from "../components/ProductCard"


function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [sort, setSort] = useState("newest")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    Promise.all([
      api.get("products/"),
      api.get("categories/"),
    ])
      .then(
        ([
          productsResponse,
          categoriesResponse,
        ]) => {
          setProducts(
            Array.isArray(
              productsResponse.data
            )
              ? productsResponse.data
              : []
          )

          setCategories(
            Array.isArray(
              categoriesResponse.data
            )
              ? categoriesResponse.data
              : []
          )
        }
      )
      .catch((error) => {
        console.error(
          "Error fetching products or categories:",
          error
        )

        setError(
          "Could not load products or categories."
        )
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])


  const filteredProducts = useMemo(() => {
    let result = [...products]


    const searchValue =
      search.trim().toLowerCase()


    if (searchValue) {
      result = result.filter(
        (product) => {
          const name =
            String(
              product.name || ""
            ).toLowerCase()

          const description =
            String(
              product.description || ""
            ).toLowerCase()

          return (
            name.includes(
              searchValue
            ) ||
            description.includes(
              searchValue
            )
          )
        }
      )
    }


    if (category) {
      result = result.filter(
        (product) =>
          String(
            product.category ?? ""
          ) === String(category)
      )
    }


    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      )
    }


    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      )
    }


    if (sort === "name") {
      result.sort(
        (a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            )
          )
      )
    }


    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(
            b.created_at
          ) -
          new Date(
            a.created_at
          )
      )
    }


    return result
  }, [
    products,
    search,
    category,
    sort,
  ])


  if (loading) {
    return (
      <div>
        <h2>Products</h2>

        <p>
          Loading products...
        </p>
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
            {filteredProducts.length !==
            1
              ? "s"
              : ""}
          </p>
        </div>


        <Link to="/add-product">
          <button>
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
            value={category}
            onChange={(event) => {
              const value =
                event.target.value

              setCategory(value)
            }}
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
