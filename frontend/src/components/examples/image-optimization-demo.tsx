'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FixiaImage, 
  FixiaAvatar, 
  FixiaServiceImage, 
  FixiaCategoryIcon, 
  FixiaOptimizedLogo 
} from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Star, Image } from 'lucide-react';

/**
 * Image Optimization Demo Component
 * 
 * Demonstrates the comprehensive Next.js Image optimization system
 * implemented for the Fixia marketplace platform.
 * 
 * Features showcased:
 * - Mobile-first responsive images
 * - Liquid Glass design integration
 * - Loading states and error handling
 * - Performance optimizations for Argentine market
 */
export const ImageOptimizationDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Fixia Image Optimization Demo
          </h1>
          <p className="text-blue-200 text-lg">
            Comprehensive Next.js Image optimization for Argentine marketplace
          </p>
        </motion.div>

        {/* Logo Variants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Image className="mr-2 h-5 w-5" aria-label="Logo optimization icon" />
                Logo Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
                <div className="text-center">
                  <FixiaOptimizedLogo variant="primary" size="md" />
                  <p className="text-sm text-white/70 mt-2">Primary</p>
                </div>
                <div className="text-center">
                  <FixiaOptimizedLogo variant="white" size="md" />
                  <p className="text-sm text-white/70 mt-2">White</p>
                </div>
                <div className="text-center">
                  <FixiaOptimizedLogo variant="gradient" size="md" />
                  <p className="text-sm text-white/70 mt-2">Gradient</p>
                </div>
                <div className="text-center">
                  <FixiaOptimizedLogo variant="icon" size="md" />
                  <p className="text-sm text-white/70 mt-2">Icon</p>
                </div>
                <div className="text-center">
                  <FixiaOptimizedLogo variant="text" size="md" />
                  <p className="text-sm text-white/70 mt-2">Text</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Avatar Variants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Avatar Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                <div className="text-center">
                  <FixiaAvatar
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
                    alt="Professional Avatar"
                    fallbackText="Juan Pérez"
                    size="xl"
                    variant="professional"
                    priority={true}
                  />
                  <p className="text-sm text-white/70 mt-2">Professional</p>
                </div>
                <div className="text-center">
                  <FixiaAvatar
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face"
                    alt="Client Avatar"
                    fallbackText="María García"
                    size="xl"
                    variant="client"
                    showOnlineIndicator={true}
                    isOnline={true}
                  />
                  <p className="text-sm text-white/70 mt-2">Client (Online)</p>
                </div>
                <div className="text-center">
                  <FixiaAvatar
                    fallbackText="Carlos Rodríguez"
                    size="xl"
                    variant="glass"
                  />
                  <p className="text-sm text-white/70 mt-2">Fallback</p>
                </div>
                <div className="text-center">
                  <FixiaAvatar
                    src="/nonexistent-image.jpg"
                    alt="Error Test"
                    fallbackText="Error Test"
                    size="xl"
                    variant="default"
                  />
                  <p className="text-sm text-white/70 mt-2">Error Handling</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Category Icon Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
                {[
                  'plomeria',
                  'electricidad',
                  'construccion',
                  'pintura',
                  'mecanica',
                  'tecnologia',
                  'seguridad',
                  'mantenimiento'
                ].map((category) => (
                  <FixiaCategoryIcon
                    key={category}
                    category={category}
                    size="lg"
                    variant="hybrid"
                    showLabel={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Service Image Variants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Service Image Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card Variant */}
                <div>
                  <h4 className="text-white font-medium mb-3">Card Variant</h4>
                  <FixiaServiceImage
                    src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&h=600&fit=crop"
                    alt="Plumbing Service"
                    variant="card"
                    isFeatured={true}
                    isFavorite={false}
                    rating={4.8}
                    portfolioCount={12}
                    isAvailable={true}
                    availabilityText="Disponible"
                    onFavoriteClick={() => console.log('Favorite clicked')}
                    onBookmarkClick={() => console.log('Bookmark clicked')}
                  />
                  <div className="mt-3 p-3 glass-light rounded-lg">
                    <h5 className="text-white font-medium">Plomería Profesional</h5>
                    <p className="text-blue-200 text-sm">Juan Pérez - Rawson</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-green-400 font-medium">$2,500/hora</span>
                      <Badge className="bg-blue-500/20 text-blue-400">Verificado</Badge>
                    </div>
                  </div>
                </div>

                {/* Gallery Variant */}
                <div>
                  <h4 className="text-white font-medium mb-3">Gallery Variant</h4>
                  <FixiaServiceImage
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=600&fit=crop"
                    alt="Electrical Work"
                    variant="gallery"
                    isFeatured={false}
                    rating={4.5}
                    onViewClick={() => console.log('View clicked')}
                  />
                </div>

                {/* Portfolio Variant */}
                <div>
                  <h4 className="text-white font-medium mb-3">Portfolio Variant</h4>
                  <FixiaServiceImage
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=600&fit=crop"
                    alt="Construction Project"
                    variant="portfolio"
                    isFeatured={true}
                    onViewClick={() => console.log('Portfolio view clicked')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Core Image Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Core Image Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Different Aspect Ratios */}
                <div>
                  <h5 className="text-white text-sm mb-2">Square</h5>
                  <FixiaImage
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"
                    alt="Square Image"
                    aspectRatio="square"
                    quality={85}
                    priority={false}
                  />
                </div>

                <div>
                  <h5 className="text-white text-sm mb-2">Portrait</h5>
                  <FixiaImage
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=533&fit=crop"
                    alt="Portrait Image"
                    aspectRatio="portrait"
                    quality={85}
                  />
                </div>

                <div>
                  <h5 className="text-white text-sm mb-2">Landscape</h5>
                  <FixiaImage
                    src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=533&h=400&fit=crop"
                    alt="Landscape Image"
                    aspectRatio="landscape"
                    quality={85}
                  />
                </div>

                <div>
                  <h5 className="text-white text-sm mb-2">Video</h5>
                  <FixiaImage
                    src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=640&h=360&fit=crop"
                    alt="Video Aspect"
                    aspectRatio="video"
                    quality={85}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Optimization Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">50-70%</div>
                  <p className="text-white/70">File Size Reduction</p>
                  <p className="text-sm text-blue-200 mt-1">Through WebP/AVIF formats</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">2-3x</div>
                  <p className="text-white/70">Faster Loading</p>
                  <p className="text-sm text-blue-200 mt-1">On mobile connections</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                  <p className="text-white/70">Liquid Glass Integration</p>
                  <p className="text-sm text-blue-200 mt-1">Premium user experience</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pb-12"
        >
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-400 font-medium mb-3">Features</h4>
                  <ul className="space-y-2 text-white/80">
                    <li>• Next.js Image optimization with automatic format detection</li>
                    <li>• Mobile-first responsive sizing for Argentine market</li>
                    <li>• Liquid Glass design system integration</li>
                    <li>• Smart loading states with skeleton placeholders</li>
                    <li>• Comprehensive error handling and fallbacks</li>
                    <li>• Accessibility compliance (WCAG 2.1)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-purple-400 font-medium mb-3">Performance</h4>
                  <ul className="space-y-2 text-white/80">
                    <li>• WebP/AVIF format support with fallbacks</li>
                    <li>• Intelligent caching (1 hour minimum TTL)</li>
                    <li>• Lazy loading for below-the-fold content</li>
                    <li>• Priority loading for above-the-fold images</li>
                    <li>• Optimized for slower internet connections</li>
                    <li>• Bundle size impact minimization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
};

export default ImageOptimizationDemo;