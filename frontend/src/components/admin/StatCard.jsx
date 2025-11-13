import { Link } from 'react-router-dom';

function StatCard({ title, value, to, note }) {
  const content = (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-24">
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-2xl font-extrabold text-gray-900">{value}</div>
      {note && <div className="text-gray-500 text-xs mt-1">{note}</div>}
    </div>
  );

  return to ? (
    <Link to={to} className="no-underline text-inherit hover:opacity-90 transition-opacity">
      {content}
    </Link>
  ) : (
    content
  );
}

export default StatCard;
