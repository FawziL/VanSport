/**
 * Data migration script: Old Django tables (Spanish) → New NestJS tables (English)
 *
 * Usage: npx ts-node db/migrate-legacy.ts
 *
 * This script connects to the same PostgreSQL database and migrates
 * data from the old Django-managed tables to the new Drizzle tables.
 *
 * Old tables: categorias, productos, usuarios, pedidos, detalles_pedido,
 *             carrito, reseñas, notificaciones, transacciones, envios,
 *             reportes_falla, reportes_falla_followups, metodos_pago
 *
 * New tables: categories, products, user, orders, order_items, cart_items,
 *             reviews, notifications, transactions, shipments, bug_reports,
 *             bug_report_followups, payment_methods
 */
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  console.log('Connected to database. Starting migration...');

  try {
    await client.query('BEGIN');

    // 1. Migrate categories
    console.log('1/12 Migrating categories...');
    await client.query(`
      INSERT INTO categories (id, name, description, image_url, is_featured)
      SELECT categoria_id, nombre, descripcion, imagen_url, destacado
      FROM categorias
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'categories')} categories`);

    // 2. Migrate products
    console.log('2/12 Migrating products...');
    await client.query(`
      INSERT INTO products (id, name, description, price, sale_price, stock, category_id, image_url, is_active, is_featured, additional_images, created_at)
      SELECT producto_id, nombre, descripcion, precio::text, precio_oferta::text, stock, categoria_id, imagen_url, activo, destacado, imagenes_adicionales, fecha_creacion
      FROM productos
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'products')} products`);

    // 3. Migrate users to better-auth user table
    console.log('3/12 Migrating users...');
    await client.query(`
      INSERT INTO "user" (id, name, email, email_verified, is_staff, is_active, phone, registered_at, created_at, updated_at)
      SELECT usuario_id::text, nombre, email, true, is_staff, activo, telefono, fecha_registro, fecha_registro, fecha_registro
      FROM usuarios
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'user')} users`);

    // 4. Migrate orders
    console.log('4/12 Migrating orders...');
    await client.query(`
      INSERT INTO orders (id, user_id, ordered_at, status, total, shipping_address, notes)
      SELECT pedido_id, usuario_id::text, fecha_pedido, estado, total::text, direccion_envio, notas
      FROM pedidos
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'orders')} orders`);

    // 5. Migrate order items
    console.log('5/12 Migrating order items...');
    await client.query(`
      INSERT INTO order_items (id, order_id, product_id, unit_price, quantity, subtotal)
      SELECT detalle_id, pedido_id, producto_id, precio_unitario::text, cantidad, subtotal::text
      FROM detalles_pedido
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'order_items')} order items`);

    // 6. Migrate cart items
    console.log('6/12 Migrating cart items...');
    await client.query(`
      INSERT INTO cart_items (id, user_id, product_id, quantity, added_at)
      SELECT carrito_id, usuario_id::text, producto_id, cantidad, fecha_agregado
      FROM carrito
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'cart_items')} cart items`);

    // 7. Migrate reviews
    console.log('7/12 Migrating reviews...');
    await client.query(`
      INSERT INTO reviews (id, product_id, user_id, rating, comment, created_at)
      SELECT resena_id, producto_id, usuario_id::text, calificacion, comentario, fecha_creacion
      FROM reseñas
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'reviews')} reviews`);

    // 8. Migrate notifications
    console.log('8/12 Migrating notifications...');
    await client.query(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read, related_id, related_type, expires_at, created_at)
      SELECT notificacion_id, usuario_id::text, titulo, mensaje, tipo, leida, relacion_id, relacion_tipo, expira, fecha_creacion
      FROM notificaciones
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'notifications')} notifications`);

    // 9. Migrate transactions
    console.log('9/12 Migrating transactions...');
    await client.query(`
      INSERT INTO transactions (id, order_id, amount, payment_method, status, transaction_code, reference, receipt, payment_notes, created_at)
      SELECT transaccion_id, pedido_id, monto::text, metodo_pago, estado, codigo_transaccion, referencia, comprobante, notas_pago, fecha_transaccion
      FROM transacciones
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'transactions')} transactions`);

    // 10. Migrate shipments
    console.log('10/12 Migrating shipments...');
    await client.query(`
      INSERT INTO shipments (id, order_id, shipping_method, address, shipped_at, estimated_delivery, status, tracking_code, cost)
      SELECT envio_id, pedido_id, metodo_envio, direccion_envio, fecha_envio, fecha_entrega_estimada, estado, codigo_seguimiento, costo_envio::text
      FROM envios
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'shipments')} shipments`);

    // 11. Migrate bug reports
    console.log('11/12 Migrating bug reports...');
    await client.query(`
      INSERT INTO bug_reports (id, user_id, category, title, description, section, image_url, video_url, status, created_at, updated_at)
      SELECT id, usuario_id::text, categoria, titulo, descripcion, seccion, imagen_url, video_url, estado, fecha_creacion, fecha_actualizacion
      FROM reportes_falla
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'bug_reports')} bug reports`);

    // 12. Migrate bug report followups
    console.log('12/12 Migrating bug report followups...');
    await client.query(`
      INSERT INTO bug_report_followups (id, bug_report_id, author_type, message, image_url, created_at)
      SELECT followup_id, reporte_id, autor_tipo, mensaje, imagen_url, fecha_creacion
      FROM reportes_falla_followups
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   -> ${await getCount(client, 'bug_report_followups')} bug report followups`);

    // Sync payment methods
    await client.query(`
      INSERT INTO payment_methods (id, code, name, type, is_active, sort_order, description, instructions, config, icon, created_at, updated_at)
      SELECT id, codigo, nombre, tipo, activo, orden, descripcion, instrucciones, config, icono, creado, actualizado
      FROM metodos_pago
      ON CONFLICT (id) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function getCount(client: any, table: string): Promise<number> {
  const result = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
  return parseInt(result.rows[0].count);
}

migrate().catch(console.error);
