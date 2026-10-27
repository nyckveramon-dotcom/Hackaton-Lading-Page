//Datos generales//

const HORA_APERTURA = 9;
const HORA_CIERRE = 17;

const productos = [
    {
        id: 1,
        nombre: "Cupcake de vainilla",
        descripcion: "Bizcocho de vainilla con relleno de mora y crema chantilly.",
        precio: 5000
    },
    {
        id: 2,
        nombre: "Cupcake de chocolate",
        descripcion: "Bizcocho de chocolate con relleno de arequipe y cobertura de fondant.",
        precio: 6000
    },
    {
        id: 3,
        nombre: "Cupcake de limón",
        descripcion: "Bizcocho de limón sin relleno, con crema chantilly.",
        precio: 4500
    },
    {
        id: 4,
        nombre: "Cupcake de moca",
        descripcion: "Bizcocho de moca con relleno de chocolate y cobertura mixta.",
        precio: 6500
    },
    {
        id: 5,
        nombre: "Cupcake Red Velvet",
        descripcion: "Bizcocho Red Velvet con relleno de mora y cobertura de fondant.",
        precio: 6500
    }

];

let pedido = []; //lista donde se agrega o elimine el producto seleccionado

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
    let html = "";

    for (const producto of productos) {
        html += `
            <li class="producto">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <span class="precio">${formatearPrecio(producto.precio)}</span>
                <button
                    class="agregar"
                    type="button"
                    data-accion="agregar"
                    data-id="${producto.id}"
                >
                    Agregar
                </button>
            </li>`;
    }

    menu.innerHTML = html;
}

function mostrarPedido() {//cambiar teniendo en cuenta la barra lateral
    
    let html = "";

    if (pedido.length === 0) {
        html = `
            <li class="vacio">
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

}


// Se crea el evento de acuerdo a los botones requeridos (agregar, sumar y restar del pedido)
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

//Se crea el evento a las acciones de agregar, restar y quitar del pedido
listaPedido.addEventListener("click", function (evento) {
    const accion = evento.target.dataset.accion;
    const id = Number(evento.target.dataset.id);

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

//Se crea el evento para vaciar el pedido
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
//Al confirmar el pedido estando vacio se crea la alerta indicando que esta vacio el carrito
botonConfirmar.addEventListener("click", function () {
    console.log("Clic en Confirmar pedido");

    if (pedido.length === 0) {
        alert("Tu carrito está vacío. Agrega algo de la carta.");
        return;
    }

    alert("¡Recibimos tu pedido!");
});

//Se crea el evento para las alertas en el caso del carrito vacio y cuando se encuentre cerrado el sitio
botonConfirmar.addEventListener("click", function () {
    if (pedido.length === 0) {
        alert("Tu pedido está vacío. Agrega algo de la carta.");
        return;
    }

    if (!estaAbierto(new Date().getHours())) {
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


// ===== Arranque =====
mostrarEstado();
mostrarCarta();
mostrarPedido();

