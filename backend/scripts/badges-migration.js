const { pool } = require('../src/config/database');

const createBadgesTables = async () => {
  try {
    console.log('🔄 Creating badges system tables...');

    // Badges definitions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        category ENUM('verification', 'experience', 'performance', 'milestone', 'special') NOT NULL,
        criteria JSON NOT NULL COMMENT 'Requirements to earn this badge',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // User badges table (earned badges)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress_data JSON COMMENT 'Additional data about progress towards badge',
        is_visible BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge (user_id, badge_id),
        INDEX idx_user (user_id),
        INDEX idx_badge (badge_id),
        INDEX idx_earned_at (earned_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Badge progress tracking
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS badge_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        current_progress INT DEFAULT 0,
        target_progress INT NOT NULL,
        progress_data JSON COMMENT 'Detailed progress information',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge_progress (user_id, badge_id),
        INDEX idx_user (user_id),
        INDEX idx_badge (badge_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ Badges tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating badges tables:', error);
    throw error;
  }
};

const insertDefaultBadges = async () => {
  try {
    console.log('🔄 Inserting default badges...');

    const badges = [
      // Verification Badges
      {
        name: 'Perfil Verificado',
        slug: 'verified-profile',
        description: 'Ha completado la verificación de identidad con DNI y selfie',
        icon: '✅',
        color: '#10b981',
        category: 'verification',
        criteria: JSON.stringify({
          type: 'verification_status',
          value: 'verified'
        })
      },
      {
        name: 'Perfil Completo',
        slug: 'complete-profile',
        description: 'Ha completado el 100% de su perfil profesional',
        icon: '📋',
        color: '#3b82f6',
        category: 'verification',
        criteria: JSON.stringify({
          type: 'profile_completion',
          value: 100
        })
      },
      {
        name: 'Información Validada',
        slug: 'validated-info',
        description: 'Toda su información profesional ha sido validada',
        icon: '🛡️',
        color: '#8b5cf6',
        category: 'verification',
        criteria: JSON.stringify({
          type: 'all_validated',
          requirements: ['dni_verified', 'professional_info', 'references_verified']
        })
      },

      // Experience Badges
      {
        name: 'Nuevo en Fixia',
        slug: 'newcomer',
        description: 'Se unió a la plataforma recientemente',
        icon: '🌟',
        color: '#06b6d4',
        category: 'experience',
        criteria: JSON.stringify({
          type: 'account_age',
          max_days: 30
        })
      },
      {
        name: '1 Año en Fixia',
        slug: 'one-year',
        description: 'Ha estado en la plataforma por más de 1 año',
        icon: '🎂',
        color: '#f59e0b',
        category: 'experience',
        criteria: JSON.stringify({
          type: 'account_age',
          min_days: 365
        })
      },
      {
        name: 'Veterano',
        slug: 'veteran',
        description: 'Miembro por más de 2 años con actividad constante',
        icon: '🏆',
        color: '#dc2626',
        category: 'experience',
        criteria: JSON.stringify({
          type: 'veteran_status',
          min_days: 730,
          min_completed_bookings: 50
        })
      },

      // Performance Badges
      {
        name: 'Excelencia',
        slug: 'excellence',
        description: 'Mantiene una calificación promedio de 4.8 o superior',
        icon: '⭐',
        color: '#fbbf24',
        category: 'performance',
        criteria: JSON.stringify({
          type: 'average_rating',
          min_rating: 4.8,
          min_reviews: 10
        })
      },
      {
        name: 'Reviews Perfectas',
        slug: 'perfect-reviews',
        description: 'Últimas 10 reseñas son de 5 estrellas',
        icon: '🌟',
        color: '#fbbf24',
        category: 'performance',
        criteria: JSON.stringify({
          type: 'recent_perfect_reviews',
          count: 10
        })
      },
      {
        name: 'Súper Responsable',
        slug: 'super-reliable',
        description: '98% de tasa de cumplimiento en reservas',
        icon: '🤝',
        color: '#10b981',
        category: 'performance',
        criteria: JSON.stringify({
          type: 'completion_rate',
          min_rate: 0.98,
          min_bookings: 20
        })
      },
      {
        name: 'Respuesta Rápida',
        slug: 'quick-response',
        description: 'Responde mensajes en menos de 1 hora promedio',
        icon: '⚡',
        color: '#06b6d4',
        category: 'performance',
        criteria: JSON.stringify({
          type: 'response_time',
          max_hours: 1
        })
      },

      // Milestone Badges
      {
        name: 'Primera Reserva',
        slug: 'first-booking',
        description: 'Completó su primera reserva exitosamente',
        icon: '🎯',
        color: '#84cc16',
        category: 'milestone',
        criteria: JSON.stringify({
          type: 'completed_bookings',
          value: 1
        })
      },
      {
        name: '10 Servicios',
        slug: 'ten-services',
        description: 'Ha completado 10 servicios exitosamente',
        icon: '🔟',
        color: '#3b82f6',
        category: 'milestone',
        criteria: JSON.stringify({
          type: 'completed_bookings',
          value: 10
        })
      },
      {
        name: '50 Servicios',
        slug: 'fifty-services',
        description: 'Ha completado 50 servicios exitosamente',
        icon: '🚀',
        color: '#8b5cf6',
        category: 'milestone',
        criteria: JSON.stringify({
          type: 'completed_bookings',
          value: 50
        })
      },
      {
        name: 'Centurión',
        slug: 'centurion',
        description: 'Ha completado 100 servicios exitosamente',
        icon: '👑',
        color: '#fbbf24',
        category: 'milestone',
        criteria: JSON.stringify({
          type: 'completed_bookings',
          value: 100
        })
      },

      // Special Badges
      {
        name: 'Miembro Premium',
        slug: 'premium-member',
        description: 'Suscriptor activo del plan Premium',
        icon: '💎',
        color: '#7c3aed',
        category: 'special',
        criteria: JSON.stringify({
          type: 'subscription_type',
          value: 'premium'
        })
      },
      {
        name: 'Top Rated',
        slug: 'top-rated',
        description: 'Entre los 10% mejores calificados de su categoría',
        icon: '🏅',
        color: '#fbbf24',
        category: 'special',
        criteria: JSON.stringify({
          type: 'top_percentage',
          percentage: 10
        })
      },
      {
        name: 'Calidad de Trabajo',
        slug: 'quality-work',
        description: 'Reconocido por la excepcional calidad de su trabajo',
        icon: '💯',
        color: '#10b981',
        category: 'special',
        criteria: JSON.stringify({
          type: 'quality_metrics',
          min_rating: 4.7,
          min_reviews: 25,
          quality_score: 85
        })
      }
    ];

    for (let i = 0; i < badges.length; i++) {
      const badge = badges[i];
      await pool.execute(
        `INSERT IGNORE INTO badges (name, slug, description, icon, color, category, criteria, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [badge.name, badge.slug, badge.description, badge.icon, badge.color, badge.category, badge.criteria, i]
      );
    }

    console.log('✅ Default badges inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting default badges:', error);
    throw error;
  }
};

const runBadgesMigration = async () => {
  try {
    await createBadgesTables();
    await insertDefaultBadges();
    console.log('🎉 Badges system migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Badges migration failed:', error);
    process.exit(1);
  }
};

runBadgesMigration();