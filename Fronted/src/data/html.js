// Escapa texto del cliente antes de meterlo en HTML (tickets e informes que se abren en una ventana nueva).
export const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
