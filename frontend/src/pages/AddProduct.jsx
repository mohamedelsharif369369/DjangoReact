import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"

import api from "../services/api"


function AddProduct() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [image, setImage] = useState(null)

  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState("")

  const [error, setError] = useState("")
  const [categoriesLoading, setCategoriesLoading] =
    useState(true)


  useEffect(() => {
    api
      .get("categories/")
      .then((response) => {
        setCategories(response.data)
      })
      .catch((error) => {
        console.error(
          "Error fetching categories:",
          error
        )

        setError(
          "Could not load product categories."
        )
      })
      .finally(() => {
        setCategoriesLoading(false)
      })
  }, [])


  function handleSubmit(event) {
    event.preventDefault()

    setError("")

    const formData = new FormData()

    formData.append("name", name)
    formData.append(
      "description",
      description
    )
    formData.append("price", price)
    formData.append("stock", stock)

    if (category) {
      formData.append(
        "category",
        category
      )
    }

    if (image) {
      formData.append("image", image)
    }


    api
      .post("products/", formData)
      .then((response) => {
        console.log(
          "Product created:",
          response.data
        )

        navigate("/")
      })
      .catch((error) => {
        console.error(
          "Error creating product:",
          error
        )

        if (error.response) {
          if (
            error.response.data
              ?.category
          ) {
            setError(
              `Category: ${error.response.data.category}`
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
  }


  return (
    <div className="product-card">

      <h2>Add Product</h2>


      {error && (
        <p className="error-message">
          {error}
        </p>
      )}


      <form onSubmit={handleSubmit}>

        <div>
          <label>
            Name
          </label>

          <br />

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            required
          />
        </div>


        <br />


        <div>
          <label>
            Description
          </label>

          <br />

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
          />
        </div>


        <br />


        <div>
          <label>
            Category
          </label>

          <br />

          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading
                ? "Loading categories..."
                : "Select a category"}
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


        <br />


        <div>
          <label>
            Price
          </label>

          <br />

          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(event) =>
              setPrice(
                event.target.value
              )
            }
            required
          />
        </div>


        <br />


        <div>
          <label>
            Stock
          </label>

          <br />

          <input
            type="number"
            min="0"
            value={stock}
            onChange={(event) =>
              setStock(
                event.target.value
              )
            }
            required
          />
        </div>


        <br />


        <div>
          <label>
            Product Image
          </label>

          <br />

          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const selectedFile =
                event.target.files[0]

              setImage(
                selectedFile || null
              )
            }}
          />
        </div>


        <br />


        <button type="submit">
          Add Product
        </button>

      </form>


      <br />


      <Link to="/">
        <button type="button">
          Back to Products
        </button>
      </Link>

    </div>
  )
}


export default AddProduct
