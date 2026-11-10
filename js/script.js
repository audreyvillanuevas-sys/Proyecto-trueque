
/* =====================================================
   TRUEQUE
   Sistema de publicaciones, usuarios y solicitudes
   Versión de práctica con localStorage
===================================================== */


/* =====================================================
   1. ELEMENTOS DEL HTML
===================================================== */

// Formulario de publicaciones
const formularioPublicacion = document.querySelector("#formulario-publicacion");

const campoNombre = document.querySelector("#nombre");
const campoCategoria = document.querySelector("#categoria");
const campoTipo = document.querySelector("#tipo");
const campoDescripcion = document.querySelector("#descripcion");
const campoImagen = document.querySelector("#imagen-producto");
const campoEstado = document.querySelector("#estado-producto");

const botonPublicar = document.querySelector("#boton-publicar");
const botonCancelarEdicion = document.querySelector("#cancelar-edicion");

const tituloFormulario = document.querySelector("#titulo-formulario-publicacion");
const mensajePublicacion = document.querySelector("#mensaje-publicacion");

const vistaPrevia = document.querySelector("#vista-previa-imagen");
const imagenSeleccionada = document.querySelector("#imagen-seleccionada");

// Productos
const contenedorProductos = document.querySelector("#contenedor-productos");
const mensajeProductos = document.querySelector("#mensaje-productos");

// Filtros
const buscarProducto = document.querySelector("#buscar-producto");
const filtroCategoria = document.querySelector("#filtro-categoria");
const filtroTipo = document.querySelector("#filtro-tipo");
const filtroEstado = document.querySelector("#filtro-estado");

// Registro e inicio de sesión
const formularioRegistro = document.querySelector("#formulario-registro");
const formularioLogin = document.querySelector("#formulario-login");

const mensajeRegistro = document.querySelector("#mensaje-registro");
const mensajeLogin = document.querySelector("#mensaje-login");

// Perfil
const panelAcceso = document.querySelector("#panel-acceso");
const panelPerfil = document.querySelector("#panel-perfil");

const perfilNombre = document.querySelector("#perfil-nombre");
const perfilEmail = document.querySelector("#perfil-email");

const botonCerrarSesion = document.querySelector("#cerrar-sesion");
const misProductos = document.querySelector("#mis-productos");

// Solicitudes
const contenedorSolicitudes = document.querySelector("#contenedor-solicitudes");


/* =====================================================
   2. CLAVES DE ALMACENAMIENTO
===================================================== */

// Son los nombres con los que guardaremos los datos
// en el navegador.

const CLAVE_PRODUCTOS = "productosTRUEQUE";
const CLAVE_USUARIOS = "usuariosTRUEQUE";
const CLAVE_SESION = "sesionTRUEQUE";
const CLAVE_SOLICITUDES = "solicitudesTRUEQUE";


/* =====================================================
   3. FUNCIONES PARA GUARDAR Y LEER DATOS
===================================================== */

function leerDatos(clave) {

    try {

        const datos = localStorage.getItem(clave);

        if (!datos) {
            return [];
        }

        const resultado = JSON.parse(datos);

        return Array.isArray(resultado) ? resultado : [];

    } catch (error) {

        console.error("No se pudieron leer los datos:", error);

        return [];

    }

}


function guardarDatos(clave, datos) {

    try {

        localStorage.setItem(clave, JSON.stringify(datos));

        return true;

    } catch (error) {

        console.error("Error al guardar los datos:", error);

        return false;

    }

}


/* =====================================================
   4. VARIABLES PRINCIPALES
===================================================== */

// Cargamos los datos guardados anteriormente.

let productos = leerDatos(CLAVE_PRODUCTOS);
let usuarios = leerDatos(CLAVE_USUARIOS);
let solicitudes = leerDatos(CLAVE_SOLICITUDES);

let sesionActual = null;
let productoEnEdicion = null;
let imagenTemporal = null;


// Recuperamos la sesión anterior.

try {

    const sesionGuardada = localStorage.getItem(CLAVE_SESION);

    if (sesionGuardada) {

        sesionActual = JSON.parse(sesionGuardada);

        const usuarioExiste = usuarios.some(
            usuario => usuario.id === sesionActual.id
        );

        if (!usuarioExiste) {
            sesionActual = null;
        }

    }

} catch (error) {

    sesionActual = null;

}


/* =====================================================
   5. IMÁGENES DE RESPALDO POR CATEGORÍA
===================================================== */

// Se utilizarán cuando una publicación antigua
// no tenga una fotografía propia.

const imagenesCategorias = {

    ropa: "img/ropa.jpg",

    libros: "img/libros.jpg",

    alimentos: "img/alimentos.jpg"

};


function obtenerImagen(producto) {

    return producto.imagen ||
        imagenesCategorias[producto.categoria] ||
        "img/portada.jpg";

}


/* =====================================================
   6. FUNCIONES AUXILIARES
===================================================== */

function crearId() {

    return Date.now().toString() +
        Math.random().toString(36).substring(2, 9);

}


function obtenerTextoCategoria(categoria) {

    const categorias = {

        ropa: "Ropa",
        libros: "Libros",
        alimentos: "Alimentos"

    };

    return categorias[categoria] || "Sin categoría";

}


function obtenerTextoTipo(tipo) {

    const tipos = {

        donacion: "Donación",
        intercambio: "Intercambio"

    };

    return tipos[tipo] || "Sin especificar";

}


function obtenerTextoEstado(estado) {

    const estados = {

        disponible: "Disponible",
        reservado: "Reservado",
        entregado: "Entregado"

    };

    return estados[estado] || "Disponible";

}


function crearElemento(etiqueta, clase, texto) {

    const elemento = document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;

}


function obtenerFecha(fecha) {

    if (!fecha) {
        return "Fecha no disponible";
    }

    return new Date(fecha).toLocaleDateString("es-PE");

}


/* =====================================================
   7. MOSTRAR MENSAJES
===================================================== */

function mostrarMensaje(elemento, texto, tipo = "correcto") {

    if (!elemento) {
        return;
    }

    elemento.textContent = texto;

    elemento.style.color =
        tipo === "error" ? "#c65d49" : "#159b83";

}


/* =====================================================
   8. VISTA PREVIA DE LA FOTOGRAFÍA
===================================================== */

campoImagen.addEventListener("change", function () {

    const archivo = campoImagen.files[0];

    imagenTemporal = null;

    if (!archivo) {

        vistaPrevia.hidden = true;
        imagenSeleccionada.src = "";

        return;

    }

    const formatosPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!formatosPermitidos.includes(archivo.type)) {

        mostrarMensaje(
            mensajePublicacion,
            "Selecciona una imagen JPG, PNG o WEBP.",
            "error"
        );

        campoImagen.value = "";
        vistaPrevia.hidden = true;

        return;

    }

    if (archivo.size > 700 * 1024) {

        mostrarMensaje(
            mensajePublicacion,
            "La imagen supera el tamaño máximo de 700 KB.",
            "error"
        );

        campoImagen.value = "";
        vistaPrevia.hidden = true;

        return;

    }

    const lector = new FileReader();

    lector.onload = function (evento) {

        imagenTemporal = evento.target.result;

        imagenSeleccionada.src = imagenTemporal;

        vistaPrevia.hidden = false;

    };

    lector.onerror = function () {

        mostrarMensaje(
            mensajePublicacion,
            "No se pudo leer la fotografía.",
            "error"
        );

    };

    lector.readAsDataURL(archivo);

});


/* =====================================================
   9. CREAR TARJETA DE PRODUCTO
===================================================== */

function crearTarjeta(producto, mostrarAccionesPropietario = true) {

    const tarjeta = crearElemento("article", "tarjeta-producto");

    // Fotografía

    const contenedorImagen = crearElemento("div", "imagen-producto");

    const imagen = crearElemento("img");

    imagen.src = obtenerImagen(producto);
    imagen.alt = producto.nombre || "Producto publicado";
    imagen.loading = "lazy";

    imagen.onerror = function () {

        imagen.src = imagenesCategorias[producto.categoria] ||
            "img/portada.jpg";

    };

    contenedorImagen.appendChild(imagen);

    // Información

    const informacion = crearElemento("div", "informacion-producto");

    const categoria = crearElemento(
        "span",
        "categoria-producto",
        obtenerTextoCategoria(producto.categoria)
    );

    const titulo = crearElemento(
        "h3",
        "",
        producto.nombre || "Producto sin nombre"
    );

    const descripcion = crearElemento(
        "p",
        "",
        producto.descripcion || "Sin descripción."
    );

    const tipo = crearElemento(
        "span",
        "tipo-publicacion",
        obtenerTextoTipo(producto.tipo)
    );

    if (producto.tipo === "intercambio") {
        tipo.classList.add("intercambio");
    }

    const estado = crearElemento(
        "span",
        "estado-producto " + (producto.estado || "disponible"),
        obtenerTextoEstado(producto.estado)
    );

    const propietario = crearElemento(
        "p",
        "",
        "Publicado por: " + (producto.usuarioNombre || "Usuario anterior")
    );

    const fecha = crearElemento(
        "small",
        "",
        "Fecha: " + obtenerFecha(producto.fecha)
    );

    informacion.append(
        categoria,
        titulo,
        descripcion,
        tipo,
        estado,
        propietario,
        fecha
    );

    // Botones de acciones

    const acciones = crearElemento("div", "acciones-producto");

    const esPropietario =
        sesionActual && producto.usuarioId === sesionActual.id;

    if (
        esPropietario &&
        mostrarAccionesPropietario
    ) {

        // Editar

        const botonEditar = crearElemento(
            "button",
            "boton-editar",
            "Editar"
        );

        botonEditar.type = "button";

        botonEditar.addEventListener("click", function () {

            editarProducto(producto.id);

        });

        // Eliminar

        const botonEliminar = crearElemento(
            "button",
            "boton-eliminar",
            "Eliminar"
        );

        botonEliminar.type = "button";

        botonEliminar.addEventListener("click", function () {

            eliminarProducto(producto.id);

        });

        // Cambiar estado

        const botonEstado = crearElemento(
            "button",
            "boton-estado",
            "Cambiar estado"
        );

        botonEstado.type = "button";

        botonEstado.addEventListener("click", function () {

            cambiarEstadoProducto(producto.id);

        });

        acciones.append(
            botonEditar,
            botonEliminar,
            botonEstado
        );

    } else if (
        sesionActual &&
        producto.usuarioId !== sesionActual.id &&
        producto.estado === "disponible" &&
        producto.usuarioId
    ) {

        const botonInteres = crearElemento(
            "button",
            "boton-secundario",
            "Me interesa"
        );

        botonInteres.type = "button";

        botonInteres.addEventListener("click", function () {

            enviarSolicitud(producto);

        });

        acciones.appendChild(botonInteres);

    } else if (!sesionActual && producto.usuarioId) {

        const botonAcceder = crearElemento(
            "a",
            "boton-secundario",
            "Inicia sesión para contactar"
        );

        botonAcceder.href = "#cuenta";

        acciones.appendChild(botonAcceder);

    }

    informacion.appendChild(acciones);

    tarjeta.append(
        contenedorImagen,
        informacion
    );

    return tarjeta;

}


/* =====================================================
   10. MOSTRAR PRODUCTOS Y APLICAR FILTROS
===================================================== */

function mostrarProductos() {

    contenedorProductos.innerHTML = "";

    const textoBusqueda = buscarProducto.value
        .trim()
        .toLowerCase();

    const categoriaSeleccionada = filtroCategoria.value;

    const tipoSeleccionado = filtroTipo.value;

    const estadoSeleccionado = filtroEstado.value;

    const productosFiltrados = productos.filter(function (producto) {

        const coincideNombre = (producto.nombre || "")
            .toLowerCase()
            .includes(textoBusqueda);

        const coincideCategoria =
            !categoriaSeleccionada ||
            producto.categoria === categoriaSeleccionada;

        const coincideTipo =
            !tipoSeleccionado ||
            producto.tipo === tipoSeleccionado;

        const estadoProducto = producto.estado || "disponible";

        const coincideEstado =
            !estadoSeleccionado ||
            estadoProducto === estadoSeleccionado;

        return (
            coincideNombre &&
            coincideCategoria &&
            coincideTipo &&
            coincideEstado
        );

    });

    if (productosFiltrados.length === 0) {

        mensajeProductos.textContent =
            "No se encontraron productos con esos criterios.";

        return;

    }

    mensajeProductos.textContent =
        "Se encontraron " +
        productosFiltrados.length +
        " producto(s).";

    productosFiltrados.forEach(function (producto) {

        const tarjeta = crearTarjeta(producto);

        contenedorProductos.appendChild(tarjeta);

    });

}


// Escuchamos los cambios en los filtros.

buscarProducto.addEventListener("input", mostrarProductos);

filtroCategoria.addEventListener("change", mostrarProductos);

filtroTipo.addEventListener("change", mostrarProductos);

filtroEstado.addEventListener("change", mostrarProductos);


/* =====================================================
   11. PUBLICAR UN PRODUCTO
===================================================== */

formularioPublicacion.addEventListener("submit", function (evento) {

    evento.preventDefault();

    // Es necesario iniciar sesión para publicar.

    if (!sesionActual) {

        mostrarMensaje(
            mensajePublicacion,
            "Primero debes iniciar sesión para publicar.",
            "error"
        );

        document.querySelector("#cuenta").scrollIntoView({
            behavior: "smooth"
        });

        return;

    }

    const nombre = campoNombre.value.trim();

    const categoria = campoCategoria.value;

    const tipo = campoTipo.value;

    const descripcion = campoDescripcion.value.trim();

    const estado = campoEstado.value;

    // Validaciones básicas.

    if (
        nombre.length < 3 ||
        nombre.length > 70
    ) {

        mostrarMensaje(
            mensajePublicacion,
            "El nombre debe tener entre 3 y 70 caracteres.",
            "error"
        );

        return;

    }

    if (!categoria || !tipo) {

        mostrarMensaje(
            mensajePublicacion,
            "Selecciona una categoría y un tipo de publicación.",
            "error"
        );

        return;

    }

    if (
        descripcion.length < 10 ||
        descripcion.length > 400
    ) {

        mostrarMensaje(
            mensajePublicacion,
            "La descripción debe tener entre 10 y 400 caracteres.",
            "error"
        );

        return;

    }

    if (categoria === "alimentos") {

        const confirmarAlimentos = confirm(
            "Confirma que el alimento está cerrado, no es perecible " +
            "y se encuentra dentro de su fecha de vencimiento."
        );

        if (!confirmarAlimentos) {
            return;
        }

    }

    // Si estamos editando una publicación.

    if (productoEnEdicion) {

        const indice = productos.findIndex(
            producto => producto.id === productoEnEdicion
        );

        if (indice === -1) {

            mostrarMensaje(
                mensajePublicacion,
                "No se encontró la publicación que deseas editar.",
                "error"
            );

            return;

        }

        const productoAnterior = productos[indice];

        if (productoAnterior.usuarioId !== sesionActual.id) {

            mostrarMensaje(
                mensajePublicacion,
                "No puedes editar una publicación de otro usuario.",
                "error"
            );

            return;

        }

        const productoActualizado = {

            ...productoAnterior,

            nombre: nombre,
            categoria: categoria,
            tipo: tipo,
            descripcion: descripcion,
            estado: productoAnterior.estado || estado,
            imagen: imagenTemporal || productoAnterior.imagen ||
                imagenesCategorias[productoAnterior.categoria]

        };

        const copiaAnterior = productos[indice];

        productos[indice] = productoActualizado;

        if (!guardarDatos(CLAVE_PRODUCTOS, productos)) {

            productos[indice] = copiaAnterior;

            mostrarMensaje(
                mensajePublicacion,
                "No se pudo guardar la modificación. Revisa el almacenamiento.",
                "error"
            );

            return;

        }

        mostrarMensaje(
            mensajePublicacion,
            "¡Tu publicación se actualizó correctamente!"
        );

    } else {

        // Una publicación nueva necesita una fotografía propia.

        if (!imagenTemporal) {

            mostrarMensaje(
                mensajePublicacion,
                "Selecciona una fotografía de tu producto antes de publicar.",
                "error"
            );

            return;

        }

        const nuevoProducto = {

            id: crearId(),

            usuarioId: sesionActual.id,

            usuarioNombre: sesionActual.nombre,

            nombre: nombre,

            categoria: categoria,

            tipo: tipo,

            descripcion: descripcion,

            estado: estado,

            imagen: imagenTemporal,

            fecha: new Date().toISOString()

        };

        productos.push(nuevoProducto);

        if (!guardarDatos(CLAVE_PRODUCTOS, productos)) {

            productos.pop();

            mostrarMensaje(
                mensajePublicacion,
                "No se pudo guardar el producto. El almacenamiento puede estar lleno.",
                "error"
            );

            return;

        }

        mostrarMensaje(
            mensajePublicacion,
            "¡Tu producto se publicó correctamente!"
        );

    }

    // Limpiamos el formulario.

    limpiarFormularioPublicacion();

    mostrarProductos();

    mostrarMisProductos();

    document.querySelector("#productos").scrollIntoView({
        behavior: "smooth"
    });

});


/* =====================================================
   12. LIMPIAR FORMULARIO
===================================================== */

function limpiarFormularioPublicacion() {

    formularioPublicacion.reset();

    productoEnEdicion = null;

    imagenTemporal = null;

    vistaPrevia.hidden = true;

    imagenSeleccionada.src = "";

    botonPublicar.textContent = "Publicar producto →";

    tituloFormulario.textContent = "Publica tu producto";

    botonCancelarEdicion.hidden = true;

}


/* =====================================================
   13. EDITAR PRODUCTO
===================================================== */

function editarProducto(id) {

    if (!sesionActual) {
        return;
    }

    const producto = productos.find(
        elemento => elemento.id === id
    );

    if (!producto) {
        return;
    }

    if (producto.usuarioId !== sesionActual.id) {

        alert("No puedes editar una publicación de otro usuario.");

        return;

    }

    productoEnEdicion = id;

    campoNombre.value = producto.nombre;

    campoCategoria.value = producto.categoria;

    campoTipo.value = producto.tipo;

    campoDescripcion.value = producto.descripcion;

    campoEstado.value = "disponible";

    imagenTemporal = null;

    // Mostramos la fotografía actual.

    if (producto.imagen) {

        imagenSeleccionada.src = producto.imagen;

        vistaPrevia.hidden = false;

    } else {

        vistaPrevia.hidden = true;

    }

    tituloFormulario.textContent = "Editar publicación";

    botonPublicar.textContent = "Guardar cambios →";

    botonCancelarEdicion.hidden = false;

    mostrarMensaje(
        mensajePublicacion,
        "Estás editando tu publicación. Si deseas cambiar la fotografía, selecciona otra."
    );

    document.querySelector("#publicar").scrollIntoView({
        behavior: "smooth"
    });

}


// Cancelar edición.

botonCancelarEdicion.addEventListener("click", function () {

    limpiarFormularioPublicacion();

    mostrarMensaje(
        mensajePublicacion,
        "Edición cancelada."
    );

});


/* =====================================================
   14. ELIMINAR PRODUCTO
===================================================== */

function eliminarProducto(id) {

    if (!sesionActual) {
        return;
    }

    const producto = productos.find(
        elemento => elemento.id === id
    );

    if (!producto || producto.usuarioId !== sesionActual.id) {

        alert("No tienes permiso para eliminar esta publicación.");

        return;

    }

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este producto?"
    );

    if (!confirmar) {
        return;
    }

    const productosAnteriores = [...productos];

    const solicitudesAnteriores = [...solicitudes];

    productos = productos.filter(
        elemento => elemento.id !== id
    );

    // También eliminamos las solicitudes relacionadas
    // con el producto eliminado.

    solicitudes = solicitudes.filter(
        solicitud => solicitud.productoId !== id
    );

    const productosGuardados = guardarDatos(
        CLAVE_PRODUCTOS,
        productos
    );

    const solicitudesGuardadas = guardarDatos(
        CLAVE_SOLICITUDES,
        solicitudes
    );

    if (!productosGuardados || !solicitudesGuardadas) {

        productos = productosAnteriores;

        solicitudes = solicitudesAnteriores;

        guardarDatos(CLAVE_PRODUCTOS, productos);

        guardarDatos(CLAVE_SOLICITUDES, solicitudes);

        alert("No se pudo completar la eliminación.");

        return;

    }

    mostrarProductos();

    mostrarMisProductos();

    mostrarSolicitudes();

    alert("La publicación fue eliminada.");

}


/* =====================================================
   15. CAMBIAR ESTADO DEL PRODUCTO
===================================================== */

function cambiarEstadoProducto(id) {

    if (!sesionActual) {
        return;
    }

    const producto = productos.find(
        elemento => elemento.id === id
    );

    if (!producto || producto.usuarioId !== sesionActual.id) {

        alert("No puedes cambiar el estado de este producto.");

        return;

    }

    const estados = [
        "disponible",
        "reservado",
        "entregado"
    ];

    const estadoActual = producto.estado || "disponible";

    const indiceActual = estados.indexOf(estadoActual);

    const siguienteIndice = (indiceActual + 1) % estados.length;

    const estadoNuevo = estados[siguienteIndice];

    const confirmar = confirm(
        "¿Deseas cambiar el estado a: " +
        obtenerTextoEstado(estadoNuevo) +
        "?"
    );

    if (!confirmar) {
        return;
    }

    const estadoAnterior = producto.estado;

    producto.estado = estadoNuevo;

    if (!guardarDatos(CLAVE_PRODUCTOS, productos)) {

        producto.estado = estadoAnterior;

        alert("No se pudo guardar el nuevo estado.");

        return;

    }

    mostrarProductos();

    mostrarMisProductos();

}


/* =====================================================
   16. REGISTRAR UN USUARIO
===================================================== */

formularioRegistro.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const nombre = document.querySelector("#registro-nombre")
        .value.trim();

    const email = document.querySelector("#registro-email")
        .value.trim()
        .toLowerCase();

    const password = document.querySelector("#registro-password")
        .value;

    if (nombre.length < 3) {

        mostrarMensaje(
            mensajeRegistro,
            "Escribe un nombre de al menos 3 caracteres.",
            "error"
        );

        return;

    }

    if (password.length < 6) {

        mostrarMensaje(
            mensajeRegistro,
            "La contraseña debe tener al menos 6 caracteres.",
            "error"
        );

        return;

    }

    const usuarioExiste = usuarios.some(
        usuario => usuario.email === email
    );

    if (usuarioExiste) {

        mostrarMensaje(
            mensajeRegistro,
            "Este correo ya está registrado.",
            "error"
        );

        return;

    }

    const nuevoUsuario = {

        id: crearId(),

        nombre: nombre,

        email: email,

        // Solo para esta demostración local.
        // No es almacenamiento seguro de contraseñas.
        password: password

    };

    usuarios.push(nuevoUsuario);

    if (!guardarDatos(CLAVE_USUARIOS, usuarios)) {

        usuarios.pop();

        mostrarMensaje(
            mensajeRegistro,
            "No se pudo registrar el usuario.",
            "error"
        );

        return;

    }

    formularioRegistro.reset();

    mostrarMensaje(
        mensajeRegistro,
        "¡Cuenta creada! Ahora puedes iniciar sesión."
    );

});


/* =====================================================
   17. INICIAR SESIÓN
===================================================== */

formularioLogin.addEventListener("submit", function (evento) {

    evento.preventDefault();

    const email = document.querySelector("#login-email")
        .value.trim()
        .toLowerCase();

    const password = document.querySelector("#login-password")
        .value;

    const usuario = usuarios.find(function (elemento) {

        return (
            elemento.email === email &&
            elemento.password === password
        );

    });

    if (!usuario) {

        mostrarMensaje(
            mensajeLogin,
            "Correo o contraseña incorrectos.",
            "error"
        );

        return;

    }

    sesionActual = {

        id: usuario.id,

        nombre: usuario.nombre,

        email: usuario.email

    };

    try {

        localStorage.setItem(
            CLAVE_SESION,
            JSON.stringify(sesionActual)
        );

    } catch (error) {

        sesionActual = null;

        mostrarMensaje(
            mensajeLogin,
            "No se pudo iniciar la sesión en este navegador.",
            "error"
        );

        return;

    }

    formularioLogin.reset();

    mostrarMensaje(
        mensajeLogin,
        "¡Bienvenido/a a TRUEQUE!"
    );

    actualizarInterfazUsuario();

});


/* =====================================================
   18. CERRAR SESIÓN
===================================================== */

botonCerrarSesion.addEventListener("click", function () {

    const confirmar = confirm(
        "¿Deseas cerrar tu sesión?"
    );

    if (!confirmar) {
        return;
    }

    sesionActual = null;

    localStorage.removeItem(CLAVE_SESION);

    productoEnEdicion = null;

    limpiarFormularioPublicacion();

    actualizarInterfazUsuario();

});


/* =====================================================
   19. ACTUALIZAR INTERFAZ DEL USUARIO
===================================================== */

function actualizarInterfazUsuario() {

    if (sesionActual) {

        panelAcceso.hidden = true;

        panelPerfil.hidden = false;

        perfilNombre.textContent =
            "Nombre: " + sesionActual.nombre;

        perfilEmail.textContent =
            "Correo: " + sesionActual.email;

    } else {

        panelAcceso.hidden = false;

        panelPerfil.hidden = true;

        perfilNombre.textContent = "";

        perfilEmail.textContent = "";

    }

    mostrarProductos();

    mostrarMisProductos();

    mostrarSolicitudes();

}


/* =====================================================
   20. MOSTRAR MIS PUBLICACIONES
===================================================== */

function mostrarMisProductos() {

    misProductos.innerHTML = "";

    if (!sesionActual) {
        return;
    }

    const misPublicaciones = productos.filter(
        producto => producto.usuarioId === sesionActual.id
    );

    if (misPublicaciones.length === 0) {

        const mensaje = crearElemento(
            "p",
            "mensaje-vacio",
            "Todavía no tienes publicaciones."
        );

        misProductos.appendChild(mensaje);

        return;

    }

    misPublicaciones.forEach(function (producto) {

        const tarjeta = crearTarjeta(producto);

        misProductos.appendChild(tarjeta);

    });

}


/* =====================================================
   21. ENVIAR SOLICITUD POR UN PRODUCTO
===================================================== */

function enviarSolicitud(producto) {

    if (!sesionActual) {

        alert("Debes iniciar sesión para enviar una solicitud.");

        return;

    }

    if (producto.usuarioId === sesionActual.id) {

        alert("No puedes solicitar tu propio producto.");

        return;

    }

    if (producto.estado !== "disponible") {

        alert("Este producto ya no está disponible.");

        return;

    }

    const solicitudPendiente = solicitudes.some(function (solicitud) {

        return (
            solicitud.productoId === producto.id &&
            solicitud.solicitanteId === sesionActual.id &&
            solicitud.estado === "pendiente"
        );

    });

    if (solicitudPendiente) {

        alert("Ya tienes una solicitud pendiente para este producto.");

        return;

    }

    const mensaje = prompt(
        "Escribe un mensaje para el propietario de este producto:"
    );

    if (mensaje === null) {
        return;
    }

    if (mensaje.trim().length < 5) {

        alert("Escribe un mensaje de al menos 5 caracteres.");

        return;

    }

    const nuevaSolicitud = {

        id: crearId(),

        productoId: producto.id,

        productoNombre: producto.nombre,

        propietarioId: producto.usuarioId,

        solicitanteId: sesionActual.id,

        solicitanteNombre: sesionActual.nombre,

        mensaje: mensaje.trim(),

        estado: "pendiente",

        fecha: new Date().toISOString()

    };

    solicitudes.push(nuevaSolicitud);

    if (!guardarDatos(CLAVE_SOLICITUDES, solicitudes)) {

        solicitudes.pop();

        alert("No se pudo enviar la solicitud.");

        return;

    }

    mostrarSolicitudes();

    alert("¡Tu solicitud fue enviada correctamente!");

}


/* =====================================================
   22. MOSTRAR SOLICITUDES
===================================================== */

function mostrarSolicitudes() {

    contenedorSolicitudes.innerHTML = "";

    if (!sesionActual) {

        const mensaje = crearElemento(
            "p",
            "mensaje-vacio",
            "Inicia sesión para consultar tus solicitudes."
        );

        contenedorSolicitudes.appendChild(mensaje);

        return;

    }

    const misSolicitudes = solicitudes.filter(function (solicitud) {

        return (
            solicitud.propietarioId === sesionActual.id ||
            solicitud.solicitanteId === sesionActual.id
        );

    });

    if (misSolicitudes.length === 0) {

        const mensaje = crearElemento(
            "p",
            "mensaje-vacio",
            "Todavía no tienes solicitudes."
        );

        contenedorSolicitudes.appendChild(mensaje);

        return;

    }

    misSolicitudes.forEach(function (solicitud) {

        const tarjeta = crearElemento(
            "article",
            "tarjeta-solicitud"
        );

        const titulo = crearElemento(
            "h3",
            "",
            solicitud.productoNombre
        );

        const solicitante = crearElemento(
            "p",
            "",
            "Solicitante: " + solicitud.solicitanteNombre
        );

        const mensaje = crearElemento(
            "p",
            "",
            "Mensaje: " + solicitud.mensaje
        );

        const fecha = crearElemento(
            "small",
            "",
            "Fecha: " + obtenerFecha(solicitud.fecha)
        );

        const esPropietario =
            solicitud.propietarioId === sesionActual.id;

        const textoRol = crearElemento(
            "p",
            "",
            esPropietario
                ? "Solicitud recibida"
                : "Solicitud enviada"
        );

        const estado = crearElemento(
            "span",
            "estado-solicitud " + solicitud.estado,
            "Estado: " + solicitud.estado
        );

        tarjeta.append(
            titulo,
            textoRol,
            solicitante,
            mensaje,
            fecha,
            estado
        );

        // Solo el propietario puede responder.

        if (
            esPropietario &&
            solicitud.estado === "pendiente"
        ) {

            const acciones = crearElemento(
                "div",
                "acciones-solicitud"
            );

            const botonAceptar = crearElemento(
                "button",
                "boton-aceptar",
                "Aceptar"
            );

            botonAceptar.type = "button";

            botonAceptar.addEventListener("click", function () {

                responderSolicitud(solicitud.id, "aceptada");

            });

            const botonRechazar = crearElemento(
                "button",
                "boton-rechazar",
                "Rechazar"
            );

            botonRechazar.type = "button";

            botonRechazar.addEventListener("click", function () {

                responderSolicitud(solicitud.id, "rechazada");

            });

            acciones.append(
                botonAceptar,
                botonRechazar
            );

            tarjeta.appendChild(acciones);

        }

        contenedorSolicitudes.appendChild(tarjeta);

    });

}


/* =====================================================
   23. ACEPTAR O RECHAZAR UNA SOLICITUD
===================================================== */

function responderSolicitud(id, respuesta) {

    if (!sesionActual) {
        return;
    }

    const solicitud = solicitudes.find(
        elemento => elemento.id === id
    );

    if (!solicitud) {
        return;
    }

    if (solicitud.propietarioId !== sesionActual.id) {

        alert("No puedes responder a esta solicitud.");

        return;

    }

    if (solicitud.estado !== "pendiente") {

        alert("Esta solicitud ya fue respondida.");

        return;

    }

    const producto = productos.find(
        elemento => elemento.id === solicitud.productoId
    );

    if (!producto) {

        alert("El producto ya no existe.");

        return;

    }

    if (
        respuesta === "aceptada" &&
        producto.estado !== "disponible"
    ) {

        alert("Este producto ya no está disponible.");

        return;

    }

    const estadoAnteriorSolicitud = solicitud.estado;

    const estadoAnteriorProducto = producto.estado;

    solicitud.estado = respuesta;

    // Si aceptamos la solicitud, el producto queda reservado.

    if (respuesta === "aceptada") {

        producto.estado = "reservado";

        // Rechazamos otras solicitudes pendientes
        // del mismo producto.

        solicitudes.forEach(function (otraSolicitud) {

            if (
                otraSolicitud.productoId === producto.id &&
                otraSolicitud.id !== solicitud.id &&
                otraSolicitud.estado === "pendiente"
            ) {

                otraSolicitud.estado = "rechazada";

            }

        });

    }

    const productosGuardados = guardarDatos(
        CLAVE_PRODUCTOS,
        productos
    );

    const solicitudesGuardadas = guardarDatos(
        CLAVE_SOLICITUDES,
        solicitudes
    );

    if (!productosGuardados || !solicitudesGuardadas) {

        solicitud.estado = estadoAnteriorSolicitud;

        producto.estado = estadoAnteriorProducto;

        alert("No se pudo guardar la respuesta.");

        return;

    }

    mostrarSolicitudes();

    mostrarProductos();

    mostrarMisProductos();

    alert(
        respuesta === "aceptada"
            ? "Solicitud aceptada. El producto está reservado."
            : "Solicitud rechazada."
    );

}


/* =====================================================
   24. AÑO AUTOMÁTICO DEL PIE DE PÁGINA
===================================================== */

document.querySelector("#anio").textContent =
    new Date().getFullYear();


/* =====================================================
   25. ANIMACIONES AL DESPLAZARSE
===================================================== */

const elementosAnimados = document.querySelectorAll(
    ".tarjeta-categoria, .beneficios article, .franja-solidaria"
);

if ("IntersectionObserver" in window) {

    const observador = new IntersectionObserver(
        function (entradas, observadorActual) {

            entradas.forEach(function (entrada) {

                if (entrada.isIntersecting) {

                    entrada.target.classList.add("visible");

                    observadorActual.unobserve(entrada.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    elementosAnimados.forEach(function (elemento) {

        observador.observe(elemento);

    });

} else {

    elementosAnimados.forEach(function (elemento) {

        elemento.classList.add("visible");

    });

}


/* =====================================================
   26. INICIAR EL SISTEMA
===================================================== */

// Mostramos la información guardada al abrir la página.

mostrarProductos();

actualizarInterfazUsuario();

mostrarSolicitudes();
