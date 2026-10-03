import { Link } from "react-router-dom"


function ProductCard({ product }) {
  const imageUrl =
    product.image || null


  const stock = Number(
    product.stock || 0
  )


  return (
    <div className="product-card">

      <div className="product-image-container">

        {imageUrl ? (
          <img
            className="product-image"
            src={imageUrl}
            alt={product.name}
          />
        ) : (
          <div className="product-placeholder">
            📦
          </div>
        )}

      </div>


      <div className="product-card-content">

        <h3>
          {product.name}
        </h3>


        <p className="product-description">
          {product.description ||
            "No description available."}
        </p>


        <div className="product-info">

          <span className="product-price">
            {Number(product.price).toFixed(2)} LYD
          </span>


          <span
            className={
              stock > 0
                ? "product-stock"
                : "product-stock out-of-stock"
            }
          >
            {stock > 0
              ? `Stock: ${stock}`
              : "Out of stock"}
          </span>

        </div>


        <Link
          to={`/products/${product.id}`}
          className="product-details-link"
        >
          <button
            type="button"
            className="view-product-button"
          >
            View Details
          </button>
        </Link>

      </div>

    </div>
  )
}


export default ProductCard
