import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

function Login() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event) {
    event.preventDefault()

    setError("")

    const data = {
      username: username,
      password: password,
    }

    api
      .post("token/", data)
      .then((response) => {
        localStorage.setItem(
          "access",
          response.data.access
        )

        localStorage.setItem(
          "refresh",
          response.data.refresh
        )

        localStorage.setItem(
          "username",
          username
        )

        window.dispatchEvent(
          new Event("cartUpdated")
        )

        navigate("/")
      })
      .catch((error) => {
        console.error("Login error:", error)

        if (error.response) {
          setError(
            "Username or password is incorrect"
          )
        } else {
          setError(
            "Cannot connect to Django API"
          )
        }
      })
  }

  return (
    <div className="product-card">
      <h2>Login</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <br />

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            required
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        <br />

        <button type="submit">
          Login
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

export default Login
