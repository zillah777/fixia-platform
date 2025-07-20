const { query } = require('./src/config/database');

async function testAndPopulateTables() {
  try {
    console.log('🔍 Testing categories and localities tables...');
    
    // Check categories
    console.log('\n📂 Checking categories table...');
    const categoriesResult = await query('SELECT COUNT(*) as count FROM categories');
    console.log(`Categories count: ${categoriesResult.rows[0].count}`);
    
    if (categoriesResult.rows[0].count == 0) {
      console.log('📝 Populating basic categories...');
      
      const basicCategories = [
        { name: 'Plomería', icon: '🔧', group: 'Mantenimiento y reparaciones', description: 'Servicios de plomería y fontanería' },
        { name: 'Electricidad', icon: '⚡', group: 'Mantenimiento y reparaciones', description: 'Servicios eléctricos y iluminación' },
        { name: 'Carpintería', icon: '🔨', group: 'Mantenimiento y reparaciones', description: 'Trabajos en madera y carpintería' },
        { name: 'Limpieza', icon: '🧹', group: 'Servicios para el hogar y la familia', description: 'Servicios de limpieza doméstica' },
        { name: 'Jardinería', icon: '🌱', group: 'Jardinería y espacios exteriores', description: 'Cuidado de jardines y plantas' },
        { name: 'Pintura', icon: '🎨', group: 'Mantenimiento y reparaciones', description: 'Pintura de interiores y exteriores' },
        { name: 'Albañilería', icon: '🧱', group: 'Mantenimiento y reparaciones', description: 'Trabajos de construcción y albañilería' },
        { name: 'Reparación de electrodomésticos', icon: '🔌', group: 'Mantenimiento y reparaciones', description: 'Reparación de electrodomésticos' },
        { name: 'Cuidado de niños', icon: '👶', group: 'Servicios para el hogar y la familia', description: 'Niñeras y cuidado infantil' },
        { name: 'Belleza y estética', icon: '💄', group: 'Belleza, estética y cuidado personal', description: 'Servicios de belleza a domicilio' }
      ];

      for (const category of basicCategories) {
        await query(`
          INSERT INTO categories (name, icon, group_name, description, is_active) 
          VALUES ($1, $2, $3, $4, true) 
          ON CONFLICT (name) DO NOTHING
        `, [category.name, category.icon, category.group, category.description]);
      }
      
      console.log(`✅ Added ${basicCategories.length} basic categories`);
    } else {
      console.log('✅ Categories table already has data');
      const sampleCategories = await query('SELECT name, group_name FROM categories LIMIT 5');
      console.log('Sample categories:', sampleCategories.rows);
    }
    
    // Check localities
    console.log('\n🏘️ Checking chubut_localities table...');
    const localitiesResult = await query('SELECT COUNT(*) as count FROM chubut_localities');
    console.log(`Localities count: ${localitiesResult.rows[0].count}`);
    
    if (localitiesResult.rows[0].count == 0) {
      console.log('📝 Populating Chubut localities...');
      
      const localities = [
        'Rawson', 'Trelew', 'Puerto Madryn', 'Comodoro Rivadavia', 'Esquel',
        'Gaiman', 'Dolavon', 'Rada Tilly', 'Trevelin', 'Puerto Pirámides',
        'Sarmiento', 'Río Mayo', 'Alto Río Senguer', 'Gobernador Costa',
        'Las Plumas', 'Gastre', 'Paso de Indios', 'Tecka', 'Gualjaina',
        'El Maitén', 'El Hoyo', 'Epuyén', 'Cholila', 'Lago Puelo',
        'José de San Martín', 'Facundo', 'Playa Unión', 'Playa Magagna'
      ];

      for (const locality of localities) {
        await query(`
          INSERT INTO chubut_localities (name, region, is_active) 
          VALUES ($1, 'Chubut', true) 
          ON CONFLICT (name) DO NOTHING
        `, [locality]);
      }
      
      console.log(`✅ Added ${localities.length} Chubut localities`);
    } else {
      console.log('✅ Localities table already has data');
      const sampleLocalities = await query('SELECT name FROM chubut_localities LIMIT 5');
      console.log('Sample localities:', sampleLocalities.rows);
    }
    
    console.log('\n🎉 Tables check and population completed!');
    
  } catch (error) {
    console.error('❌ Error testing/populating tables:', error);
  }
}

if (require.main === module) {
  testAndPopulateTables()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { testAndPopulateTables };