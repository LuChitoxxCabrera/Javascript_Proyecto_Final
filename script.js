document.addEventListener('DOMContentLoaded', () => {
    try {
        fetch('salas.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('error de respuesta');
                }
                return response.json();
            })
            .then(data => {
                const salasDiv = document.getElementById('salas');
                const salaSelect = document.getElementById('sala');

                data.salas.forEach(sala => {
                    const salaDiv = document.createElement('div');
                    salaDiv.classList.add('sala');
                    salaDiv.innerHTML = `
                        <img src="${sala.imagen}" alt="${sala.nombre}">
                        <h3>${sala.nombre}</h3>
                        <p>Capacidad: ${sala.capacidad} personas</p>
                        <p>Precio: $${sala.precio} por hora</p>
                    `;
                    salasDiv.appendChild(salaDiv);

                    const option = document.createElement('option');
                    option.value = sala.id;
                    option.textContent = sala.nombre;
                    salaSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error de busqueda salas.json:', error);
            });

        let reservas = cargarReservas();
        let reservaEnEdicion = null;

        document.getElementById('reserva-form').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const nombre = document.getElementById('nombre').value;
                const email = document.getElementById('email').value;
                const sala = document.getElementById('sala').value;
                const fecha = document.getElementById('fecha').value;
                const hora = document.getElementById('hora').value;

                if (reservaEnEdicion) {
                    reservaEnEdicion.nombre = nombre;
                    reservaEnEdicion.email = email;
                    reservaEnEdicion.sala = sala;
                    reservaEnEdicion.fecha = fecha;
                    reservaEnEdicion.hora = hora;
                    reservaEnEdicion = null;
                    Swal.fire({
                        icon: "success",
                        title: "Perfecto!",
                        text: "Reserva modificada exitosamente.",
                      });
                } else {
                    
                    if (isSalaReservada(sala, fecha, hora)) {
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "La sala ya se encuentra reservada en la fecha y hora especificadas.",
                          });
                        return;
                    }
                    const reserva = { id: Date.now(), nombre, email, sala, fecha, hora };
                    reservas.push(reserva);
                    Swal.fire(`Reserva realizada: \nNombre: ${nombre}\nEmail: ${email}\nSala: ${sala}\nFecha: ${fecha}\nHora: ${hora}`);
                }

                guardarReservas(reservas);
                actualizarListaReservas();
                document.getElementById('reserva-form').reset();
            } catch (error) {
                console.error('Error al realizar reserva:', error);
            }
        });

        function isSalaReservada(sala, fecha, hora) {
            return reservas.some(reserva => reserva.sala === sala && reserva.fecha === fecha && reserva.hora === hora);
        }

        function actualizarListaReservas() {
            try {
                const listaReservas = document.getElementById('lista-reservas');
                listaReservas.innerHTML = '';
                reservas.forEach(reserva => {
                    const li = document.createElement('li');
                    li.classList.add('reserva');
                    li.innerHTML = `
                        <span>${reserva.nombre} - ${reserva.sala} - ${reserva.fecha} - ${reserva.hora}</span>
                        <button class="modificar" data-id="${reserva.id}">Modificar</button>
                        <button class="cancelar" data-id="${reserva.id}">Cancelar</button>
                    `;
                    listaReservas.appendChild(li);
                });

                document.querySelectorAll('.cancelar').forEach(boton => {
                    boton.addEventListener('click', (e) => {
                        try {
                            const reservaId = e.target.getAttribute('data-id');
                            confirmarYCancelarReserva(reservaId);
                        } catch (error) {
                            console.error('Error al cancelar reserva:', error);
                        }
                    });
                });

                document.querySelectorAll('.modificar').forEach(boton => {
                    boton.addEventListener('click', (e) => {
                        try {
                            const reservaId = e.target.getAttribute('data-id');
                            cargarReservaEnFormulario(reservaId);
                        } catch (error) {
                            console.error('Error al cargar la reserva del formulario:', error);
                        }
                    });
                });
            } catch (error) {
                console.error('Error al cargar la lista de reservas:', error);
            }
        }

        function cargarReservaEnFormulario(id) {
            try {
                const reserva = reservas.find(reserva => reserva.id == id);
                if (reserva) {
                    document.getElementById('nombre').value = reserva.nombre;
                    document.getElementById('email').value = reserva.email;
                    document.getElementById('sala').value = reserva.sala;
                    document.getElementById('fecha').value = reserva.fecha;
                    document.getElementById('hora').value = reserva.hora;
                    reservaEnEdicion = reserva;
                } else {
                    throw new Error('Reserva no encontrada');
                }
            } catch (error) {
                console.error('Error al encontrar reserva:', error);
            }
        }

        function confirmarYCancelarReserva(id) {
            try {
                Swal.fire({
                    title: "¿Está seguro de que desea cancelar esta reserva?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Si, eliminar"
                  }).then((result) => {
                    if (result.isConfirmed) {
                        cancelarReserva(id);
                    }
                  });
                
            } catch (error) {
                console.error('Error al confirmar cancelacion:', error);
            }
        }

        function cancelarReserva(id) {
            try {
                const index = reservas.findIndex(reserva => reserva.id == id);
                if (index !== -1) {
                    reservas.splice(index, 1);
                    guardarReservas(reservas);
                    actualizarListaReservas();
                    Swal.fire({
                        title: "Listo!",
                        text: "Su reserva ha sido eliminada",
                        icon: "success"
                      });
                } else {
                    throw new Error('Reserva no encontrada');
                }
            } catch (error) {
                console.error('Error al cancelar reservacion:', error);
            }
        }

        function guardarReservas(reservas) {
            localStorage.setItem('reservas', JSON.stringify(reservas));
        }

        function cargarReservas() {
            const reservasJSON = localStorage.getItem('reservas');
            return reservasJSON ? JSON.parse(reservasJSON) : [];
        }

        actualizarListaReservas();
    } catch (error) {
        console.error('Error al iniciar aplicacion:', error);
    }
});
