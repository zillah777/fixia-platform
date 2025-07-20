const { query } = require('../src/config/database');

const createServiceCategories = async () => {
  try {
    console.log('🔄 Inserting comprehensive service categories...');

    // Clear existing categories first
    await query('DELETE FROM categories');

    const categories = [
      // Servicios para el hogar y la familia
      {
        name: 'Niñera / Cuidado de niños',
        description: 'Cuidado profesional de niños en el hogar',
        icon: '👶',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 1
      },
      {
        name: 'Cuidado de personas mayores',
        description: 'Acompañamiento y cuidado de adultos mayores',
        icon: '👴',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 2
      },
      {
        name: 'Cuidador de personas con discapacidad',
        description: 'Cuidado especializado para personas con discapacidad',
        icon: '♿',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 3
      },
      {
        name: 'Enfermería a domicilio',
        description: 'Servicios de enfermería y cuidados médicos en casa',
        icon: '👩‍⚕️',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 4
      },
      {
        name: 'Cocinero a domicilio / Chef para eventos',
        description: 'Servicio de cocina profesional a domicilio',
        icon: '👨‍🍳',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 5
      },
      {
        name: 'Lavado y planchado de ropa',
        description: 'Servicio de lavandería y planchado a domicilio',
        icon: '👕',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 6
      },
      {
        name: 'Limpieza de casas / Limpieza profunda',
        description: 'Servicio de limpieza doméstica y limpieza profunda',
        icon: '🧹',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 7
      },
      {
        name: 'Limpieza de patios y jardines',
        description: 'Limpieza y mantenimiento de espacios exteriores',
        icon: '🌿',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 8
      },
      {
        name: 'Paseador de perros',
        description: 'Paseo y cuidado de mascotas',
        icon: '🐕',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 9
      },
      {
        name: 'Cuidado de mascotas (pet sitting)',
        description: 'Cuidado integral de mascotas en casa',
        icon: '🐱',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 10
      },
      {
        name: 'Adiestramiento canino',
        description: 'Entrenamiento y educación de perros',
        icon: '🎾',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 11
      },
      {
        name: 'Transporte escolar',
        description: 'Servicio de transporte para estudiantes',
        icon: '🚌',
        parent_category: 'Servicios para el hogar y la familia',
        sort_order: 12
      },

      // Belleza, estética y cuidado personal
      {
        name: 'Peluquero/a',
        description: 'Servicios de peluquería y estilismo',
        icon: '💇',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 13
      },
      {
        name: 'Barbería a domicilio',
        description: 'Servicios de barbería profesional en casa',
        icon: '💈',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 14
      },
      {
        name: 'Maquilladora profesional',
        description: 'Maquillaje profesional para eventos y ocasiones especiales',
        icon: '💄',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 15
      },
      {
        name: 'Manicura y pedicura',
        description: 'Cuidado profesional de uñas de manos y pies',
        icon: '💅',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 16
      },
      {
        name: 'Depilación',
        description: 'Servicios de depilación profesional',
        icon: '🪒',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 17
      },
      {
        name: 'Masajes terapéuticos',
        description: 'Masajes terapéuticos y relajantes',
        icon: '💆',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 18
      },
      {
        name: 'Estética facial/corporal',
        description: 'Tratamientos estéticos faciales y corporales',
        icon: '✨',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 19
      },
      {
        name: 'Spa móvil',
        description: 'Servicios de spa y relajación a domicilio',
        icon: '🧖‍♀️',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 20
      },
      {
        name: 'Entrenador personal',
        description: 'Entrenamiento físico personalizado',
        icon: '🏋️',
        parent_category: 'Belleza, estética y cuidado personal',
        sort_order: 21
      },

      // Mantenimiento y reparaciones
      {
        name: 'Plomero',
        description: 'Instalaciones y reparaciones de plomería',
        icon: '🚰',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 22
      },
      {
        name: 'Electricista',
        description: 'Instalaciones y reparaciones eléctricas',
        icon: '⚡',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 23
      },
      {
        name: 'Gasista matriculado',
        description: 'Instalaciones y reparaciones de gas',
        icon: '🔥',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 24
      },
      {
        name: 'Albañil',
        description: 'Trabajos de albañilería y construcción',
        icon: '🧱',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 25
      },
      {
        name: 'Pintor',
        description: 'Pintura de interiores y exteriores',
        icon: '🎨',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 26
      },
      {
        name: 'Herrero',
        description: 'Trabajos en hierro y soldadura',
        icon: '⚒️',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 27
      },
      {
        name: 'Carpintero',
        description: 'Trabajos en madera y carpintería',
        icon: '🪚',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 28
      },
      {
        name: 'Techista',
        description: 'Reparación e instalación de techos',
        icon: '🏠',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 29
      },
      {
        name: 'Instalador de aires acondicionados',
        description: 'Instalación y mantenimiento de sistemas de climatización',
        icon: '❄️',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 30
      },
      {
        name: 'Instalación de cámaras de seguridad',
        description: 'Instalación de sistemas de videovigilancia',
        icon: '📹',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 31
      },
      {
        name: 'Cerrajero',
        description: 'Servicios de cerrajería y llaves',
        icon: '🔑',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 32
      },
      {
        name: 'Reparación de electrodomésticos',
        description: 'Reparación de electrodomésticos del hogar',
        icon: '🔧',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 33
      },
      {
        name: 'Arreglo de muebles',
        description: 'Reparación y restauración de muebles',
        icon: '🪑',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 34
      },
      {
        name: 'Instalación de muebles',
        description: 'Armado e instalación de muebles',
        icon: '🔨',
        parent_category: 'Mantenimiento y reparaciones',
        sort_order: 35
      },

      // Jardinería y espacios exteriores
      {
        name: 'Jardinería general',
        description: 'Mantenimiento general de jardines',
        icon: '🌱',
        parent_category: 'Jardinería y espacios exteriores',
        sort_order: 36
      },
      {
        name: 'Diseño de jardines',
        description: 'Diseño y planificación de espacios verdes',
        icon: '🌺',
        parent_category: 'Jardinería y espacios exteriores',
        sort_order: 37
      },
      {
        name: 'Poda de árboles',
        description: 'Poda y cuidado de árboles',
        icon: '🌳',
        parent_category: 'Jardinería y espacios exteriores',
        sort_order: 38
      },
      {
        name: 'Limpieza de terrenos baldíos',
        description: 'Limpieza y acondicionamiento de terrenos',
        icon: '🏞️',
        parent_category: 'Jardinería y espacios exteriores',
        sort_order: 39
      },
      {
        name: 'Mantenimiento de piletas',
        description: 'Limpieza y mantenimiento de piscinas',
        icon: '🏊',
        parent_category: 'Jardinería y espacios exteriores',
        sort_order: 40
      },
      {
        name: 'Colocación de cercos',
        description: 'Instalación de cercos y alambrados',
        icon: '🚧',
        parent_category: 'Jardinería y espacios exteriores',
        sort_order: 41
      },

      // Servicios de vehículos
      {
        name: 'Lavado de autos a domicilio',
        description: 'Lavado y encerado de vehículos en casa',
        icon: '🚗',
        parent_category: 'Servicios de vehículos',
        sort_order: 42
      },
      {
        name: 'Auxilio mecánico',
        description: 'Servicios de auxilio y reparación mecánica',
        icon: '🔧',
        parent_category: 'Servicios de vehículos',
        sort_order: 43
      },
      {
        name: 'Chapista / Pintura de autos',
        description: 'Reparación de chapa y pintura automotriz',
        icon: '🎨',
        parent_category: 'Servicios de vehículos',
        sort_order: 44
      },
      {
        name: 'Chofer particular / Traslados',
        description: 'Servicios de chofer y traslados privados',
        icon: '🚖',
        parent_category: 'Servicios de vehículos',
        sort_order: 45
      },
      {
        name: 'Flete / Mudanzas',
        description: 'Servicios de flete y mudanzas',
        icon: '📦',
        parent_category: 'Servicios de vehículos',
        sort_order: 46
      },
      {
        name: 'Revisión técnica y trámites',
        description: 'Gestión de trámites vehiculares',
        icon: '📋',
        parent_category: 'Servicios de vehículos',
        sort_order: 47
      },

      // Tecnología y electrónica
      {
        name: 'Técnico en computadoras',
        description: 'Reparación y mantenimiento de computadoras',
        icon: '💻',
        parent_category: 'Tecnología y electrónica',
        sort_order: 48
      },
      {
        name: 'Reparación de celulares',
        description: 'Reparación de teléfonos móviles',
        icon: '📱',
        parent_category: 'Tecnología y electrónica',
        sort_order: 49
      },
      {
        name: 'Instalación de redes WiFi',
        description: 'Configuración de redes inalámbricas',
        icon: '📶',
        parent_category: 'Tecnología y electrónica',
        sort_order: 50
      },
      {
        name: 'Reparación de consolas y periféricos',
        description: 'Reparación de consolas de videojuegos',
        icon: '🎮',
        parent_category: 'Tecnología y electrónica',
        sort_order: 51
      },
      {
        name: 'Clases de informática',
        description: 'Enseñanza de computación e informática',
        icon: '🖥️',
        parent_category: 'Tecnología y electrónica',
        sort_order: 52
      },
      {
        name: 'Community manager / manejo de redes',
        description: 'Gestión de redes sociales y marketing digital',
        icon: '📱',
        parent_category: 'Tecnología y electrónica',
        sort_order: 53
      },
      {
        name: 'Soporte técnico remoto',
        description: 'Asistencia técnica a distancia',
        icon: '🖱️',
        parent_category: 'Tecnología y electrónica',
        sort_order: 54
      },
      {
        name: 'Instalación de sistemas de seguridad',
        description: 'Instalación de sistemas de seguridad electrónicos',
        icon: '🔒',
        parent_category: 'Tecnología y electrónica',
        sort_order: 55
      },

      // Educación y formación
      {
        name: 'Clases particulares (nivel primario/secundario)',
        description: 'Apoyo educativo para estudiantes',
        icon: '📚',
        parent_category: 'Educación y formación',
        sort_order: 56
      },
      {
        name: 'Clases de apoyo escolar',
        description: 'Refuerzo académico escolar',
        icon: '✏️',
        parent_category: 'Educación y formación',
        sort_order: 57
      },
      {
        name: 'Clases de idiomas',
        description: 'Enseñanza de idiomas extranjeros',
        icon: '🗣️',
        parent_category: 'Educación y formación',
        sort_order: 58
      },
      {
        name: 'Clases de música (guitarra, piano, etc.)',
        description: 'Enseñanza de instrumentos musicales',
        icon: '🎵',
        parent_category: 'Educación y formación',
        sort_order: 59
      },
      {
        name: 'Preparación para exámenes',
        description: 'Preparación para exámenes y evaluaciones',
        icon: '📝',
        parent_category: 'Educación y formación',
        sort_order: 60
      },
      {
        name: 'Tutorías virtuales',
        description: 'Tutorías online y a distancia',
        icon: '💻',
        parent_category: 'Educación y formación',
        sort_order: 61
      },
      {
        name: 'Clases de programación',
        description: 'Enseñanza de programación y desarrollo',
        icon: '👨‍💻',
        parent_category: 'Educación y formación',
        sort_order: 62
      },

      // Eventos y entretenimiento
      {
        name: 'Sonido e iluminación',
        description: 'Servicios de audio y luces para eventos',
        icon: '🎵',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 63
      },
      {
        name: 'Organización de eventos',
        description: 'Planificación y coordinación de eventos',
        icon: '🎉',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 64
      },
      {
        name: 'Maestro/a de ceremonias',
        description: 'Conducción de eventos y ceremonias',
        icon: '🎤',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 65
      },
      {
        name: 'Animadores infantiles',
        description: 'Entretenimiento para fiestas infantiles',
        icon: '🤡',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 66
      },
      {
        name: 'Fotógrafo/a',
        description: 'Servicios de fotografía profesional',
        icon: '📸',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 67
      },
      {
        name: 'Filmaciones / Videos',
        description: 'Servicios de video y filmación',
        icon: '🎬',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 68
      },
      {
        name: 'Alquiler de mobiliario para eventos',
        description: 'Alquiler de muebles y decoración',
        icon: '🪑',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 69
      },
      {
        name: 'Catering / Barra de tragos',
        description: 'Servicios de comida y bebidas para eventos',
        icon: '🍽️',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 70
      },
      {
        name: 'Shows en vivo (payasos, magos, músicos)',
        description: 'Espectáculos en vivo para eventos',
        icon: '🎭',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 71
      },
      {
        name: 'Decoración de eventos',
        description: 'Decoración temática para eventos',
        icon: '🎈',
        parent_category: 'Eventos y entretenimiento',
        sort_order: 72
      },

      // Costura y manualidades
      {
        name: 'Costurera / Arreglo de ropa',
        description: 'Arreglos y modificaciones de vestimenta',
        icon: '🧵',
        parent_category: 'Costura y manualidades',
        sort_order: 73
      },
      {
        name: 'Diseño de ropa a medida',
        description: 'Confección de ropa personalizada',
        icon: '👗',
        parent_category: 'Costura y manualidades',
        sort_order: 74
      },
      {
        name: 'Tejidos y bordados',
        description: 'Trabajos de tejido y bordado artesanal',
        icon: '🧶',
        parent_category: 'Costura y manualidades',
        sort_order: 75
      },
      {
        name: 'Tapicería',
        description: 'Tapizado y retapizado de muebles',
        icon: '🛋️',
        parent_category: 'Costura y manualidades',
        sort_order: 76
      },
      {
        name: 'Artesanías personalizadas',
        description: 'Creación de artesanías únicas',
        icon: '🎨',
        parent_category: 'Costura y manualidades',
        sort_order: 77
      },
      {
        name: 'Sublimación y estampado',
        description: 'Personalización de objetos y textiles',
        icon: '👕',
        parent_category: 'Costura y manualidades',
        sort_order: 78
      },

      // Logística y trámites
      {
        name: 'Mandados / Cadetería',
        description: 'Servicios de mandados y entregas',
        icon: '🚶‍♂️',
        parent_category: 'Logística y trámites',
        sort_order: 79
      },
      {
        name: 'Trámites en organismos públicos',
        description: 'Gestión de trámites gubernamentales',
        icon: '🏛️',
        parent_category: 'Logística y trámites',
        sort_order: 80
      },
      {
        name: 'Entregas de productos',
        description: 'Servicios de delivery y entrega',
        icon: '📦',
        parent_category: 'Logística y trámites',
        sort_order: 81
      },
      {
        name: 'Cobros / Pagos de servicios',
        description: 'Gestión de cobros y pagos',
        icon: '💳',
        parent_category: 'Logística y trámites',
        sort_order: 82
      },
      {
        name: 'Gestoría automotor',
        description: 'Trámites vehiculares y automotrices',
        icon: '🚗',
        parent_category: 'Logística y trámites',
        sort_order: 83
      },
      {
        name: 'Asistencia bancaria o impositiva',
        description: 'Ayuda con trámites bancarios e impositivos',
        icon: '🏦',
        parent_category: 'Logística y trámites',
        sort_order: 84
      },
      {
        name: 'Acompañamiento en trámites',
        description: 'Acompañamiento personal para trámites',
        icon: '🤝',
        parent_category: 'Logística y trámites',
        sort_order: 85
      },

      // Servicios profesionales
      {
        name: 'Abogado/a',
        description: 'Servicios legales y asesoría jurídica',
        icon: '⚖️',
        parent_category: 'Servicios profesionales',
        sort_order: 86
      },
      {
        name: 'Contador/a',
        description: 'Servicios contables y fiscales',
        icon: '📊',
        parent_category: 'Servicios profesionales',
        sort_order: 87
      },
      {
        name: 'Traductor/a',
        description: 'Servicios de traducción e interpretación',
        icon: '🌐',
        parent_category: 'Servicios profesionales',
        sort_order: 88
      },
      {
        name: 'Diseñador gráfico',
        description: 'Diseño gráfico y visual',
        icon: '🎨',
        parent_category: 'Servicios profesionales',
        sort_order: 89
      },
      {
        name: 'Desarrollador web / apps',
        description: 'Desarrollo de sitios web y aplicaciones',
        icon: '💻',
        parent_category: 'Servicios profesionales',
        sort_order: 90
      },
      {
        name: 'Arquitecto/a',
        description: 'Servicios de arquitectura y diseño',
        icon: '🏗️',
        parent_category: 'Servicios profesionales',
        sort_order: 91
      },
      {
        name: 'Psicólogo/a',
        description: 'Servicios de psicología y terapia',
        icon: '🧠',
        parent_category: 'Servicios profesionales',
        sort_order: 92
      },
      {
        name: 'Coach ontológico / personal',
        description: 'Coaching personal y desarrollo',
        icon: '🎯',
        parent_category: 'Servicios profesionales',
        sort_order: 93
      },
      {
        name: 'Asesor financiero / inversiones',
        description: 'Asesoría financiera e inversiones',
        icon: '💰',
        parent_category: 'Servicios profesionales',
        sort_order: 94
      },
      {
        name: 'Diseñador de interiores',
        description: 'Diseño y decoración de interiores',
        icon: '🏠',
        parent_category: 'Servicios profesionales',
        sort_order: 95
      },

      // Arte y creatividad
      {
        name: 'Artista plástico / muralista',
        description: 'Arte plástico y murales',
        icon: '🎨',
        parent_category: 'Arte y creatividad',
        sort_order: 96
      },
      {
        name: 'Dibujante por encargo',
        description: 'Ilustraciones y dibujos personalizados',
        icon: '✏️',
        parent_category: 'Arte y creatividad',
        sort_order: 97
      },
      {
        name: 'Escenografía y decoración',
        description: 'Diseño de escenografías y decoración',
        icon: '🎭',
        parent_category: 'Arte y creatividad',
        sort_order: 98
      },
      {
        name: 'Edición de video / fotografía',
        description: 'Edición profesional de medios audiovisuales',
        icon: '🎬',
        parent_category: 'Arte y creatividad',
        sort_order: 99
      },
      {
        name: 'Locución / Doblaje',
        description: 'Servicios de voz y locución',
        icon: '🎙️',
        parent_category: 'Arte y creatividad',
        sort_order: 100
      },

      // Otros servicios útiles o curiosos
      {
        name: 'Alquiler de disfraces',
        description: 'Alquiler de vestuario y disfraces',
        icon: '🎭',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 101
      },
      {
        name: 'Personal para eventos (mozos, seguridad)',
        description: 'Personal de servicio para eventos',
        icon: '👨‍💼',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 102
      },
      {
        name: 'Decoración de vidrieras',
        description: 'Diseño y decoración de escaparates',
        icon: '🏪',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 103
      },
      {
        name: 'Cuidado de casas (house sitting)',
        description: 'Cuidado de viviendas durante ausencias',
        icon: '🏠',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 104
      },
      {
        name: 'Ayuda para mudanzas',
        description: 'Asistencia en procesos de mudanza',
        icon: '📦',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 105
      },
      {
        name: 'Acompañante para viajes',
        description: 'Acompañamiento en viajes y excursiones',
        icon: '✈️',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 106
      },
      {
        name: 'Coaching espiritual / energético',
        description: 'Guía espiritual y energética',
        icon: '🧘‍♀️',
        parent_category: 'Otros servicios útiles o curiosos',
        sort_order: 107
      }
    ];

    // Insert categories
    for (const category of categories) {
      await query(`
        INSERT INTO categories (name, description, icon, parent_category, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.description, category.icon, category.parent_category, category.sort_order]);
    }

    console.log(`✅ Successfully inserted ${categories.length} service categories!`);

  } catch (error) {
    console.error('❌ Error inserting service categories:', error);
    throw error;
  }
};

// Update categories table to include parent_category and sort_order
const updateCategoriesTable = async () => {
  try {
    console.log('🔄 Updating categories table structure...');

    // Add parent_category and sort_order columns if they don't exist
    try {
      await query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_category VARCHAR(100)`);
      await query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0`);
      await query(`CREATE INDEX IF NOT EXISTS idx_categories_parent_category ON categories(parent_category)`);
      await query(`CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order)`);
    } catch (err) {
      console.log('Some columns may already exist:', err.message);
    }

    console.log('✅ Categories table structure updated successfully!');

  } catch (error) {
    console.error('❌ Error updating categories table:', error);
    throw error;
  }
};

const runServiceCategoriesMigration = async () => {
  try {
    await updateCategoriesTable();
    await createServiceCategories();
    console.log('🎉 Service categories migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Service categories migration failed:', error);
    process.exit(1);
  }
};

runServiceCategoriesMigration();