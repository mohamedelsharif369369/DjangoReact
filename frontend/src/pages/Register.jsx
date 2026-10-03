import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)


  function handleSubmit(event) {
    event.preventDefault()

    setError("")
    setSuccess("")
    setLoading(true)


    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }


    const registerData = {
      username: username,
      password: password,
    }


    api
      .post("register/", registerData)

      .then(() => {
        return api.post(
          "token/",
          {
            username: username,
            password: password,
          }
        )
      })

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

        setSuccess(
          "Account created successfully"
        )

        setTimeout(() => {
          navigate("/")
        }, 500)
      })

      .catch((error) => {
        console.error(
          "Register/Login error:",
          error
        )

        if (error.response) {
          console.log(
            "Server response:",
            error.response.data
          )

          const data = error.response.data

          if (data.username) {
            setError(
              `Username: ${data.username[0]}`
            )
          } else if (data.password) {
            setError(
              `Password: ${data.password[0]}`
            )
          } else if (data.detail) {
            setError(data.detail)
          } else if (data.error) {
            setError(data.error)
          } else {
            setError(
              "Registration or login failed"
            )
          }
        } else {
          setError(
            "Cannot connect to Django API"
          )
        }
      })

      .finally(() => {
        setLoading(false)
      })
  }


  return (
    <div className="product-card">

      <h2>Create Account</h2>


      {error && (
        <p>
          {error}
        </p>
      )}


      {success && (
        <p>
          {success}
        </p>
      )}


      <form onSubmit={handleSubmit}>

        <div>
          <label>
            Username
          </label>

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
          <label>
            Password
          </label>

          <br />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            minLength="8"
            required
          />
        </div>


        <br />


        <div>
          <label>
            Confirm Password
          </label>

          <br />

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            minLength="8"
            required
          />
        </div>


        <br />


        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

      </form>


      <br />


      <p>
        Already have an account?
      </p>


      <Link to="/login">
        <button type="button">
          Login
        </button>
      </Link>


      <br />
      <br />


      <Link to="/">
        <button type="button">
          Back to Products
        </button>
      </Link>

    </div>
  )
}


export default Register
