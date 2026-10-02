import { Link } from "react-router-dom"

function ProductCard({ product }) {
  const imageUrl = product.image || null

  return (
    <div className="product-card">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          style={{
            width: "100%",
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

      <h3>{product.name}</h3>

      <p>{product.description}</p>

      <p className="product-price">
        {product.price} LYD
      </p>

      <p className="product-stock">
        Stock: {product.stock}
      </p>

      <Link to={`/products/${product.id}`}>
        <button type="button">
          View Details
        </button>
      </Link>
    </div>
  )
}

export default ProductCard
