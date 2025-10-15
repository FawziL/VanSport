import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/auth';
import { API_URL } from '@/config/api';
import Pagination from '@/components/Pagination';
import PageSizeSelector from '@/components/PageSizeSelector';
import ConfirmModal from '@/components/ConfirmModal';

export default function ListProduct() {
	const [productos, setProductos] = useState([]);
	const [page, setPage] = useState(1);
	const [pages, setPages] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [deleteId, setDeleteId] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const navigate = useNavigate();

	// Fetch productos
	useEffect(() => {
		setLoading(true);
		setError('');
		adminService.productos
			.list()
			.then((data) => {
				const items = Array.isArray(data) ? data : data.results || [];
				setProductos(items);
				setPages(Math.max(1, Math.ceil(items.length / pageSize)));
				setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(items.length / pageSize))));
			})
			.catch(() => setError('No se pudieron cargar los productos'))
			.finally(() => setLoading(false));
		// eslint-disable-next-line
	}, [pageSize]);

	// Actualiza páginas si cambia el tamaño o el listado
	useEffect(() => {
		setPages(Math.max(1, Math.ceil(productos.length / pageSize)));
		setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(productos.length / pageSize))));
		// eslint-disable-next-line
	}, [productos, pageSize]);

	const handleDelete = async () => {
		if (!deleteId) return;
		try {
			await adminService.productos.remove(deleteId);
			setProductos((prev) => prev.filter((p) => p.producto_id !== deleteId));
			setModalOpen(false);
			setDeleteId(null);
		} catch {
			setError('No se pudo eliminar el producto');
		}
	};

	// Paginado manual
	const start = (page - 1) * pageSize;
	const end = start + pageSize;
	const productosPage = productos.slice(start, end);

	// Render helpers
	const fmtPrecio = (v) => {
		if (v == null || v === '') return '-';
		const n = Number(v);
		if (Number.isNaN(n)) return String(v);
		return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(n);
	};

		const resolveImageUrl = (path) => {
			if (!path) return '';
			if (/^https?:/i.test(path)) return path;
			const base = API_URL.replace(/\/+$/, '');
			const rel = String(path).replace(/^\/+/, '');
			return `${base}/${rel}`;
		};

	return (
		<div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '0 1rem' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
				<h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Productos</h1>
				<Link
					to="/admin/productos/crear"
					style={{
						padding: '0.6rem 1.2rem',
						borderRadius: 8,
						background: '#1e88e5',
						color: '#fff',
						fontWeight: 800,
						textDecoration: 'none',
					}}
				>
					+ Crear producto
				</Link>
			</div>

			<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
				<PageSizeSelector value={pageSize} onChange={setPageSize} options={[5, 10, 20, 50]} label="Por página" />
			</div>

			{error && (
				<div style={{ color: '#d32f2f', marginBottom: 12, fontWeight: 700 }}>{error}</div>
			)}

			<div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #0001' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
					<thead>
						<tr style={{ background: '#f3f4f6', color: '#000000ff' }}>
							<th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
							<th style={{ padding: '12px 8px', textAlign: 'left' }}>Nombre</th>
							<th style={{ padding: '12px 8px', textAlign: 'left' }}>Categoría</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left' }}>Imagen</th>
							<th style={{ padding: '12px 8px', textAlign: 'left' }}>Precio</th>
							<th style={{ padding: '12px 8px', textAlign: 'left' }}>Stock</th>
							<th style={{ padding: '12px 8px', textAlign: 'left' }}>Estado</th>
							<th style={{ padding: '12px 8px', textAlign: 'center' }}>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Cargando...</td>
							</tr>
						) : productosPage.length === 0 ? (
							<tr>
								<td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
									No hay productos.
								</td>
							</tr>
						) : (
											productosPage.map((p) => (
								<tr key={p.producto_id} style={{ color: '#444' }}>
									<td style={{ padding: '10px 8px' }}>{p.producto_id}</td>
									<td style={{ padding: '10px 8px' }}>{p.nombre}</td>
									<td style={{ padding: '10px 8px' }}>{p.categoria?.nombre ?? '-'}</td>
                                    													<td style={{ padding: '10px 8px' }}>
														{p.imagen_url ? (
															<img
																src={resolveImageUrl(p.imagen_url)}
																alt={p.nombre || 'Producto'}
																style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
																loading="lazy"
															/>
														) : (
															<span style={{ color: '#999' }}>Sin imagen</span>
														)}
													</td>
									<td style={{ padding: '10px 8px' }}>{fmtPrecio(p.precio)}</td>
									<td style={{ padding: '10px 8px' }}>{p.stock}</td>
									<td style={{ padding: '10px 8px' }}>{p.activo ? 'Activo' : 'Inactivo'}</td>
									<td style={{ padding: '10px 8px', textAlign: 'center' }}>
										<button
											onClick={() => navigate(`/admin/productos/editar/${p.producto_id}`)}
											style={{
												marginRight: 8,
												padding: '0.4rem 0.8rem',
												borderRadius: 6,
												border: 'none',
												background: '#1e88e5',
												color: '#fff',
												fontWeight: 700,
												cursor: 'pointer',
											}}
										>
											Editar
										</button>
										<button
											onClick={() => {
												setDeleteId(p.producto_id);
												setModalOpen(true);
											}}
											style={{
												padding: '0.4rem 0.8rem',
												borderRadius: 6,
												border: 'none',
												background: '#e53935',
												color: '#fff',
												fontWeight: 700,
												cursor: 'pointer',
											}}
										>
											Eliminar
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<Pagination page={page} pages={pages} onChange={setPage} showNumbers />

			<ConfirmModal
				open={modalOpen}
				title="¿Estás seguro de eliminar este producto?"
				message="Esta acción no se puede deshacer."
				confirmText="Sí, eliminar"
				cancelText="Cancelar"
				danger
				onCancel={() => setModalOpen(false)}
				onConfirm={handleDelete}
			/>
		</div>
	);
}
