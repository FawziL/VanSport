export default function StatusBadge({ estado, className = '', variant = 'default' }) {
  // Configuración para reportes (variante por defecto)
  const getReportStatusConfig = (estado) => {
    const config = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳',
        label: 'Pendiente',
      },
      en_revision: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '🔍',
        label: 'En revisión',
      },
      finalizado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
        label: 'Finalizado',
      },
      completado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
        label: 'Completado',
      },
    };

    return (
      config[estado] || {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: '❓',
        label: estado,
      }
    );
  };

  // Configuración para pedidos
  const getOrderStatusConfig = (estado) => {
    const estadoLower = estado.toLowerCase();
    const config = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳',
        label: 'Pendiente',
      },
      completado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
        label: 'Completado',
      },
      cancelado: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: '❌',
        label: 'Cancelado',
      },
      en_transito: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '🔄',
        label: 'En tránsito',
      },
      pagado: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: '🚚',
        label: 'Pagado',
      },
      entregado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '📦',
        label: 'Entregado',
      },
    };

    return (
      config[estadoLower] || {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: '❓',
        label: estado,
      }
    );
  };

  // Seleccionar la configuración según la variante
  const getStatusConfig = (estado) => {
    if (variant === 'order') {
      return getOrderStatusConfig(estado);
    }
    return getReportStatusConfig(estado);
  };

  const status = getStatusConfig(estado);

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text} ${className}`}
    >
      {status.icon} {status.label}
    </span>
  );
}
