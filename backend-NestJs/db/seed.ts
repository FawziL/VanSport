import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

const R2 = process.env.R2_PUBLIC_URL || 'https://pub-7b47abd71bfe4adc9f72992e25ff4414.r2.dev';

async function main() {
  console.log('Seeding...');

  // ── 1. Users ──
  // BetterAuth manages users. We create an admin user manually so orders etc can reference it.
  const [admin] = await db
    .insert(schema.user)
    .values({
      id: 'seed-admin-id',
      name: 'Admin',
      email: 'admin@vansport.com',
      emailVerified: true,
      isStaff: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const [user2] = await db
    .insert(schema.user)
    .values({
      id: 'seed-user-id',
      name: 'Usuario Demo',
      email: 'demo@vansport.com',
      emailVerified: true,
      isStaff: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  console.log('  ✓ Users');

  // ── 2. Categories ──
  const catData = [
    { name: 'Ropa', description: 'Camisetas, chaquetas y más', imageUrl: `${R2}/categories/ropa.jpg` },
    { name: 'Accesorios', description: 'Gorras, mochilas y complementos', imageUrl: `${R2}/categories/accesorios.jpg` },
    { name: 'Calzado', description: 'Zapatillas y zapatos deportivos', imageUrl: `${R2}/categories/calzado.jpg` },
    { name: 'Equipamiento', description: 'Balones, redes y equipo de entrenamiento', imageUrl: `${R2}/categories/equipamiento.jpg` },
  ];

  const cats = await db
    .insert(schema.categories)
    .values(catData.map((c) => ({ ...c, isFeatured: true })))
    .onConflictDoNothing()
    .returning();

  console.log(`  ✓ ${cats.length} Categories`);

  // ── 3. Products ──
  const catMap: Record<string, number> = {};
  for (const c of cats) {
    const name = catData.find((d) => d.name === c.name)?.name;
    if (name) catMap[name] = c.id;
  }

  const productData = [
    {
      name: 'Camiseta Deportiva MVP',
      description: 'Camiseta transpirable de alto rendimiento para cualquier deporte.',
      price: '29.99', salePrice: '24.99', stock: 50,
      categoryId: catMap['Ropa'], isFeatured: true,
      imageUrl: `${R2}/products/camiseta-mvp.jpg`,
      additionalImages: [`${R2}/products/camiseta-mvp-2.jpg`, `${R2}/products/camiseta-mvp-3.jpg`],
    },
    {
      name: 'Chaqueta Cortavientos Pro',
      description: 'Chaqueta ligera resistente al viento y al agua.',
      price: '59.99', salePrice: null, stock: 30,
      categoryId: catMap['Ropa'], isFeatured: true,
      imageUrl: `${R2}/products/chaqueta-pro.jpg`,
      additionalImages: [],
    },
    {
      name: 'Gorra Ajustable Classic',
      description: 'Gorra con ajuste trasero y bordado del logo.',
      price: '14.99', salePrice: '9.99', stock: 100,
      categoryId: catMap['Accesorios'], isFeatured: false,
      imageUrl: `${R2}/products/gorra-classic.jpg`,
      additionalImages: [],
    },
    {
      name: 'Mochila Deportiva 30L',
      description: 'Mochila con compartimento para laptop y bolsillo para zapatos.',
      price: '39.99', salePrice: null, stock: 25,
      categoryId: catMap['Accesorios'], isFeatured: true,
      imageUrl: `${R2}/products/mochila-30l.jpg`,
      additionalImages: [],
    },
    {
      name: 'Zapatillas Running Aero',
      description: 'Zapatillas ultraligeras con amortiguación reactiva.',
      price: '89.99', salePrice: '69.99', stock: 40,
      categoryId: catMap['Calzado'], isFeatured: true,
      imageUrl: `${R2}/products/zapatillas-aero.jpg`,
      additionalImages: [`${R2}/products/zapatillas-aero-2.jpg`],
    },
    {
      name: 'Balón Oficial VS-1',
      description: 'Balón de fútbol tamaño oficial cosido a máquina.',
      price: '24.99', salePrice: null, stock: 60,
      categoryId: catMap['Equipamiento'], isFeatured: false,
      imageUrl: `${R2}/products/balon-vs1.jpg`,
      additionalImages: [],
    },
  ];

  const prods = await db
    .insert(schema.products)
    .values(
      productData.map((p) => ({
        ...p,
        additionalImages: p.additionalImages.length > 0 ? JSON.stringify(p.additionalImages) : null,
        isActive: true,
      }))
    )
    .onConflictDoNothing()
    .returning();

  console.log(`  ✓ ${prods.length} Products`);

  // ── 4. Reviews ──
  if (prods.length > 0 && admin && user2) {
    const reviewData = [
      { productId: prods[0].id, userId: user2.id, rating: 5, comment: 'Excelente calidad, muy cómoda.' },
      { productId: prods[0].id, userId: admin.id, rating: 4, comment: 'Buena relación calidad-precio.' },
      { productId: prods[4].id, userId: user2.id, rating: 5, comment: 'Las más cómodas que he tenido.' },
    ];
    await db.insert(schema.reviews).values(reviewData).onConflictDoNothing();
    console.log('  ✓ Reviews');
  }

  // ── 5. Payment Methods ──
  const pmData = [
    {
      code: 'transferencia', name: 'Transferencia Bancaria', type: 'transferencia',
      description: 'Pago por transferencia directa', instructions: 'Transfiere el monto exacto a la cuenta indicada.',
      sortOrder: 1, isActive: true,
      config: JSON.stringify({ requiere_referencia: true }),
    },
    {
      code: 'pago_movil', name: 'Pago Móvil', type: 'pago_movil',
      description: 'Pago a través de Pago Móvil', instructions: 'Realiza el pago desde tu banca en línea.',
      sortOrder: 2, isActive: true,
      config: JSON.stringify({ requiere_referencia: true }),
    },
    {
      code: 'paypal', name: 'PayPal', type: 'paypal',
      description: 'Pago con tarjeta o cuenta PayPal', instructions: '',
      sortOrder: 3, isActive: true,
      config: JSON.stringify({ requiere_referencia: false }),
    },
    {
      code: 'efectivo', name: 'Efectivo', type: 'efectivo',
      description: 'Pago en efectivo al recibir', instructions: 'Solo disponible para retiro en tienda.',
      sortOrder: 4, isActive: true,
      config: JSON.stringify({ requiere_referencia: false }),
    },
  ];

  await db.insert(schema.paymentMethods).values(pmData).onConflictDoNothing();
  console.log('  ✓ Payment Methods');

  // ── 6. Banner Notification ──
  await db
    .insert(schema.notifications)
    .values({
      title: '¡Bienvenido a VanSport!',
      message: 'Descubre nuestra nueva colección con grandes descuentos.',
      type: 'banner',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .onConflictDoNothing();
  console.log('  ✓ Banner notification');

  console.log('\nSeed completed successfully!');
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
