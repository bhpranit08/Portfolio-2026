import { Component } from 'react'

export default class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <div className="global-scene"><p className="scene-status" role="status">CORE unavailable. The portfolio is still online.</p></div>
      : this.props.children
  }
}
