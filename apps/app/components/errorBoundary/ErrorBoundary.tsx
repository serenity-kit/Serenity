import React from "react";
import { Text } from "react-native";

export class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary:");
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Text>
          Something went wrong. Please try again or reach out to support
          hi@serenity.re
        </Text>
      );
    }

    return this.props.children;
  }
}
