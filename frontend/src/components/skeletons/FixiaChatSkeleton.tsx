import React from 'react';
import { motion } from 'framer-motion';
import { CardSkeleton, TextSkeleton, CircleSkeleton, Skeleton } from '../ui/skeleton';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { cn } from '@/lib/utils';

/**
 * Chat Skeleton Components
 * 
 * Comprehensive chat loading states including:
 * - Chat list with conversations
 * - Individual chat messages
 * - Chat header and input areas
 * - Real-time typing indicators
 * - Mobile-optimized layouts
 */

interface FixiaChatSkeletonProps {
  /** Chat layout type */
  layout?: 'list' | 'conversation' | 'fullscreen';
  /** Glass effect intensity */
  variant?: 'light' | 'medium' | 'strong';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
  /** Number of chat items/messages */
  count?: number;
  /** Show typing indicator */
  showTyping?: boolean;
}

const FixiaChatSkeleton: React.FC<FixiaChatSkeletonProps> = ({
  layout = 'list',
  variant = 'light',
  animation = 'shimmer',
  className,
  count = 5,
  showTyping = false
}) => {
  const { glassClasses } = useOptimizedGlass(variant);

  // Chat List Layout - Shows conversation previews
  const ChatListSkeleton: React.FC = () => (
    <div className={cn('space-y-3', className)} role="status" aria-label="Cargando lista de conversaciones">
      {Array.from({ length: count }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={cn(
            'flex items-center space-x-3 p-4 rounded-lg border border-white/10',
            'hover:border-white/20 transition-all duration-300 cursor-pointer',
            glassClasses
          )}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <CircleSkeleton size="md" animation={animation} />
            {/* Online status indicator */}
            {index < 2 && (
              <Skeleton
                width="12px"
                height="12px"
                radius="full"
                className="absolute -bottom-1 -right-1"
                animation={animation}
              />
            )}
          </div>

          {/* Chat content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between">
              <TextSkeleton
                width="40%"
                lineHeight="md"
                animation={animation}
                loadingText={`Cargando nombre del contacto ${index + 1}`}
              />
              <TextSkeleton
                width="50px"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando hora"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <TextSkeleton
                width="70%"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando último mensaje"
              />
              {/* Unread badge */}
              {index < 3 && (
                <Skeleton
                  width="20px"
                  height="20px"
                  radius="full"
                  animation={animation}
                  loadingText="Cargando contador de mensajes"
                />
              )}
            </div>

            {/* Message status indicators */}
            <div className="flex items-center space-x-2">
              <Skeleton
                width="12px"
                height="12px"
                radius="sm"
                animation={animation}
                loadingText="Cargando estado del mensaje"
              />
              <TextSkeleton
                width="30%"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando información adicional"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Conversation Layout - Shows individual messages
  const ConversationSkeleton: React.FC = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center space-x-3 p-4 border-b border-white/10',
          glassClasses
        )}
        role="status"
        aria-label="Cargando cabecera del chat"
      >
        <CircleSkeleton size="md" animation={animation} />
        <div className="flex-1 space-y-1">
          <TextSkeleton
            width="60%"
            lineHeight="md"
            animation={animation}
            loadingText="Cargando nombre del contacto"
          />
          <TextSkeleton
            width="40%"
            lineHeight="sm"
            animation={animation}
            loadingText="Cargando estado en línea"
          />
        </div>
        <div className="flex space-x-2">
          <Skeleton
            width="32px"
            height="32px"
            radius="full"
            animation={animation}
            loadingText="Cargando botón de llamada"
          />
          <Skeleton
            width="32px"
            height="32px"
            radius="full"
            animation={animation}
            loadingText="Cargando botón de opciones"
          />
        </div>
      </motion.div>

      {/* Messages area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {Array.from({ length: count }, (_, index) => {
          const isOwnMessage = index % 3 !== 0; // Simulate own vs received messages
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'flex items-end space-x-2',
                isOwnMessage ? 'justify-end' : 'justify-start'
              )}
            >
              {/* Avatar for received messages */}
              {!isOwnMessage && (
                <CircleSkeleton size="sm" animation={animation} />
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                  isOwnMessage 
                    ? 'bg-primary/20 border border-primary/30' 
                    : `${glassClasses} border border-white/10`
                )}
              >
                <TextSkeleton
                  lines={index % 4 === 0 ? 2 : 1}
                  lineHeight="sm"
                  lastLineWidth="60%"
                  animation={animation}
                  loadingText={`Cargando mensaje ${index + 1}`}
                />
                
                {/* Message metadata */}
                <div className="flex items-center justify-between mt-1">
                  <TextSkeleton
                    width="40px"
                    lineHeight="sm"
                    animation={animation}
                    loadingText="Cargando hora del mensaje"
                  />
                  {isOwnMessage && (
                    <Skeleton
                      width="12px"
                      height="12px"
                      radius="sm"
                      animation={animation}
                      loadingText="Cargando estado de lectura"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {showTyping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-end space-x-2"
          >
            <CircleSkeleton size="sm" animation={animation} />
            <div className={cn(
              'px-4 py-2 rounded-lg max-w-xs',
              glassClasses,
              'border border-white/10'
            )}>
              <div className="flex space-x-1">
                <Skeleton
                  width="8px"
                  height="8px"
                  radius="full"
                  animation="pulse"
                />
                <Skeleton
                  width="8px"
                  height="8px"
                  radius="full"
                  animation="pulse"
                  className="animation-delay-100"
                />
                <Skeleton
                  width="8px"
                  height="8px"
                  radius="full"
                  animation="pulse"
                  className="animation-delay-200"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Message input area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={cn(
          'p-4 border-t border-white/10',
          glassClasses
        )}
        role="status"
        aria-label="Cargando área de entrada de mensajes"
      >
        <div className="flex items-center space-x-3">
          <Skeleton
            width="32px"
            height="32px"
            radius="full"
            animation={animation}
            loadingText="Cargando botón de adjuntos"
          />
          <div className="flex-1">
            <Skeleton
              height="40px"
              radius="lg"
              animation={animation}
              loadingText="Cargando campo de mensaje"
            />
          </div>
          <Skeleton
            width="32px"
            height="32px"
            radius="full"
            animation={animation}
            loadingText="Cargando botón de emoji"
          />
          <Skeleton
            width="60px"
            height="32px"
            radius="md"
            animation={animation}
            loadingText="Cargando botón de envío"
          />
        </div>
      </motion.div>
    </div>
  );

  // Fullscreen Layout - Complete chat interface
  const FullscreenSkeleton: React.FC = () => (
    <div className="flex h-screen">
      {/* Sidebar with chat list */}
      <div className={cn(
        'w-80 border-r border-white/10 flex flex-col',
        glassClasses
      )}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <TextSkeleton
              width="80px"
              lineHeight="lg"
              animation={animation}
              loadingText="Cargando título de chats"
            />
            <Skeleton
              width="32px"
              height="32px"
              radius="full"
              animation={animation}
              loadingText="Cargando botón de nuevo chat"
            />
          </div>
          
          {/* Search bar */}
          <Skeleton
            height="36px"
            radius="lg"
            animation={animation}
            loadingText="Cargando barra de búsqueda"
          />
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-2">
          <ChatListSkeleton />
        </div>
      </div>

      {/* Main conversation area */}
      <div className="flex-1 flex flex-col">
        <ConversationSkeleton />
      </div>
    </div>
  );

  // Render based on layout
  switch (layout) {
    case 'list':
      return <ChatListSkeleton />;
    case 'conversation':
      return (
        <div className={cn('h-full', className)}>
          <ConversationSkeleton />
        </div>
      );
    case 'fullscreen':
      return <FullscreenSkeleton />;
    default:
      return <ChatListSkeleton />;
  }
};

/**
 * Chat Message Skeleton - Individual message loading
 */
interface FixiaChatMessageSkeletonProps {
  /** Message direction */
  direction?: 'sent' | 'received';
  /** Message type */
  messageType?: 'text' | 'image' | 'file' | 'booking';
  /** Animation style */
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
  /** Custom className */
  className?: string;
}

const FixiaChatMessageSkeleton: React.FC<FixiaChatMessageSkeletonProps> = ({
  direction = 'received',
  messageType = 'text',
  animation = 'shimmer',
  className
}) => {
  const { glassClasses } = useOptimizedGlass('light');
  const isSent = direction === 'sent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-end space-x-2',
        isSent ? 'justify-end' : 'justify-start',
        className
      )}
      role="status"
      aria-label="Cargando mensaje"
    >
      {/* Avatar for received messages */}
      {!isSent && (
        <CircleSkeleton size="sm" animation={animation} />
      )}

      {/* Message content */}
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
          isSent 
            ? 'bg-primary/20 border border-primary/30' 
            : `${glassClasses} border border-white/10`
        )}
      >
        {/* Content based on message type */}
        {messageType === 'text' && (
          <TextSkeleton
            lines={2}
            lineHeight="sm"
            lastLineWidth="70%"
            animation={animation}
            loadingText="Cargando mensaje de texto"
          />
        )}

        {messageType === 'image' && (
          <div className="space-y-2">
            <Skeleton
              height="120px"
              radius="md"
              animation={animation}
              loadingText="Cargando imagen"
            />
            <TextSkeleton
              lineHeight="sm"
              animation={animation}
              loadingText="Cargando descripción de imagen"
            />
          </div>
        )}

        {messageType === 'file' && (
          <div className="flex items-center space-x-2">
            <Skeleton
              width="32px"
              height="32px"
              radius="md"
              animation={animation}
              loadingText="Cargando icono de archivo"
            />
            <div className="flex-1 space-y-1">
              <TextSkeleton
                width="80%"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando nombre de archivo"
              />
              <TextSkeleton
                width="40%"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando tamaño de archivo"
              />
            </div>
          </div>
        )}

        {messageType === 'booking' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Skeleton
                width="16px"
                height="16px"
                radius="sm"
                animation={animation}
              />
              <TextSkeleton
                width="60%"
                lineHeight="sm"
                animation={animation}
                loadingText="Cargando tipo de reserva"
              />
            </div>
            <TextSkeleton
              lines={2}
              lineHeight="sm"
              animation={animation}
              loadingText="Cargando detalles de reserva"
            />
            <div className="flex space-x-2">
              <Skeleton
                width="80px"
                height="28px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón de acción"
              />
              <Skeleton
                width="60px"
                height="28px"
                radius="md"
                animation={animation}
                loadingText="Cargando botón secundario"
              />
            </div>
          </div>
        )}

        {/* Message metadata */}
        <div className="flex items-center justify-between mt-1">
          <TextSkeleton
            width="40px"
            lineHeight="sm"
            animation={animation}
            loadingText="Cargando hora"
          />
          {isSent && (
            <Skeleton
              width="12px"
              height="12px"
              radius="sm"
              animation={animation}
              loadingText="Cargando estado de entrega"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export { FixiaChatSkeleton, FixiaChatMessageSkeleton };