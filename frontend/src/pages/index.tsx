import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const serviceCategoriesData = [
  { id: 'plomeria', name: 'Plomería' },
  { id: 'electricidad', name: 'Electricidad' },
  { id: 'carpinteria', name: 'Carpintería' },
  { id: 'albañileria', name: 'Albañilería' },
  { id: 'pintura', name: 'Pintura' },
  { id: 'jardineria', name: 'Jardinería' },
  { id: 'limpieza', name: 'Limpieza' },
  { id: 'electrodomesticos', name: 'Electrodomésticos' },
];

const featuredProfessionals = [
  {
    id: 1,
    name: 'Carlos Rodríguez',
    specialty: 'Plomería',
    rating: 4.9,
    reviews: 127,
    location: 'Comodoro Rivadavia',
    verified: true,
  },
  {
    id: 2,
    name: 'María González',
    specialty: 'Electricidad',
    rating: 4.8,
    reviews: 89,
    location: 'Puerto Madryn',
    verified: true,
  },
  {
    id: 3,
    name: 'Luis Fernández',
    specialty: 'Carpintería',
    rating: 4.9,
    reviews: 156,
    location: 'Trelew',
    verified: true,
  },
];

const testimonials = [
  {
    id: 1,
    name: 'Ana Martínez',
    text: 'Excelente servicio, muy profesional y rápido.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Roberto Silva',
    text: 'Encontré al profesional perfecto para mi proyecto.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Carmen López',
    text: 'Plataforma confiable y fácil de usar.',
    rating: 5,
  },
];

const HomePage: NextPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    
    router.push(`/explorador/buscar-servicio?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/explorador/buscar-servicio?category=${categoryId}`);
  };

  return (
    <>
      <Head>
        <title>Fixia - Conectamos profesionales con clientes en Chubut</title>
        <meta name="description" content="Plataforma líder en Chubut para conectar profesionales de servicios con clientes. Encuentra plomeros, electricistas, carpinteros y más." />
      </Head>

      <div>
        {/* Navigation */}
        <nav>
          <div>
            <div>
              <div>
                <h1>Fixia</h1>
              </div>

              <div>
                <Link href="/auth/login">Iniciar Sesión</Link>
                <Link href="/auth/registro">Registrarse</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section>
          <div>
            <div>
              <h1>Conectamos profesionales con clientes en Chubut</h1>
              <p>
                Encuentra los mejores profesionales para tus proyectos o ofrece tus servicios.
                Plataforma confiable y segura para toda la provincia.
              </p>

              <form onSubmit={handleSearch}>
                <div>
                  <input
                    type="text"
                    placeholder="¿Qué servicio necesitas?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Todas las categorías</option>
                    {serviceCategoriesData.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button type="submit">
                    Buscar
                  </button>
                </div>
              </form>

              <div>
                <Link href="/auth/registro?type=customer">
                  <button>
                    Soy Cliente
                  </button>
                </Link>
                <Link href="/auth/registro?type=provider">
                  <button>
                    Soy Profesional
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section>
          <div>
            <h2>¿Por qué elegir Fixia?</h2>
            <div>
              <div>
                <h3>Profesionales Verificados</h3>
                <p>Todos nuestros profesionales pasan por un proceso de verificación</p>
              </div>
              <div>
                <h3>Pagos Seguros</h3>
                <p>Procesamos los pagos de forma segura a través de MercadoPago</p>
              </div>
              <div>
                <h3>Atención 24/7</h3>
                <p>Nuestro equipo está disponible para ayudarte cuando lo necesites</p>
              </div>
              <div>
                <h3>Garantía de Calidad</h3>
                <p>Garantizamos la calidad del trabajo de nuestros profesionales</p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Categories */}
        <section>
          <div>
            <h2>Explora nuestros servicios</h2>
            <div>
              {serviceCategoriesData.map(category => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <h3>{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div>
            <h2>¿Cómo funciona?</h2>
            <div>
              <div>
                <div>1</div>
                <h3>Describe tu proyecto</h3>
                <p>Cuéntanos qué necesitas y te ayudaremos a encontrar el profesional adecuado</p>
              </div>
              <div>
                <div>2</div>
                <h3>Recibe propuestas</h3>
                <p>Los profesionales interesados te enviarán sus propuestas</p>
              </div>
              <div>
                <div>3</div>
                <h3>Elige y contrata</h3>
                <p>Compara propuestas, elige la mejor y contrata al profesional</p>
              </div>
              <div>
                <div>4</div>
                <h3>Califica el servicio</h3>
                <p>Una vez completado el trabajo, califica al profesional</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Professionals */}
        <section>
          <div>
            <h2>Profesionales destacados</h2>
            <div>
              {featuredProfessionals.map(professional => (
                <div key={professional.id}>
                  <div>
                    <h3>{professional.name}</h3>
                    <p>{professional.specialty}</p>
                    <div>
                      <span>★ {professional.rating}</span>
                      <span>({professional.reviews} reseñas)</span>
                    </div>
                    <p>{professional.location}</p>
                    {professional.verified && <span>Verificado</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div>
            <h2>Lo que dicen nuestros clientes</h2>
            <div>
              {testimonials.map(testimonial => (
                <div key={testimonial.id}>
                  <div>
                    <div>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p>"{testimonial.text}"</p>
                    <p>- {testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <div>
            <h2>Números que nos respaldan</h2>
            <div>
              <div>
                <div>1,500+</div>
                <div>Profesionales registrados</div>
              </div>
              <div>
                <div>5,000+</div>
                <div>Proyectos completados</div>
              </div>
              <div>
                <div>4.8</div>
                <div>Calificación promedio</div>
              </div>
              <div>
                <div>98%</div>
                <div>Clientes satisfechos</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div>
            <h2>¿Listo para comenzar?</h2>
            <p>Únete a miles de clientes y profesionales que confían en Fixia</p>
            <div>
              <Link href="/auth/registro?type=customer">
                <button>Buscar Profesionales</button>
              </Link>
              <Link href="/auth/registro?type=provider">
                <button>Ofrecer Servicios</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div>
            <div>
              <div>
                <h3>Fixia</h3>
                <p>Conectamos profesionales con clientes en toda la provincia de Chubut.</p>
              </div>
              <div>
                <h4>Servicios</h4>
                <ul>
                  <li><Link href="/explorador/buscar-servicio?category=plomeria">Plomería</Link></li>
                  <li><Link href="/explorador/buscar-servicio?category=electricidad">Electricidad</Link></li>
                  <li><Link href="/explorador/buscar-servicio?category=carpinteria">Carpintería</Link></li>
                </ul>
              </div>
              <div>
                <h4>Empresa</h4>
                <ul>
                  <li><Link href="/company/about">Acerca de</Link></li>
                  <li><Link href="/company/contact">Contacto</Link></li>
                  <li><Link href="/company/security">Seguridad</Link></li>
                </ul>
              </div>
              <div>
                <h4>Legal</h4>
                <ul>
                  <li><Link href="/legal/terms">Términos</Link></li>
                  <li><Link href="/legal/privacy">Privacidad</Link></li>
                </ul>
              </div>
            </div>
            <div>
              <p>&copy; 2024 Fixia. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;