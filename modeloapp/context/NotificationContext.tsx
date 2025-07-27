import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner@2.0.3";

interface Notification {
  id: string;
  type: 'message' | 'service' | 'payment' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  avatar?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif_1",
      type: 'message',
      title: "Nuevo mensaje",
      message: "María González te ha enviado un mensaje sobre el proyecto de e-commerce",
      read: false,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      actionUrl: "/chat/chat_maria",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=40&h=40&fit=crop&crop=face"
    },
    {
      id: "notif_2",
      type: 'service',
      title: "Servicio completado",
      message: "Has completado exitosamente el diseño de identidad para Carlos Ruiz",
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actionUrl: "/services/FX002"
    },
    {
      id: "notif_3",
      type: 'payment',
      title: "Pago recibido",
      message: "Has recibido $1,200 por el proyecto completado",
      read: true,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const mockNotifications = [
          {
            type: 'message' as const,
            title: "Nuevo mensaje",
            message: "Un cliente está interesado en tus servicios",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
          },
          {
            type: 'service' as const,
            title: "Nueva propuesta",
            message: "Has recibido una nueva solicitud de servicio",
          },
          {
            type: 'system' as const,
            title: "Actualización de perfil",
            message: "Tu verificación de identidad ha sido aprobada",
          }
        ];
        
        const randomNotif = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        addNotification(randomNotif);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: "notif_" + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      action: notification.actionUrl ? {
        label: "Ver",
        onClick: () => window.location.href = notification.actionUrl!
      } : undefined,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}