import { Component } from "react"


class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
    }
  }


  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }


  componentDidCatch(error, errorInfo) {
    console.error(
      "React Runtime Error:",
      error,
      errorInfo
    )
  }


  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "30px",
            margin: "20px",
            fontFamily: "monospace",
          }}
        >
          <h2>
            Something went wrong
          </h2>

          <p>
            React Runtime Error:
          </p>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "8px",
              overflowX: "auto",
            }}
          >
            {this.state.error?.toString()}
          </pre>
        </div>
      )
    }


    return this.props.children
  }
}


export default ErrorBoundary
