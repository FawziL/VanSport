export default function StatusBadge({ estado, className = '' }) {
  const getStatusConfig = (estado) => {
    const config = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: '⏳',
        label: 'Pendiente'
      },
      en_revision: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: '🔍',
        label: 'En revisión'
      },
      finalizado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: '✅',
        label: 'Finalizado'
      }
    };
    
    return config[estado] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: '❓',
      label: estado
    };
  };

  const status = getStatusConfig(estado);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text} ${className}`}>
      {status.icon} {status.label}
    </span>
  );
}