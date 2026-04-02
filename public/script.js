/**
 * KanbanPro - Lógica de Frontend (Sprint 3)
 * Maneja la interactividad de arrastrar y soltar con persistencia en PostgreSQL
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const columns = document.querySelectorAll('.kanban-cards');

    // 1. Configuración de Arrastre (Drag & Drop)
    cards.forEach(card => {
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });
    });

    // 2. Manejo de las Columnas (Zonas de soltado)
    columns.forEach(column => {
        // Permitir que los elementos se muevan sobre la columna
        column.addEventListener('dragover', e => {
            e.preventDefault(); // Necesario para permitir el "drop"
            const draggingCard = document.querySelector('.dragging');
            
            // Lógica visual: insertar antes del elemento más cercano o al final
            const afterElement = getDragAfterElement(column, e.clientY);
            if (afterElement == null) {
                column.appendChild(draggingCard);
            } else {
                column.insertBefore(draggingCard, afterElement);
            }
        });

        // Evento cuando se suelta la tarjeta (Persistencia Real)
        column.addEventListener('drop', async (e) => {
            const draggingCard = document.querySelector('.dragging');
            
            // Obtenemos los IDs reales de la base de datos desde los atributos data-
            const tarjetaId = draggingCard.getAttribute('data-tarjeta-id');
            const nuevaListaId = column.closest('.kanban-column').getAttribute('data-lista-id');

            console.log(`Intentando mover tarjeta ${tarjetaId} a lista ${nuevaListaId}...`);

            try {
                // Llamada a nuestra API RESTful
                const response = await fetch('/api/tarjetas/mover', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tarjetaId: tarjetaId,
                        nuevaListaId: nuevaListaId
                    })
                });

                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }

                const result = await response.json();
                console.log('✅ Cambio guardado en DB:', result.message);

            } catch (error) {
                console.error('❌ Error al persistir el movimiento:', error);
                alert('No se pudo guardar el cambio en el servidor. Reintentando...');
                // Opcional: recargar la página para devolver la tarjeta a su sitio real
                // window.location.reload();
            }
        });
    });

    /**
     * Función auxiliar para determinar la posición exacta donde soltar la tarjeta
     * (permite reordenar tarjetas dentro de la misma columna)
     */
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

});