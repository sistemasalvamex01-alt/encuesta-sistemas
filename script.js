// Configuración de Google Apps Script Web App
// IMPORTANTE: REEMPLAZA ESTA URL con la que obtendrás al desplegar el script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxn2omA5IWtydDQQWZz_c8iJ-xjNyo3BGBEcQhZCY25XKQxa08UxWwJrA0-Yjhfnr5LA/exec';

// Manejo visual de selección emojis nivel servicio
document.addEventListener('DOMContentLoaded', () => {
    const opcionesNivel = document.querySelectorAll('#nivelServicioGroup .emoji-option');
    const hiddenNivel = document.getElementById('nivelServicio');

    opcionesNivel.forEach(opt => {
        opt.addEventListener('click', () => {
            // Remover selected de todos
            opcionesNivel.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            hiddenNivel.value = opt.getAttribute('data-value');
        });
    });

    // Estilo visual para radio buttons (opcional)
    const radioLabels = document.querySelectorAll('.radio-label');
    radioLabels.forEach(label => {
        const radio = label.querySelector('input[type="radio"]');
        radio.addEventListener('change', () => {
            radioLabels.forEach(lbl => lbl.classList.remove('selected-radio'));
            if (radio.checked) {
                label.classList.add('selected-radio');
            }
        });
        // Si ya tiene checked al cargar (no debería, pero por si)
        if (radio.checked) label.classList.add('selected-radio');
    });

    // Envío del formulario
    const form = document.getElementById('surveyForm');
    const messageDiv = document.getElementById('formMessage');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validaciones manuales
        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const nivelServicio = document.getElementById('nivelServicio').value;
        const tiempoRespuesta = document.getElementById('tiempoRespuesta').value;
        const problemaResuelto = document.querySelector('input[name="problemaResuelto"]:checked');
        const comentarios = document.getElementById('comentarios').value.trim();

        if (!nombre) {
            showMessage('Por favor ingresa tu nombre', 'error');
            return;
        }
        if (!correo || !correo.includes('@')) {
            showMessage('Ingresa un correo válido', 'error');
            return;
        }
        if (!nivelServicio) {
            showMessage('Selecciona un nivel de servicio (con emojis)', 'error');
            return;
        }
        if (!tiempoRespuesta) {
            showMessage('Selecciona el tiempo de respuesta', 'error');
            return;
        }
        if (!problemaResuelto) {
            showMessage('Indica si se resolvió el problema', 'error');
            return;
        }

        // Preparamos datos
        const datos = {
            nombre: nombre,
            correo: correo,
            nivelServicio: nivelServicio,
            tiempoRespuesta: tiempoRespuesta,
            problemaResuelto: problemaResuelto.value,
            comentarios: comentarios || 'Sin comentarios',
            timestamp: new Date().toLocaleString()
        };

        // Mostrar loading en botón
        const btn = document.getElementById('submitBtn');
        const originalText = btn.innerText;
        btn.innerText = '⏳ Enviando...';
        btn.disabled = true;

        try {
            // Enviar a Google Sheets vía POST
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',  // necesario para Apps Script sin CORS complejo
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            // Con 'no-cors' no podemos leer respuesta real, asumimos éxito si no hay error de red
            showMessage('✅ ¡Encuesta enviada! Tus respuestas han sido registradas. ¡Gracias!', 'success');
            form.reset();
            // Resetear estilos visuales
            document.querySelectorAll('#nivelServicioGroup .emoji-option').forEach(o => o.classList.remove('selected'));
            document.getElementById('nivelServicio').value = '';
            document.querySelectorAll('.radio-label').forEach(lbl => lbl.classList.remove('selected-radio'));
            
        } catch (error) {
            console.error('Error:', error);
            showMessage('❌ Error al enviar. Verifica tu conexión o contacta a sistemas.', 'error');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.className = 'message';
        }, 5000);
    }
});