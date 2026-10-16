// Fuente única de verdad para productos y precios del menú.
// Usado tanto por menu.jsx (armar pedido) como por pago.jsx (calcular total a cobrar).
// Debe reflejar exactamente lo que existe en la tabla `productos` de la base de datos.

export const CARBOS = ["Arroz integral", "Papa criolla", "Quinoa"];

export const TOPPINGS = [
  "Aguacate", "Champiñones", "Cherry", "Maíz", "Zanahoria", "Pepino",
  "Guacamole", "Repollo morado", "Piña asada", "Mango", "Pico de gallo",
  "Nueces", "Nachos", "Brócoli", "Queso",
];

export const PROTEINAS = [
  { name: "Pollo",       price: 8500 },
  { name: "Atún",        price: 8500 },
  { name: "Carne molida", price: 6500 },
  { name: "Falafel",     price: 5000 },
  { name: "Huevo",       price: 4000 },
  { name: "Lomo de res", price: 10000 },
  { name: "Cerdo",       price: 8500 },
];

export const BEBIDAS = ["Limonada", "Agua y limón"];

export const BOWL_BASE = 12000;
export const TOPPING_EXTRA = 3000;
export const TOPPINGS_GRATIS = 4;
export const CAJA = 1000;
export const VASO = 1000;
export const DOM = 6000;
export const LECHE_ALMENDRAS = 2500;

export const FRAPPES_NAMES = new Set([
  "Frappe de café", "Frappe mocca", "Frappe arequipe", "Frappe baileys",
  "Frappe té chai", "Caños cristales", "Caños negros", "Macarena",
]);

export const calcBowlPrice = (tops = [], prots = [], bev = null) => {
  const toppingsCost = Math.max(0, tops.length - TOPPINGS_GRATIS) * TOPPING_EXTRA;
  const protsCost = prots.reduce((s, p) => {
    const name = typeof p === "string" ? p : p?.name;
    const prot = PROTEINAS.find((x) => x.name === name);
    return s + (prot?.price ?? 0);
  }, 0);
  return BOWL_BASE + toppingsCost + protsCost + CAJA + (bev ? VASO : 0);
};

export const CAFETERIA = [
  { cat: "Brunch", items: [
    { name: "Pizzeta pesto", price: 31000 },
    { name: "Pizzeta carne", price: 31000 },
    { name: "Picada especial", price: 52200 },
    { name: "Sopa de tomate", price: 24000 },
    { name: "Bowl salado", price: 24000 },
  ]},
  { cat: "Emparedados", items: [
    { name: "Emparedado de lomo", price: 25000 },
    { name: "Choripan", price: 20500 },
    { name: "Emparedado integral", price: 26500 },
    { name: "Emparedado de cerdo", price: 24000 },
    { name: "Emparedado de huevo", price: 21000 },
    { name: "Emparedado de salami", price: 21000 },
    { name: "Croburger", price: 26000 },
  ]},
  { cat: "Desayunos", items: [
    { name: "Criollito", price: 22800 },
    { name: "Hayaca tradicional", price: 17500 },
    { name: "Hayaca picante", price: 17500 },
    { name: "Wraps de espinaca", price: 17300 },
    { name: "Wraps de cerdo", price: 27500 },
    { name: "Desayuno Llanero", price: 14800 },
  ]},
  { cat: "Omelet", items: [
    { name: "Omelet Opción 1", price: 18800, desc: "Huevos, cebolla caramelizada, pimentón, champiñones, jamón y queso mozzarella" },
    { name: "Omelet Opción 2", price: 18800, desc: "Huevos, pasta de tomate, lomo de res molido y queso mozzarella" },
    { name: "Omelet Opción 3", price: 18800, desc: "Huevos, salsa pesto, tomate y queso mozzarella" },
  ]},
  { cat: "Montaditos", items: [
    { name: "Montadito de huevo", price: 12500 },
    { name: "Montadito napolitano", price: 17200 },
    { name: "Montadito de carne", price: 15000 },
  ]},
  { cat: "Bowls y Fruta", items: [
    { name: "Bowl de yogurt", price: 23000 },
    { name: "Mini bowl de yogurt", price: 16500 },
    { name: "Bowl de avena", price: 16000 },
    { name: "Bowl de açaí", price: 23000 },
    { name: "Cuchareable de açaí", price: 16000 },
    { name: "Fruta fresca", price: 14200 },
  ]},
  { cat: "Bebidas", items: [
    { name: "Soda Hatsu", price: 8000, desc: "Frambuesa, limón-hierbabuena, sandía, uva blanca" },
    { name: "Colombiano", price: 5900, desc: "Café tipo americano" },
    { name: "Acacireño", price: 6600, desc: "" },
    { name: "Capuchino", price: 8200, desc: "Café y leche deslactosada" },
  ]},
  { cat: "Batidos", items: [
    { name: "Batido Guayuriba", price: 12500, desc: "Frutos amarillos: Mango, maracuyá, piña y naranja" },
    { name: "Batido Corocora", price: 12500, desc: "Frutos rojos: Fresa, zanahoria, papaya y uchuva" },
    { name: "Batido Sardinata", price: 12500, desc: "Frutos verdes: Apio, espinaca, pepino, manzana verde" },
    { name: "Batido Açaí", price: 14000 },
  ]},
  { cat: "Frappes", note: "Si deseas tu frappe en leche de almendras tiene un costo adicional de $2.500", items: [
    { name: "Frappe de café", price: 18000, desc: "Café, leche en polvo y eritritol" },
    { name: "Frappe mocca", price: 18000, desc: "Café, chocolate, leche en polvo y eritritol" },
    { name: "Frappe arequipe", price: 18000, desc: "Café, arequipe, leche en polvo y eritritol" },
    { name: "Frappe baileys", price: 22300, desc: "Café, licor baileys, leche en polvo y eritritol" },
    { name: "Frappe té chai", price: 18000, desc: "Té chai, leche en polvo y eritritol" },
    { name: "Caños cristales", price: 18000, desc: "Té flor azul, leche en polvo, vainilla y eritritol" },
    { name: "Caños negros", price: 18000, desc: "Carbón activado, limón, naranja y hierbabuena" },
    { name: "Macarena", price: 18000, desc: "Té rosado con proteínas, leche en polvo y eritritol" },
  ]},
  { cat: "Combos", items: [
    { name: "Hayaca + Chocolate", price: 24000 },
    { name: "Hayaca + Capuchino", price: 24000 },
    { name: "Hayaca + Aguapanela", price: 24000 },
    { name: "Hayaca + Colombiano", price: 24000 },
    { name: "Hayaca + bebida", price: 24000 },
    { name: "Combo chocolate", price: 14800 },
    { name: "Combo aguapanela", price: 12500 },
    { name: "Croissant jamón y queso + capuchino", price: 17500 },
    { name: "Croissant arequipe + capuchino", price: 15000 },
  ]},
  { cat: "Café", items: [
    { name: "Espresso", price: 6300 },
    { name: "Espresso doble", price: 7700 },
    { name: "CapuChai", price: 12500 },
    { name: "Capuchino saborizado", price: 11700 },
    { name: "Mocaccino", price: 11800 },
    { name: "Capuchino Baileys", price: 16200 },
    { name: "Latte", price: 9700 },
    { name: "Café Irlandés", price: 19400 },
    { name: "Carajillo", price: 11400 },
  ]},
  { cat: "Bebidas calientes sin café", items: [
    { name: "Chocolate llanero", price: 11400 },
    { name: "Chúcula", price: 11400 },
    { name: "Infusiones en tisana", price: 6800 },
    { name: "Infusión de la casa", price: 9000 },
    { name: "Aguapanela", price: 7000 },
    { name: "Té carbón activado", price: 11400 },
    { name: "Té azul relajante", price: 11400 },
    { name: "Té matcha", price: 11400 },
    { name: "Té chai", price: 11400 },
    { name: "Té leche dorada", price: 11400 },
  ]},
  { cat: "Bebidas frías con café", items: [
    { name: "Café acacireño frío", price: 10000 },
    { name: "Vencejo llanero", price: 12500 },
    { name: "Latte frío", price: 11000 },
    { name: "Latte frío Baileys", price: 17800 },
    { name: "Affogato llanero", price: 16500 },
    { name: "Limonada de café", price: 12500 },
  ]},
  { cat: "Bebidas frías sin café", items: [
    { name: "Alborada llanera", price: 12500 },
    { name: "Vespertina llanera", price: 12500 },
    { name: "Puesta del sol", price: 13600 },
    { name: "Sol naciente", price: 14500 },
    { name: "Cuarzo", price: 12500 },
    { name: "Flor de jamaica", price: 9700 },
    { name: "Aguapanela fría", price: 7000 },
  ]},
  { cat: "Hojaldres", items: [
    { name: "Croissant de jamón y queso", price: 12500 },
    { name: "Croissant de arequipe", price: 9000 },
    { name: "Croissant de paté de pollo", price: 12500 },
  ]},
  { cat: "Vinos y cócteles", items: [
    { name: "Espresso Martini", price: 22000 },
    { name: "Campari Spritz", price: 24000 },
    { name: "Mexican Mule", price: 25000 },
    { name: "Vino de verano", price: 16000 },
    { name: "Copa de vino", price: 12500 },
  ]},
];

export const ALL_EXTRAS = CAFETERIA.flatMap((c) => c.items);
