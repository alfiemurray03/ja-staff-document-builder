import React from 'react';

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (this.state.failed) {
      return <main className="min-h-screen grid place-items-center p-6"><p>The application could not be loaded. Please try again or contact your system administrator.</p></main>;
    }
    return this.props.children;
  }
}
