import { toast } from '@/hooks/use-toast';

// Notification priority levels
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

// Notification categories
export type NotificationCategory = 
  | 'price_alert' 
  | 'arbitrage_opportunity' 
  | 'trading_bot' 
  | 'system' 
  | 'security' 
  | 'news';

// Notification source
export type NotificationSource = 
  | 'scanner' 
  | 'trading_bot' 
  | 'risk_manager' 
  | 'market_analysis' 
  | 'system' 
  | 'user';

// Notification method
export type NotificationMethod = 
  | 'in_app' 
  | 'email' 
  | 'push' 
  | 'sms' 
  | 'telegram' 
  | 'webhook';

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  source: NotificationSource;
  timestamp: Date;
  isRead: boolean;
  isSent: boolean;
  metadata?: Record<string, any>;
  actions?: NotificationAction[];
}

// Notification action
export interface NotificationAction {
  label: string;
  action: string; // Action identifier
  url?: string;
  data?: Record<string, any>;
}

// Notification settings
export interface NotificationSettings {
  enabled: boolean;
  methods: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
    telegram: boolean;
    webhook: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  categories: {
    price_alert: boolean;
    arbitrage_opportunity: boolean;
    trading_bot: boolean;
    system: boolean;
    security: boolean;
    news: boolean;
  };
  schedule: {
    doNotDisturb: boolean;
    doNotDisturbStart: string; // Format: 'HH:MM'
    doNotDisturbEnd: string; // Format: 'HH:MM'
    timezone: string; // e.g., 'America/New_York'
  };
  contacts: {
    email?: string;
    phone?: string;
    telegram?: string;
    webhook?: string;
  };
}

// Default notification settings
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  methods: {
    in_app: true,
    email: true,
    push: false,
    sms: false,
    telegram: false,
    webhook: false,
  },
  priorities: {
    low: true,
    medium: true,
    high: true,
    critical: true,
  },
  categories: {
    price_alert: true,
    arbitrage_opportunity: true,
    trading_bot: true,
    system: true,
    security: true,
    news: false,
  },
  schedule: {
    doNotDisturb: false,
    doNotDisturbStart: '22:00',
    doNotDisturbEnd: '08:00',
    timezone: 'UTC',
  },
  contacts: {},
};

// Notification Manager - handles sending and tracking notifications
export class NotificationManager {
  private settings: NotificationSettings;
  private notifications: Notification[] = [];
  private notificationHandlers: Map<NotificationMethod, (notification: Notification) => Promise<boolean>> =
    new Map();
  
  constructor(settings: NotificationSettings = DEFAULT_NOTIFICATION_SETTINGS) {
    this.settings = settings;
    
    // Register default handlers
    this.registerNotificationHandler('in_app', this.handleInAppNotification.bind(this));
    this.registerNotificationHandler('email', this.handleEmailNotification.bind(this));
    this.registerNotificationHandler('push', this.handlePushNotification.bind(this));
    this.registerNotificationHandler('sms', this.handleSmsNotification.bind(this));
    this.registerNotificationHandler('telegram', this.handleTelegramNotification.bind(this));
    this.registerNotificationHandler('webhook', this.handleWebhookNotification.bind(this));
  }
  
  // Register a handler for a notification method
  registerNotificationHandler(
    method: NotificationMethod,
    handler: (notification: Notification) => Promise<boolean>
  ): void {
    this.notificationHandlers.set(method, handler);
  }
  
  // Create and send a notification
  async notify(
    title: string,
    message: string,
    category: NotificationCategory,
    priority: NotificationPriority = 'medium',
    source: NotificationSource = 'system',
    metadata?: Record<string, any>,
    actions?: NotificationAction[]
  ): Promise<Notification> {
    // Check if notifications are enabled
    if (!this.settings.enabled) {
      console.log('Notifications are disabled. Skipping notification:', title);
      return this.createNotification(
        title, 
        message, 
        category, 
        priority, 
        source, 
        false, 
        metadata, 
        actions
      );
    }
    
    // Check if this category is enabled
    if (!this.settings.categories[category]) {
      console.log(`Notifications for category ${category} are disabled. Skipping notification:`, title);
      return this.createNotification(
        title, 
        message, 
        category, 
        priority, 
        source, 
        false, 
        metadata, 
        actions
      );
    }
    
    // Check if this priority is enabled
    if (!this.settings.priorities[priority]) {
      console.log(`Notifications for priority ${priority} are disabled. Skipping notification:`, title);
      return this.createNotification(
        title, 
        message, 
        category, 
        priority, 
        source, 
        false, 
        metadata, 
        actions
      );
    }
    
    // Check if we're in "do not disturb" mode
    if (this.settings.schedule.doNotDisturb && this.isInDoNotDisturbPeriod()) {
      // Only send critical notifications during do not disturb
      if (priority !== 'critical') {
        console.log('In do not disturb period. Skipping non-critical notification:', title);
        const notification = this.createNotification(
          title, 
          message, 
          category, 
          priority, 
          source, 
          false, 
          metadata, 
          actions
        );
        return notification;
      }
    }
    
    // Create notification
    const notification = this.createNotification(
      title, 
      message, 
      category, 
      priority, 
      source, 
      true, 
      metadata, 
      actions
    );
    
    // Send notification through all enabled methods
    for (const [method, enabled] of Object.entries(this.settings.methods)) {
      if (enabled) {
        const handler = this.notificationHandlers.get(method as NotificationMethod);
        
        if (handler) {
          try {
            await handler(notification);
          } catch (error) {
            console.error(`Failed to send notification via ${method}:`, error);
          }
        }
      }
    }
    
    return notification;
  }
  
  // Create a notification object
  private createNotification(
    title: string,
    message: string,
    category: NotificationCategory,
    priority: NotificationPriority,
    source: NotificationSource,
    isSent: boolean,
    metadata?: Record<string, any>,
    actions?: NotificationAction[]
  ): Notification {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      category,
      priority,
      source,
      timestamp: new Date(),
      isRead: false,
      isSent,
      metadata,
      actions,
    };
    
    this.notifications.push(notification);
    
    // Limit stored notifications to last 100
    if (this.notifications.length > 100) {
      this.notifications.shift();
    }
    
    return notification;
  }
  
  // Get all notifications
  getNotifications(options?: {
    unreadOnly?: boolean;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    source?: NotificationSource;
    limit?: number;
  }): Notification[] {
    let filteredNotifications = [...this.notifications];
    
    // Apply filters
    if (options) {
      if (options.unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.isRead);
      }
      
      if (options.category) {
        filteredNotifications = filteredNotifications.filter(n => n.category === options.category);
      }
      
      if (options.priority) {
        filteredNotifications = filteredNotifications.filter(n => n.priority === options.priority);
      }
      
      if (options.source) {
        filteredNotifications = filteredNotifications.filter(n => n.source === options.source);
      }
    }
    
    // Sort by timestamp (newest first)
    filteredNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply limit
    if (options?.limit) {
      filteredNotifications = filteredNotifications.slice(0, options.limit);
    }
    
    return filteredNotifications;
  }
  
  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      return true;
    }
    
    return false;
  }
  
  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
  }
  
  // Delete a notification
  deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  // Delete all notifications
  deleteAllNotifications(): void {
    this.notifications = [];
  }
  
  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }
  
  // Get current notification settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }
  
  // Handlers for different notification methods
  
  // Handle in-app notification
  private async handleInAppNotification(notification: Notification): Promise<boolean> {
    // In a real app, this would add the notification to an in-app notification center
    // For now, we'll just use toast notifications as a simple representation
    
    // Use different toast variants based on priority
    const variant = 
      notification.priority === 'critical' ? 'destructive' :
      notification.priority === 'high' ? 'default' :
      notification.priority === 'medium' ? 'default' :
      'default';
    
    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant
    });
    
    return true;
  }
  
  // Handle email notification
  private async handleEmailNotification(notification: Notification): Promise<boolean> {
    // In a real app, this would send an actual email
    // For now, we'll just log it
    
    if (!this.settings.contacts.email) {
      console.log('Email address not configured. Cannot send email notification.');
      return false;
    }
    
    console.log(`[MOCK] Sending email notification to ${this.settings.contacts.email}:`, {
      subject: notification.title,
      body: notification.message,
      priority: notification.priority
    });
    
    return true;
  }
  
  // Handle push notification
  private async handlePushNotification(notification: Notification): Promise<boolean> {
    // In a real app, this would send a push notification to the user's device
    // For now, we'll just log it
    
    console.log('[MOCK] Sending push notification:', {
      title: notification.title,
      body: notification.message,
      priority: notification.priority
    });
    
    return true;
  }
  
  // Handle SMS notification
  private async handleSmsNotification(notification: Notification): Promise<boolean> {
    // In a real app, this would send an actual SMS
    // For now, we'll just log it
    
    if (!this.settings.contacts.phone) {
      console.log('Phone number not configured. Cannot send SMS notification.');
      return false;
    }
    
    console.log(`[MOCK] Sending SMS notification to ${this.settings.contacts.phone}:`, {
      message: `${notification.title}: ${notification.message}`
    });
    
    return true;
  }
  
  // Handle Telegram notification
  private async handleTelegramNotification(notification: Notification): Promise<boolean> {
    // In a real app, this would send a message to a Telegram bot
    // For now, we'll just log it
    
    if (!this.settings.contacts.telegram) {
      console.log('Telegram ID not configured. Cannot send Telegram notification.');
      return false;
    }
    
    console.log(`[MOCK] Sending Telegram notification to ${this.settings.contacts.telegram}:`, {
      message: `*${notification.title}*\n${notification.message}`
    });
    
    return true;
  }
  
  // Handle webhook notification
  private async handleWebhookNotification(notification: Notification): Promise<boolean> {
    // In a real app, this would send a POST request to the configured webhook URL
    // For now, we'll just log it
    
    if (!this.settings.contacts.webhook) {
      console.log('Webhook URL not configured. Cannot send webhook notification.');
      return false;
    }
    
    console.log(`[MOCK] Sending webhook notification to ${this.settings.contacts.webhook}:`, {
      payload: {
        title: notification.title,
        message: notification.message,
        category: notification.category,
        priority: notification.priority,
        source: notification.source,
        timestamp: notification.timestamp.toISOString(),
        metadata: notification.metadata
      }
    });
    
    return true;
  }
  
  // Check if current time is within do not disturb period
  private isInDoNotDisturbPeriod(): boolean {
    if (!this.settings.schedule.doNotDisturb) {
      return false;
    }
    
    try {
      // Parse start and end times
      const [startHour, startMinute] = this.settings.schedule.doNotDisturbStart.split(':').map(Number);
      const [endHour, endMinute] = this.settings.schedule.doNotDisturbEnd.split(':').map(Number);
      
      // Get current time
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Convert all times to minutes for easier comparison
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      // Check if current time is within do not disturb period
      if (startTimeMinutes < endTimeMinutes) {
        // Simple case: start time is before end time
        return currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes;
      } else {
        // Complex case: start time is after end time (spans midnight)
        return currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes;
      }
    } catch (error) {
      console.error('Error parsing do not disturb times:', error);
      return false;
    }
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager(); 