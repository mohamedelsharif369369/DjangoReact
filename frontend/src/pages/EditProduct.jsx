import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../services/api"

function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get(`products/${id}/`)
      .then((response) => {
        const product = response.data

        setName(product.name)
        setDescription(product.description)
        setPrice(product.price)
        setStock(product.stock)

        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching product:", error)

        setLoading(false)

        if (error.response) {
          setError(
            `Error ${error.response.status}: ${error.response.statusText}`
          )
        } else {
          setError("Cannot connect to Django API")
        }
      })
  }, [id])

  function handleSubmit(event) {
    event.preventDefault()

    setError("")

    const product = {
      name: name,
      description: description,
      price: price,
      stock: stock,
    }

    api
      .patch(`products/${id}/`, product)
      .then((response) => {
        console.log("Product updated:", response.data)
        navigate(`/products/${id}`)
      })
      .catch((error) => {
        console.error("Error updating product:", error)

        if (error.response) {
          setError(
            `Error ${error.response.status}: ${error.response.statusText}`
          )
        } else {
          setError("Cannot connect to Django API")
        }
      })
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (error && !name) {
    return (
      <div className="product-card">
        <h2>Error</h2>

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
    <div className="product-card">
      <h2>Edit Product</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <br />

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Price</label>
          <br />

          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
          />
        </div>

        <br />

        <div>
          <label>Stock</label>
          <br />

          <input
            type="number"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
          />
        </div>

        <br />

        <button type="submit">
          Update Product
        </button>
      </form>

      <br />

      <Link to={`/products/${id}`}>
        <button type="button">
          Back to Product
        </button>
      </Link>
    </div>
  )
}

export default EditProduct
