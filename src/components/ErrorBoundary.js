import React from "react";
import { logErrorToTelegram } from "./utils/errorLogger";


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToTelegram(error, "React Component Error");
    console.error("React Error Boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong 😥</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
