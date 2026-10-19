// Fuente única de verdad para productos y precios del menú (Orale Taquería, COP).
// Usado por menu.jsx (armar pedido), pago.jsx (total a cobrar) y admin.jsx (inventario).
// Debe reflejar exactamente lo que existe en la tabla `productos` (Backend/db/seed.sql,
// que se regenera con `node Backend/scripts/genSeed.mjs`).

export const DOM = 6000;

export const MENU = [
  { cat: "Entradas", items: [
    { name: "Nachada", price: 30000, desc: "¡Chulada! Nachos bien crujientes con puerco deshebrado, bañados en frijoles refritos y rematados con pico de gallo fresco, guacamole cremoso, piña dulce, queso rallado y nuestras salsas de la casa, pa' darle el sabor chingón." },
    { name: "Las Tostaditas", price: 18000, desc: "¡A huevo, qué crujiente! Cuatro tortillas de maíz doradas, cubiertas con frijol refrito, guacamole y pico de gallo fresco. Una entrada ligera y perfecta para abrir el apetito." },
    { name: "Totopos Chingones", price: 16000, desc: "¡Éntrale sin miedo! Totopos de maíz dorados y crujientes, acompañados de guacamole, pico de gallo y salsa de la casa. Una entrada para compartir al puro estilo Órale." },
  ]},
  { cat: "Tacos", items: [
    { name: "Tacos Carnitas", price: 24000, desc: "¡A huevo! Tacos de carnitas hechas con carne de cerdo cocida en su propia grasa y espolvoreada con totopos crujientes triturados, servidos en tortillas de maíz y acompañadas de nuestra salsa Veracruz, cebolla y cilantro. Un clásico mexicano." },
    { name: "Tacos de Birria", price: 26000, desc: "¡Órale! Tacos bien cargados de birria de res jugosa y sazonada, dorados con queso hasta quedar brutales. Van con cebolla, cilantro y su caldito aparte. Un taco que nunca falla." },
    { name: "Tacos Rancheros", price: 24000, desc: "¡Qué chido! Carne molida de res mezclada con chorizo criollo, cocinada con cebolla y especias al estilo tradicional. Servidos en tortillas suaves de maíz, con un sabor ranchero claro y sin rodeos." },
    { name: "Tacos al Pastor", price: 24000, desc: "¡De pelos! Jugoso puerco al pastor, bien marinado en especias, servido en tortillas de maíz con piña caramelizada, cebolla y cilantro. Un clásico taquero." },
    { name: "Tacos de Cochinita Pibil", price: 25000, desc: "¡Porky! Tacos de cochinita pibil, con carne de cerdo desmenuzada y marinada en achiote y jugo cítrico, servida con cebolla morada, lágrimas de limón y cilantro. Un sabor de Yucatán." },
    { name: "La Hijuebirria", price: 36000, desc: "¡No te hagas, traes hambre! Seis tacos de birria bien servidos, doraditos con queso, cebolla y cilantro, acompañados de su consomé. Una orden grande, jugosa y sin miedo pa' los que vienen a darle con todo." },
    { name: "Taquiza Órale", price: 35000, desc: "¿No sabes qué elegir? Llévate los tres: pastor, birria y carnitas. Seis taquitos bien servidos, llenos de sabor y tradición, ideales para compartir... o para no compartir." },
  ]},
  { cat: "Bebidas de la casa", items: [
    { name: "Flor de Jamaica", price: 7000 },
    { name: "Tamarindo", price: 7000 },
    { name: "Agua de Horchata", price: 8000 },
  ]},
  { cat: "Sodas artesanales", items: [
    { name: "Frutos Rojos", price: 16000 },
    { name: "Frutos Amarillos", price: 16000 },
    { name: "Sandía Limón", price: 16000 },
  ]},
  { cat: "Otras bebidas", items: [
    { name: "Gaseosa", price: 5000 },
    { name: "Cervezas", price: 5000 },
    { name: "Estella", price: 6000 },
    { name: "Botella de Tequila", price: 180000 },
  ]},
  { cat: "Cocteles", items: [
    { name: "Margarita", price: 22000, desc: "¡Arriba, abajo, al centro y pa' dentro! El clásico mexicano: tequila, triple sec y limón, servido bien frío con su característico borde de sal. Ácido, fresco y con el tequila como protagonista." },
    { name: "Paloma", price: 23000, desc: "¡Qué bonita la condenada! Tequila, toronja y limón en una combinación ligera, cítrica y refrescante, terminada con soda y servida bien fría. ¡México en cada trago!" },
    { name: "Cantarito", price: 25000, desc: "¡Échale tequila! Tequila acompañado de cítricos frescos y soda de toronja, servido al auténtico estilo mexicano. ¡Refrescante, cítrico y hecho para alargar la fiesta!" },
    { name: "Sunrise", price: 22000, desc: "¡Qué chulada! Un cóctel fresco, frutal y vibrante, con tequila, notas cítricas y ese degradado de colores que recuerda un amanecer. Dulce, refrescante y peligrosamente fácil de disfrutar." },
    { name: "El Caporal", price: 27000, desc: "¡Este sí trae espuelas! Tequila y flor de Jamaica se encuentran en un cóctel intenso y refrescante, con el equilibrio perfecto entre carácter y frescura. ¡México en el Llano, servido en un solo trago!" },
    { name: "Shot de Tequila", price: 15000 },
    { name: "Tinto Mexicano", price: 3000 },
  ]},
  { cat: "Quesadillas", items: [
    { name: "Quesadilla al Estilo Michoacán", price: 20000, desc: "¡Puro Michoacán! Auténtica quesadilla rellena de carnitas hechas con puerco cocido en su propia grasa, servida en tortilla de trigo con queso fundido, cebolla y cilantro, acompañada de sour cream para rematar el antojo." },
    { name: "Gringa al Pastor", price: 20000, desc: "¡Ándale! Puerco al pastor, bien marinado en especias, servido en tortilla de trigo con queso fundido, piña caramelizada, cebolla y cilantro fresco. Una gringa que reúne todo el sabor del pastor en una presentación más ligera." },
    { name: "Quesabirria Órale", price: 24000, desc: "¡Madre de quesabirria! Tortillas de trigo crujientes, rellenas de queso fundido y birria jugosa. Servidas con cebolla y cilantro, acompañadas de salsa chipotle y caldo de birria para disfrutar al estilo tradicional." },
  ]},
  { cat: "Pizzas", note: "Todas nuestras pizzas nacen de nuestra masa artesanal, preparada en casa.", items: [
    { name: "Pizzeta de Cochinita Pibil", price: 36000, desc: "Salsa mexicana, cochinita pibil jugosa y abundante queso fundido, terminada con cebolla morada y un toque fresco de cilantro. ¡Yucatán se vino de fiesta pa' Órale!" },
    { name: "Pizzeta de Carnitas", price: 36000, desc: "Salsa mexicana, carnitas de cerdo jugosas y un montón de queso fundido, rematada con cebolla y cilantro fresco. ¡Una marranada bien hecha y orgullosamente Órale!" },
    { name: "Pizzeta al Pastor", price: 36000, desc: "Salsa mexicana, puerco al pastor bien sazonado y abundante queso fundido, rematada con piña caramelizada, cebolla y cilantro. Todo el sabor del taco al pastor, ahora en pizza." },
    { name: "Pizzeta de Birria", price: 36000, desc: "Salsa mexicana, jugosa birria y abundante queso fundido, terminada con pico de gallo fresco. Una combinación bien mexicana y al puro estilo Órale." },
  ]},
  { cat: "Exclusivos del restaurante", items: [
    { name: "Ramen de Birria", price: 25000, desc: "¡Umm! El sabor intenso de nuestra birria en un delicioso caldo con fideos, queso, cebolla y cilantro. Acompañado de totopos crujientes. ¡La fusión que no sabías que necesitabas!" },
    { name: "Plátano Chingón", price: 24000, desc: "¡Puro pinche antojo! Plátano asado, cargado de nuestra jugosa birria, abundante queso, sour cream y salsa cheddar, terminado con pico de gallo fresco. ¡Dulce, salado y bien mexicano!" },
    { name: "La Mestiza", price: 32000, desc: "¡No mames, qué antojo! Papas a la francesa bien crujientes, cargadas de birria jugosa, chorizo, plátano maduro y mucho queso fundido, rematadas con pico de gallo fresco, guacamole y nuestras salsas de la casa. ¡Un desmadre de sabores al puro estilo Órale!" },
    { name: "La Mera Burger", price: 32000, desc: "¡No manches! Pan artesanal cargado de nuestra jugosa birria, abundante queso, vegetales frescos y el toque especial de nuestra salsa mexicana de la casa. Acompañada de totopos crujientes. ¡Está de poca madre!" },
    { name: "Burrito El Patrón", price: 29000, desc: "¡Esto es un desmadre! Tortilla de harina bien cargada de carne y chorizo criollo, frijol refrito, abundante queso, cebolla salteada, pico de gallo y guacamole. Acompañado de nuestra salsa chipotle. ¡Puro sabor mexicano en cada mordida!" },
    { name: "Burrito Ranchero", price: 29000 },
  ]},
];

export const ALL_EXTRAS = MENU.flatMap((c) => c.items);

// Agrupa { nombre: cantidad } por categoría del menú: [{ cat, items: [[nombre, cantidad]] }]
export const groupExtras = (extraItems = {}) =>
  MENU.map((c) => ({ cat: c.cat, items: c.items.filter((i) => extraItems[i.name] > 0).map((i) => [i.name, extraItems[i.name]]) }))
    .filter((g) => g.items.length);
