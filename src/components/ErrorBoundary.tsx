import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    sessionStorage.setItem("jarvis-last-error", `${error.name}: ${error.message}`);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="deck degraded">
        <div className="degradedNotice">演示降级模式已启用</div>
      </main>
    );
  }
}
