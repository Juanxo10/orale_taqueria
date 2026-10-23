import { Component } from "react";

// Evita la pantalla en blanco: si algo falla al pintar, muestra `fallback` (null = simplemente se omite esa parte).
export default class ErrorBoundary extends Component {
  state = { fallo: false };
  static getDerivedStateFromError() { return { fallo: true }; }
  componentDidCatch(error) { console.error("Error al mostrar la página:", error); }
  render() { return this.state.fallo ? this.props.fallback ?? null : this.props.children; }
}
