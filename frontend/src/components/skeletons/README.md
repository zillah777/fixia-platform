# Fixia Skeleton Loading Components

Enterprise-grade skeleton loading components designed specifically for the Fixia marketplace platform. Built with the Liquid Glass "Confianza Líquida" design system, these components provide exceptional user experience through realistic loading states that match actual content structure.

## 🌟 Features

### **Liquid Glass Design Integration**
- **Glass Morphism Effects**: Seamless integration with Fixia's glass design system
- **Brand Consistency**: Colors and animations that match the platform's visual identity
- **iOS-Inspired Aesthetics**: Premium liquid gradients and smooth transitions

### **Performance Optimization**
- **Mobile-First**: Optimized for iOS and Android performance
- **Battery Efficiency**: Reduced animations on low-end devices
- **Hardware Acceleration**: GPU-optimized rendering
- **Smart Fallbacks**: Graceful degradation for unsupported browsers

### **Accessibility Excellence**
- **Screen Reader Support**: Comprehensive ARIA labels and announcements
- **Reduced Motion**: Respects user motion preferences
- **High Contrast**: Supports high contrast mode
- **Keyboard Navigation**: Full keyboard accessibility

### **Adaptive Loading**
- **Content-Aware**: Different patterns for different content types
- **Progressive Disclosure**: Staggered loading animations
- **Loading Timeouts**: Prevents infinite loading states
- **Real-time Optimization**: Adapts to device capabilities

## 📦 Components Overview

### **Base Components**
```tsx
import { Skeleton, TextSkeleton, CircleSkeleton, CardSkeleton } from '@/components/ui/skeleton';
```

### **Platform-Specific Components**
```tsx
import {
  FixiaServiceCardSkeleton,    // Service listings and marketplace
  FixiaDashboardSkeleton,      // Dashboard statistics
  FixiaProfileSkeleton,        // User profiles (AS & Exploradores)
  FixiaChatSkeleton,          // Chat and messaging
  FixiaSearchSkeleton,        // Search results and filters
  FixiaFormSkeleton           // Forms and booking flows
} from '@/components/skeletons';
```

## 🚀 Quick Start

### **1. Basic Usage**

```tsx
import { FixiaServiceCardSkeleton } from '@/components/skeletons';

function ServicePage() {
  const { data, isLoading } = useQuery('services', fetchServices);
  
  if (isLoading) {
    return <FixiaServiceCardSkeleton count={6} variant="grid" />;
  }
  
  return <ServiceGrid services={data} />;
}
```

### **2. With Context Provider**

```tsx
import { SkeletonProvider } from '@/components/skeletons';

function App() {
  return (
    <SkeletonProvider initialPreferences={{ defaultAnimation: 'shimmer' }}>
      <YourAppComponents />
    </SkeletonProvider>
  );
}
```

### **3. Advanced Usage with Hooks**

```tsx
import { useSkeletonLoading, useSkeleton } from '@/components/skeletons';

function SmartComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { showSkeleton, hasTimedOut, skeletonProps } = useSkeletonLoading(loading, {
    timeout: 8000,
    onTimeout: () => console.log('Loading timed out')
  });
  
  if (showSkeleton) {
    return <FixiaDashboardSkeleton {...skeletonProps} />;
  }
  
  if (hasTimedOut) {
    return <ErrorMessage />;
  }
  
  return <YourContent data={data} />;
}
```

## 🎨 Design Variants

### **Glass Effect Intensities**
```tsx
// Light glass effect (default)
<FixiaServiceCardSkeleton variant="light" />

// Medium glass effect
<FixiaServiceCardSkeleton variant="medium" />

// Strong glass effect
<FixiaServiceCardSkeleton variant="strong" />
```

### **Animation Types**
```tsx
// Shimmer animation (default)
<FixiaProfileSkeleton animation="shimmer" />

// Pulse animation
<FixiaProfileSkeleton animation="pulse" />

// Wave animation
<FixiaProfileSkeleton animation="wave" />

// No animation (accessibility/performance)
<FixiaProfileSkeleton animation="none" />
```

## 📱 Responsive Design

### **Automatic Responsive Behavior**
All skeleton components automatically adapt to screen sizes:

```tsx
<FixiaServiceCardSkeleton 
  count={6}        // Desktop: 6 cards
  variant="grid"   // Mobile: Automatically becomes single column
/>
```

### **Manual Responsive Control**
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

<FixiaServiceCardSkeleton 
  count={isMobile ? 3 : 6}
  variant={isMobile ? 'compact' : 'grid'}
/>
```

## 🔧 Platform-Specific Examples

### **1. Marketplace Service Browsing**
```tsx
// Service cards with filters
function MarketplacePage() {
  const { data, isLoading } = useServicesQuery();
  
  return (
    <div className="flex gap-6">
      {/* Filters sidebar */}
      <aside className="w-80">
        {isLoading ? (
          <FixiaSearchSkeleton layout="filters-only" />
        ) : (
          <ServiceFilters />
        )}
      </aside>
      
      {/* Service grid */}
      <main className="flex-1">
        {isLoading ? (
          <FixiaServiceCardSkeleton 
            count={9} 
            variant="grid" 
            showPrice={true}
            showRating={true}
          />
        ) : (
          <ServiceGrid services={data} />
        )}
      </main>
    </div>
  );
}
```

### **2. AS Professional Dashboard**
```tsx
function ASDashboard() {
  const { stats, isLoading } = useASDashboardData();
  
  if (isLoading) {
    return (
      <FixiaDashboardSkeleton 
        cardCount={6}
        showHeader={true}
        animation="shimmer"
      />
    );
  }
  
  return <FixiaSummaryCards stats={stats} />;
}
```

### **3. Explorer Profile Viewing**
```tsx
function ExplorerProfile({ userId }: { userId: string }) {
  const { profile, isLoading } = useProfileQuery(userId);
  
  if (isLoading) {
    return (
      <FixiaProfileSkeleton 
        layout="full"
        profileType="explorer"
        showPortfolio={false}
        showReviews={true}
      />
    );
  }
  
  return <ProfileDetails profile={profile} />;
}
```

### **4. Real-time Chat Interface**
```tsx
function ChatInterface() {
  const { conversations, isLoading } = useConversationsQuery();
  const [selectedChat, setSelectedChat] = useState(null);
  
  return (
    <div className="flex h-screen">
      {/* Chat list */}
      <aside className="w-80 border-r border-white/10">
        {isLoading ? (
          <FixiaChatSkeleton layout="list" count={8} />
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </aside>
      
      {/* Active conversation */}
      <main className="flex-1">
        {selectedChat ? (
          <ChatConversation chatId={selectedChat} />
        ) : (
          <FixiaChatSkeleton layout="conversation" showTyping={false} />
        )}
      </main>
    </div>
  );
}
```

### **5. Service Booking Form**
```tsx
function ServiceBookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const { isSubmitting } = useBookingMutation();
  
  if (isSubmitting) {
    return (
      <FixiaFormSkeleton 
        formType="booking"
        showProgress={true}
        steps={3}
        currentStep={currentStep}
        showHeader={true}
      />
    );
  }
  
  return <BookingForm step={currentStep} onNext={setCurrentStep} />;
}
```

## ⚡ Performance Optimization

### **Automatic Performance Detection**
```tsx
// The skeleton system automatically detects:
// - Device performance capabilities
// - Network connection speed
// - Battery level (where available)
// - User motion preferences

function SmartSkeletonExample() {
  const { getOptimizedProps, isLowPerformance } = useSkeleton();
  
  return (
    <FixiaServiceCardSkeleton 
      {...getOptimizedProps()}
      count={isLowPerformance ? 3 : 6}
    />
  );
}
```

### **Manual Performance Tuning**
```tsx
import { PerformancePresets } from '@/components/skeletons';

// High-performance devices
<SkeletonProvider initialPreferences={PerformancePresets.highPerformance}>

// Low-end devices
<SkeletonProvider initialPreferences={PerformancePresets.lowPerformance}>

// Accessibility-focused
<SkeletonProvider initialPreferences={PerformancePresets.accessibility}>
```

## ♿ Accessibility Features

### **Screen Reader Support**
All skeleton components include appropriate ARIA labels:
```tsx
<FixiaServiceCardSkeleton 
  count={3}
  // Automatically announces: "Cargando 3 servicios"
/>
```

### **Custom Accessibility Labels**
```tsx
<Skeleton 
  loadingText="Cargando información del profesional"
  aria-live="polite"
  role="status"
/>
```

### **Reduced Motion Support**
```tsx
// Automatically respects user preferences
const { prefersReducedMotion } = useSkeleton();

<FixiaProfileSkeleton 
  animation={prefersReducedMotion ? 'none' : 'shimmer'}
/>
```

## 🔌 Integration with React Query

### **Query Loading States**
```tsx
import { useQuery } from '@tanstack/react-query';

function ServicesPage() {
  const { 
    data: services, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return <FixiaServiceCardSkeleton count={6} variant="grid" />;
  }
  
  if (isError) {
    return <ErrorMessage error={error} />;
  }
  
  return <ServiceGrid services={services} />;
}
```

### **Infinite Query Support**
```tsx
function InfiniteServiceList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['services'],
    queryFn: fetchServicesPage,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div>
      {data?.pages.map((page, i) => (
        <ServiceGrid key={i} services={page.services} />
      ))}
      
      {isFetchingNextPage && (
        <FixiaServiceCardSkeleton count={3} variant="list" />
      )}
      
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()}>
          Cargar más servicios
        </Button>
      )}
    </div>
  );
}
```

## 🎯 Best Practices

### **1. Skeleton-to-Content Matching**
Ensure skeletons closely match the actual content layout:
```tsx
// Good: Matches the actual service card structure
<FixiaServiceCardSkeleton 
  showPrice={true}
  showRating={true}
  showAvailability={true}
/>

// Avoid: Generic skeleton that doesn't match content
<CardSkeleton />
```

### **2. Performance Considerations**
```tsx
// Good: Reasonable skeleton count
<FixiaServiceCardSkeleton count={6} />

// Avoid: Too many skeletons affecting performance
<FixiaServiceCardSkeleton count={50} />
```

### **3. Timeout Handling**
```tsx
// Good: Handle loading timeouts
const { showSkeleton, hasTimedOut } = useSkeletonLoading(isLoading, {
  timeout: 10000,
  onTimeout: () => showErrorMessage()
});

if (hasTimedOut) return <TimeoutError />;
if (showSkeleton) return <FixiaProfileSkeleton />;
```

### **4. Accessibility**
```tsx
// Good: Descriptive loading text
<FixiaFormSkeleton 
  formType="booking"
  loadingText="Cargando formulario de reserva de servicio"
/>

// Good: Respect user preferences
const { respectReducedMotion } = useSkeleton();
```

## 🔬 Testing

### **Unit Testing**
```tsx
import { render, screen } from '@testing-library/react';
import { FixiaServiceCardSkeleton } from '@/components/skeletons';

test('renders service card skeletons with accessibility labels', () => {
  render(<FixiaServiceCardSkeleton count={3} />);
  
  expect(screen.getByLabelText(/cargando 3 servicios/i)).toBeInTheDocument();
});

test('respects reduced motion preferences', () => {
  // Mock prefers-reduced-motion
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn(() => ({ matches: true }))
  });
  
  render(<FixiaServiceCardSkeleton animation="shimmer" />);
  
  // Should render without animations
  expect(screen.getByRole('status')).toHaveAttribute('data-no-animation', 'true');
});
```

### **Integration Testing**
```tsx
import { renderWithProviders } from '@/test-utils';

test('integrates with React Query loading states', async () => {
  const { result } = renderWithProviders(() => 
    useQuery('services', fetchServices)
  );
  
  // Should show skeleton while loading
  expect(screen.getByLabelText(/cargando servicios/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.queryByLabelText(/cargando servicios/i)).not.toBeInTheDocument();
  });
});
```

## 📊 Performance Metrics

The skeleton system is optimized for:
- **First Paint**: < 16ms for skeleton rendering
- **Animation Performance**: 60fps on modern devices, graceful degradation
- **Memory Usage**: Minimal DOM footprint
- **Bundle Size**: Tree-shakeable components
- **Battery Impact**: Reduced animations on low battery

## 🛠️ Development

### **Adding New Skeleton Components**
1. Create component in `/components/skeletons/`
2. Follow naming convention: `Fixia[ComponentName]Skeleton`
3. Include TypeScript interfaces
4. Add to index exports
5. Write tests and documentation

### **Contributing**
- Follow existing code patterns
- Include accessibility features
- Test on mobile devices
- Document new props and behaviors
- Consider performance impact

## 📈 Roadmap

- [ ] React Native skeleton components
- [ ] More animation variants
- [ ] Advanced performance monitoring
- [ ] Integration with Framer Motion layout animations
- [ ] Custom skeleton builder tool

---

*Built with ❤️ for the Fixia marketplace platform. Optimized for the Argentine market with focus on performance, accessibility, and user experience.*