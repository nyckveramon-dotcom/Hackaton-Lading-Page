//Datos generales//

const HORA_APERTURA = 9;
const HORA_CIERRE = 17;

const productos = [
  {
    id: 1,
    nombre: "Cupcake de vainilla",
    descripcion: "Bizcocho de vainilla con relleno de mora y crema chantilly.",
    precio: 5000,
    imagen: 'https://i.pinimg.com/1200x/59/13/2b/59132becf164a8d3cfcfc31b8c1e84d3.jpg'
  },
  {
    id: 2,
    nombre: "Cupcake de chocolate",
    descripcion: "Bizcocho de chocolate con relleno de arequipe y crema de chocolate.",
    precio: 6000,
    imagen:'https://i.pinimg.com/736x/9b/76/0f/9b760f7f7c59741a4d0f60e0077f6b7b.jpg'
  },
  {
    id: 3,
    nombre: "Cupcake de limón",
    descripcion: "Bizcocho de limón sin relleno, con crema chantilly.",
    precio: 4500,
    imagen: 'https://i.pinimg.com/736x/2d/68/31/2d6831563cb143df1ad554bbc061ead3.jpg'
  },
  {
    id: 4,
    nombre: "Cupcake de mocca",
    descripcion: "Bizcocho de moca con relleno de chocolate y crema de vainilla con chipas de chocolate.",
    precio: 6500,
    imagen: 'https://i.pinimg.com/1200x/19/80/92/198092435aa38a549a4f87a40d782099.jpg'
  },
  {
    id: 5,
    nombre: "Cupcake Red Velvet",
    descripcion: "Bizcocho Red Velvet con relleno de mora y cobertura de vainilla con frutas.",
    precio: 6500,
    imagen:'https://i.pinimg.com/736x/64/de/2d/64de2d8df3e4b4fd04f460708b92f777.jpg'
  }

];

const CLAVE_PEDIDO = "dulceCaprichoPedido";
let pedido = [];

//Manejo del DOOM 

const listaPedido = document.querySelector("#lista-pedido");
const contadorPedido = document.querySelector("#contador-pedido");
const totalPedido = document.querySelector("#total-pedido");

const botonConfirmar = document.querySelector("#confirmar");
const botonVaciar = document.querySelector("#vaciar");
const menu = document.querySelector("#menu");

function abierto(hora) {
    return hora >= HORA_APERTURA && hora < HORA_CIERRE;
}

function formatearPrecio(valor) {//El valor regresa como dato de hora
    return "$" + valor.toLocaleString("es-CO");
}

function buscarProducto(id) { //se realiza la búsqueda del producto con id
    return productos.find((producto) => producto.id === id);
}

function cargarPedido() {
    try {
        const pedidoGuardado = localStorage.getItem(CLAVE_PEDIDO);
        if (!pedidoGuardado) return [];

        const lineasGuardadas = JSON.parse(pedidoGuardado);
        if (!Array.isArray(lineasGuardadas)) {
            throw new TypeError("El pedido guardado no tiene un formato válido.");
        }

        return lineasGuardadas.flatMap((linea) => {
            const producto = buscarProducto(Number(linea.productoId));
            const cantidad = Number(linea.cantidad);

            if (!producto || !Number.isInteger(cantidad) || cantidad < 1) {
                return [];
            }

            return [{ producto, cantidad }];
        });
    } catch (error) {
        console.error("No se pudo cargar el pedido guardado.", error);
        return [];
    }
}

function guardarPedido() {
    try {
        const lineasGuardadas = pedido.map((linea) => ({
            productoId: linea.producto.id,
            cantidad: linea.cantidad
        }));
        localStorage.setItem(CLAVE_PEDIDO, JSON.stringify(lineasGuardadas));
    } catch (error) {
        console.error("No se pudo guardar el pedido.", error);
    }
}

pedido = cargarPedido();

function buscarLinea(id) {
    return pedido.find((linea) => linea.producto.id === id);
}

//se realiza funcionalidad de agregar al carrito añadiendo el producto a la lista de pedido
function agregarAlCarrito(id) {
    const linea = buscarLinea(id);

    if (linea) {
        linea.cantidad++;
    } else {
        pedido.push({
            producto: buscarProducto(id),
            cantidad: 1
        });
    }
}

function quitarDelCarrito(id) {
    pedido = pedido.filter((linea) => linea.producto.id !== id);
}

function restarDelCarrito(id) {//Se reutiliza la función de buscar linea y se realiza eliminación con --
    const linea = buscarLinea(id);
    if (!linea) return;

    linea.cantidad--;

    if (linea.cantidad === 0) {
        quitarDelCarrito(id);
    }
}

//Se genera contador teniendo en cuenta las lineas del pedido
function contarProductos() {
    let cantidad = 0;

    for (const linea of pedido) {
        cantidad += linea.cantidad;
    }

    return cantidad;
}


function calcularTotal() {
    let total = 0;

    for (const linea of pedido) {
        total += linea.producto.precio * linea.cantidad;
    }

    return total;
}


// ===== Pintar: del estado a la pantalla =====
function mostrarEstado() {
    const estado = document.querySelector("#estado");
    if (!estado) return;
    const horaActual = new Date().getHours();

    if (abierto(horaActual)) {
        estado.textContent = "Abierto ahora. Cerramos a las 5:00 p. m.";
        estado.classList.add("abierto");
    } else {
        estado.textContent = "Cerrado. Abrimos a las 9:00 a. m.";
        estado.classList.add("cerrado");
    }
}

function mostrarCarta() {//cambiar teniendo en cuenta la barra lateral
    if (!menu) return;
    let html = "";

    for (const producto of productos) {
        html += `
            <li class="col-md-4">
                <div class="producto card p-3 mb-3 h-100 shadow-sm border-0">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="card-img-top rounded mb-2" style="height: 160px; object-fit: cover;">
                    <h3 class="h5">${producto.nombre}</h3>
                    <p class="text-muted small">${producto.descripcion}</p>
                    <span class="precio fw-bold mb-2">${formatearPrecio(producto.precio)}</span>
                    <button
                        class="btn btn-dorado btn-sm mt-auto"
                        type="button"
                        data-accion="agregar"
                        data-id="${producto.id}"
                    >
                        Agregar
                    </button>
                </div>
            </li>`;
    }

    menu.innerHTML = html;
}

function mostrarPedido() {//cambiar teniendo en cuenta la barra lateral
    if (!listaPedido) return;
    guardarPedido();
    let html = "";

    for (const linea of pedido) {
        html += `
            <li class="linea d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                <span class="linea-nombre fw-semibold">${linea.producto.nombre}</span>

                <span class="linea-subtotal text-primary">
                    ${formatearPrecio(linea.producto.precio * linea.cantidad)}
                </span>

                <span class="cantidad d-flex align-items-center gap-2">
                    <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        data-accion="restar"
                        data-id="${linea.producto.id}"
                        aria-label="Quitar uno"
                    >−</button>

                    <span>${linea.cantidad}</span>

                    <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm"
                        data-accion="sumar"
                        data-id="${linea.producto.id}"
                        aria-label="Agregar uno"
                    >+</button>
                </span>

                <button
                    class="quitar btn btn-danger btn-sm"
                    type="button"
                    data-accion="quitar"
                    data-id="${linea.producto.id}"
                >
                    Quitar
                </button>
            </li>`;
    }

    if (pedido.length === 0) {
        html = `
            <li class="vacio text-muted text-center py-3">
                Tu pedido está vacío. Agrega algo de la carta.
            </li>`;
    } else {

        for (const linea of pedido) {
            html += `
            <li class="linea">
            <div class="linea-info">
            <span class="linea-nombre">${linea.producto.nombre}</span>
                        <span class="linea-subtotal">
                            ${formatearPrecio(linea.producto.precio * linea.cantidad)}
                        </span>
                    </div>

                    <div class="linea-controles">
                        <button type="button" data-accion="restar"
                            data-id="${linea.producto.id}" aria-label="Quitar uno">−</button>

                        <span>${linea.cantidad}</span>

                        <button type="button" data-accion="sumar"
                            data-id="${linea.producto.id}" aria-label="Agregar uno">+</button>

                        <button class="quitar" type="button" data-accion="quitar"
                            data-id="${linea.producto.id}">Quitar</button>
                    </div>
                </li>`;
        }

        html += `
            </ul>
            <div class="resumen-pedido">
                <span>Productos: ${contarProductos()}</span>
                <strong>Total: ${formatearPrecio(calcularTotal())}</strong>
            </div>
            </div>
            `;

    }

    listaPedido.innerHTML = html;
    if (contadorPedido) contadorPedido.textContent = contarProductos();
    if (totalPedido) totalPedido.textContent = formatearPrecio(calcularTotal());
}


// Se crea el evento de acuerdo a los botones requeridos (agregar, sumar y restar del pedido)
if (menu) {
    menu.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-accion]");

        if (!boton) {
            return;
        }

        const accion = boton.dataset.accion;
        const id = Number(boton.dataset.id);

        if (accion === "agregar") {
            agregarAlCarrito(id);

        } else if (accion === "sumar") {
            agregarAlCarrito(id);

        } else if (accion === "restar") {
            const linea = buscarLinea(id);

            if (linea) {
                linea.cantidad--;

                if (linea.cantidad === 0) {
                    pedido = pedido.filter(
                        (linea) => linea.producto.id !== id
                    );
                }
            }

        } else if (accion === "quitar") {
            pedido = pedido.filter(
                (linea) => linea.producto.id !== id
            );
        }

        mostrarPedido();
        console.log("Pedido:", pedido);
    });
}

//Se crea el evento a las acciones de agregar, restar y quitar del pedido
if (listaPedido) {
    listaPedido.addEventListener("click", function (evento) {
        const boton = evento.target.closest("button[data-accion]");
        if (!boton) return;

        const accion = boton.dataset.accion;
        const id = Number(boton.dataset.id);

        if (accion === "sumar") {
            agregarAlCarrito(id);
        }

        if (accion === "restar") {
            restarDelCarrito(id);
        }

        if (accion === "quitar") {
            quitarDelCarrito(id);
        }

        mostrarPedido();
    });
}

//Se crea el evento para vaciar el pedido
if (botonVaciar) {
    botonVaciar.addEventListener("click", function () {
        if (pedido.length === 0) {
            return;
        }

        const seguro = confirm("¿Seguro que quieres vaciar tu pedido?");

        if (seguro) {
            pedido = [];
            mostrarPedido();
        }
    });
}

//Se crea el evento para las alertas en el caso del carrito vacio y cuando se encuentre cerrado el sitio
if (botonConfirmar) {
    botonConfirmar.addEventListener("click", function () {
        if (pedido.length === 0) {
            alert("Tu pedido está vacío. Agrega algo de la carta.");
            return;
        }

        if (!abierto(new Date().getHours())) {
            alert("Ahora estamos cerrados. Recibimos pedidos de 9:00 a. m. a 5:00 p. m.");
            return;
        }

        const nombre = prompt("¿A nombre de quién va el pedido?");

        if (nombre === null) {
            return;
        }

        if (nombre.trim() === "") {
            alert("Con tu nombre podemos entregarte el pedido.");
            return;
        }

        alert(`¡Gracias, ${nombre}!\nProductos: ${contarProductos()}\nTotal: ${formatearPrecio(calcularTotal())}\nNos comunicaremos contigo cuando tus cupcakes esten listos.`);

        console.log("Pedido confirmado:", nombre, pedido);

        pedido = [];
        mostrarPedido();
    });
}


// ===== Arranque =====
mostrarEstado();
mostrarCarta();
mostrarPedido();