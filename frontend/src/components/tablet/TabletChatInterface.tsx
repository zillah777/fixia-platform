'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image,
  Smile,
  Search,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Check,
  CheckCheck,
  Star,
  Pin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTabletNavigation } from '@/contexts/TabletNavigationContext';
import { useAccessibilityPreferences } from '@/utils/accessibility';
import { useOptimizedGlass } from '@/contexts/GlassOptimizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status?: 'sent' | 'delivered' | 'read';
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
}

interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  isOnline: boolean;
  isPinned: boolean;
  messages: ChatMessage[];
  type: 'service' | 'support' | 'general';
}

interface TabletChatInterfaceProps {
  conversations: ChatConversation[];
  currentUserId: string;
  className?: string;
  onSendMessage?: (conversationId: string, message: string) => void;
  onStartCall?: (conversationId: string, type: 'voice' | 'video') => void;
  onArchiveConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

interface ChatListItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  onClick: (conversationId: string) => void;
  onPin: (conversationId: string) => void;
  onArchive: (conversationId: string) => void;
  touchTargetSize: number;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  conversation,
  isActive,
  onClick,
  onPin,
  onArchive,
  touchTargetSize,
}) => {
  const { reducedMotion } = useAccessibilityPreferences();
  const [showActions, setShowActions] = useState(false);

  const handleClick = useCallback(() => {
    onClick(conversation.id);
  }, [onClick, conversation.id]);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <motion.div
      className="relative"
      whileTap={reducedMotion ? {} : { scale: 0.98 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <Button
        variant="ghost"
        className={cn(
          'w-full p-4 h-auto justify-start text-left',
          'hover:bg-white/5 focus:bg-white/10',
          'tablet-touch-target',
          isActive && 'bg-primary/10 border-r-2 border-primary-400'
        )}
        style={{ minHeight: `${touchTargetSize + 16}px` }}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3 w-full">
          {/* Avatar with online indicator */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.participantAvatar} />
              <AvatarFallback className="bg-primary text-white">
                {conversation.participantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>

          {/* Chat info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-white text-sm truncate">
                  {conversation.participantName}
                </h4>
                {conversation.isPinned && (
                  <Pin size={12} className="text-primary-400 flex-shrink-0" />
                )}
              </div>
              <span className="text-white/60 text-xs flex-shrink-0">
                {formatTime(conversation.lastMessageTime)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm truncate pr-2">
                {conversation.lastMessage || 'Sin mensajes'}
              </p>
              {conversation.unreadCount > 0 && (
                <Badge 
                  variant="destructive"
                  className="h-5 w-5 text-xs p-0 flex items-center justify-center flex-shrink-0"
                >
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Button>

      {/* Quick actions */}
      <AnimatePresence>
        {showActions && !isActive && (
          <motion.div
            className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/60 hover:text-primary-400 hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onPin(conversation.id);
              }}
            >
              <Pin size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/60 hover:text-orange-400 hover:bg-orange/10"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(conversation.id);
              }}
            >
              <Archive size={14} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId: string;
  showAvatar?: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
}) => {
  const { reducedMotion } = useAccessibilityPreferences();

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <motion.div
      className={cn(
        'flex items-end space-x-2 mb-4',
        isOwn && 'flex-row-reverse space-x-reverse'
      )}
      initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-secondary text-white text-xs">
            {message.senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <div className={cn('max-w-[70%] min-w-[100px]', isOwn && 'items-end')}>
        <div
          className={cn(
            'px-4 py-2 rounded-2xl glass-light',
            'border border-white/10',
            isOwn 
              ? 'bg-primary/20 border-primary/30 rounded-br-sm' 
              : 'bg-white/10 rounded-bl-sm'
          )}
        >
          <p className="text-white text-sm break-words">{message.content}</p>
        </div>

        {/* Message info */}
        <div className={cn(
          'flex items-center space-x-2 mt-1 px-1',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className="text-white/50 text-xs">
            {formatMessageTime(message.timestamp)}
          </span>
          {isOwn && message.status && (
            <div className="text-white/50">
              {message.status === 'sent' && <Check size={12} />}
              {message.status === 'delivered' && <CheckCheck size={12} />}
              {message.status === 'read' && <CheckCheck size={12} className="text-primary-400" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const TabletChatInterface: React.FC<TabletChatInterfaceProps> = ({
  conversations,
  currentUserId,
  className,
  onSendMessage,
  onStartCall,
  onArchiveConversation,
  onDeleteConversation,
}) => {
  const { reducedMotion } = useAccessibilityPreferences();
  const { glassClasses } = useOptimizedGlass('medium');
  
  const {
    chatPanelOpen,
    chatPanelSize,
    splitScreenMode,
    orientation,
    touchTargetSize,
    enableTransitions,
    toggleChatPanel,
    setChatPanelSize,
    toggleSplitScreen,
  } = useTabletNavigation();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  
  const chatListRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  // Handle send message
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversationId) return;
    
    onSendMessage?.(selectedConversationId, messageInput.trim());
    setMessageInput('');
  }, [messageInput, selectedConversationId, onSendMessage]);

  // Handle resize
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResize = useCallback((info: PanInfo) => {
    if (!isResizing) return;
    
    const containerWidth = window.innerWidth;
    const newSize = Math.max(25, Math.min(60, (info.point.x / containerWidth) * 100));
    setChatPanelSize(newSize);
  }, [isResizing, setChatPanelSize]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Handle pin conversation
  const handlePinConversation = useCallback((conversationId: string) => {
    // Implement pin logic
    console.log('Pin conversation:', conversationId);
  }, []);

  // Handle archive conversation
  const handleArchiveConversation = useCallback((conversationId: string) => {
    onArchiveConversation?.(conversationId);
  }, [onArchiveConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages]);

  if (!chatPanelOpen) {
    return null;
  }

  const panelWidth = splitScreenMode && orientation === 'landscape' 
    ? `${chatPanelSize}%` 
    : '100%';

  return (
    <motion.div
      className={cn(
        'fixed inset-y-0 right-0 z-40',
        'tablet:relative tablet:inset-y-auto tablet:z-auto',
        glassClasses,
        'border-l border-white/10',
        'flex flex-col',
        className
      )}
      style={{ width: panelWidth }}
      initial={reducedMotion ? {} : { x: '100%' }}
      animate={reducedMotion ? {} : { x: 0 }}
      exit={reducedMotion ? {} : { x: '100%' }}
      transition={{ 
        duration: enableTransitions ? 0.3 : 0,
        ease: 'easeInOut' 
      }}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 min-h-[70px]">
        <div className="flex items-center space-x-3">
          <h2 className="text-white font-semibold text-lg">Mensajes</h2>
          <Badge variant="secondary" className="text-xs">
            {conversations.length}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          {/* Split screen toggle */}
          {orientation === 'landscape' && (
            <Button
              variant="ghost"
              size="sm"
              className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
              onClick={toggleSplitScreen}
              aria-label={splitScreenMode ? 'Salir de pantalla dividida' : 'Pantalla dividida'}
            >
              {splitScreenMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
            onClick={toggleChatPanel}
            aria-label="Cerrar chat"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations list */}
        <div className={cn(
          'flex flex-col border-r border-white/10',
          splitScreenMode ? 'w-1/3' : selectedConversationId ? 'w-0 tablet-landscape:w-1/3' : 'w-full',
          'transition-all duration-300'
        )}>
          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conversaciones..."
                className={cn(
                  'pl-10 bg-white/10 border-white/20 text-white placeholder-white/60',
                  'focus:ring-primary focus:border-primary',
                  'tablet-touch-target'
                )}
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <ChatListItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={selectedConversationId === conversation.id}
                  onClick={handleSelectConversation}
                  onPin={handlePinConversation}
                  onArchive={handleArchiveConversation}
                  touchTargetSize={touchTargetSize}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Resize handle */}
        {splitScreenMode && orientation === 'landscape' && (
          <motion.div
            ref={resizeRef}
            className="w-1 bg-white/20 cursor-col-resize hover:bg-primary/50 transition-colors"
            drag="x"
            dragConstraints={{ left: -200, right: 200 }}
            onDragStart={handleResizeStart}
            onDrag={(_, info) => handleResize(info)}
            onDragEnd={handleResizeEnd}
            whileHover={reducedMotion ? {} : { scale: 1.1 }}
          />
        )}

        {/* Chat messages */}
        <div className={cn(
          'flex flex-col flex-1',
          !selectedConversationId && !splitScreenMode && 'hidden tablet-landscape:flex'
        )}>
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="tablet-landscape:hidden tablet-touch-target"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ChevronLeft size={18} />
                  </Button>

                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participantAvatar} />
                    <AvatarFallback className="bg-primary text-white">
                      {selectedConversation.participantName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="text-white font-medium">
                      {selectedConversation.participantName}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {selectedConversation.isOnline ? 'En línea' : 'Desconectado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => onStartCall?.(selectedConversation.id, 'voice')}
                  >
                    <Phone size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => onStartCall?.(selectedConversation.id, 'video')}
                  >
                    <Video size={18} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="tablet-touch-target text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass-tablet border-white/20">
                      <DropdownMenuItem className="text-white hover:bg-white/10">
                        <Star className="mr-2 h-4 w-4" />
                        Destacar conversación
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-white/10">
                        <Archive className="mr-2 h-4 w-4" />
                        Archivar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/20" />
                      <DropdownMenuItem className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar conversación
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={messagesRef}>
                <div className="space-y-1">
                  {selectedConversation.messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === currentUserId}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white hover:bg-white/10 p-1"
                      >
                        <Paperclip size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white hover:bg-white/10 p-1"
                      >
                        <Image size={16} alt="" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white hover:bg-white/10 p-1"
                      >
                        <Smile size={16} />
                      </Button>
                    </div>
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className={cn(
                        'bg-white/10 border-white/20 text-white placeholder-white/60',
                        'focus:ring-primary focus:border-primary',
                        'tablet-touch-target'
                      )}
                    />
                  </div>
                  <Button
                    type="submit"
                    className={cn(
                      'tablet-touch-target bg-primary hover:bg-primary-600',
                      'disabled:opacity-50'
                    )}
                    disabled={!messageInput.trim()}
                  >
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            // Empty state
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <MessageCircle size={64} className="text-white/40 mx-auto mb-4" />
                <h3 className="text-white/80 text-lg font-medium mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-white/60 text-sm max-w-sm">
                  Elige una conversación de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TabletChatInterface;