import { Component } from 'react'

export default class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure?.() }
  render() {
    return this.state.failed
      ? this.props.fallback
      : this.props.children
  }
}
