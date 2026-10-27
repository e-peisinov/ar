/* Catálogo de la maqueta. Precios de ejemplo; las prendas salen de las fotos del local. */
window.AR_CATEGORIAS = [
  { id: 'remeras', nombre: 'Remeras' },
  { id: 'camisas', nombre: 'Camisas' },
  { id: 'musculosas', nombre: 'Musculosas' },
  { id: 'jeans', nombre: 'Jeans' }
];

window.AR_PRODUCTOS = [
  { id: 'drift-club', nombre: 'Remera Drift Club', cat: 'remeras', precio: 27900, fotos: ['f01'], colores: ['#1a1a1a'], etiqueta: 'Nuevo drop', nota: 'Oversize, estampa varsity al frente.' },
  { id: 'three-time', nombre: 'Remera Three-Time', cat: 'remeras', precio: 28900, fotos: ['f05', 'f10'], colores: ['#14161c'], etiqueta: 'Más pedida', nota: 'Algodón peinado, estampa en la espalda.' },
  { id: 'concept-celeste', nombre: 'Remera Concept', cat: 'remeras', precio: 27900, fotos: ['f15', 'f12', 'f19'], colores: ['#9fc3e6'], etiqueta: '', nota: 'Celeste lavado, logo circular adelante y atrás.' },
  { id: 'leon', nombre: 'Remera León', cat: 'remeras', precio: 28900, fotos: ['f09'], colores: ['#f3f1ea'], etiqueta: 'Nuevo drop', nota: 'Boxy fit con gráfica grande en la espalda.' },
  { id: 'indigo', nombre: 'Remera Lavada Índigo', cat: 'remeras', precio: 26900, fotos: ['f03'], colores: ['#3d5f9e', '#8e959a'], etiqueta: '', nota: 'Lavado a la piedra; cada una sale distinta.' },
  { id: 'emblema', nombre: 'Remera Emblema', cat: 'remeras', precio: 26900, fotos: ['f20'], colores: ['#f4f2ec'], etiqueta: '', nota: 'Blanca, emblema chico al pecho.' },
  { id: 'morley-arena', nombre: 'Remera Morley Arena', cat: 'remeras', precio: 24900, fotos: ['f14'], colores: ['#ddd6c6'], etiqueta: 'Básico', nota: 'Tejido acanalado, cae liviana.' },
  { id: 'calada-oliva', nombre: 'Camisa Calada Oliva', cat: 'camisas', precio: 46900, fotos: ['f08', 'f17', 'f06'], colores: ['#6b7160'], etiqueta: 'Más pedida', nota: 'Tejido de punto calado, cuello abierto.' },
  { id: 'crepe-cruda', nombre: 'Camisa Crepé Cruda', cat: 'camisas', precio: 42900, fotos: ['f04'], colores: ['#ece6d8'], etiqueta: 'Nuevo drop', nota: 'Cuello resort, textura a rayas en relieve.' },
  { id: 'costura', nombre: 'Musculosa Costura', cat: 'musculosas', precio: 19900, fotos: ['f02', 'f16'], colores: ['#f4f2ec', '#151515'], etiqueta: '', nota: 'Sisa amplia y costura vista en contraste.' },
  { id: 'rib', nombre: 'Musculosa Rib', cat: 'musculosas', precio: 17900, fotos: ['f07'], colores: ['#9aa0a6', '#f4f2ec'], etiqueta: 'Básico', nota: 'Acanalada, al cuerpo.' },
  { id: 'basica-blanca', nombre: 'Musculosa Básica', cat: 'musculosas', precio: 16900, fotos: ['f18'], colores: ['#f4f2ec'], etiqueta: 'Básico', nota: 'La que va debajo de todo.' },
  { id: 'baggy-carbon', nombre: 'Jean Baggy Carbón', cat: 'jeans', precio: 54900, fotos: ['f11'], colores: ['#3a3a3a'], etiqueta: '', nota: 'Tiro medio, pierna ancha, lavado gastado.' },
  { id: 'baggy-celeste', nombre: 'Jean Baggy Celeste', cat: 'jeans', precio: 54900, fotos: ['f13'], colores: ['#7d97b5'], etiqueta: 'Nuevo drop', nota: 'Pierna recta y amplia, celeste clásico.' }
];

window.AR_TALLES = ['S', 'M', 'L', 'XL', 'XXL'];

window.AR_precio = function (n) {
  return '$' + n.toLocaleString('es-AR');
};
