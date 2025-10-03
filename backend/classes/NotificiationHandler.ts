import { EmailClient, EmailMessage } from './EmailClient';

export enum NotificationType {
    EXPENSE_ADDED = 'EXPENSE_ADDED',
    INCOME_ADDED = 'INCOME_ADDED',
    BUDGET_EXCEEDED = 'BUDGET_EXCEEDED',
    TAX_CALCULATION_COMPLETE = 'TAX_CALCULATION_COMPLETE',
    FINANCIAL_GOAL_ACHIEVED = 'FINANCIAL_GOAL_ACHIEVED',
    PROFILE_UPDATED = 'PROFILE_UPDATED',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export interface NotificationMessage {
    id: string;
    type: NotificationType;
    userId: string;
    title: string;
    message: string;
    data?: any;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
    read?: boolean;
}

export class NotificationObserver {
    private static instance: NotificationObserver;
    private observers: NotificationHandler[] = [];

    // Private access modifier prevents instances being created outside this class
    private constructor() {
    }

    public static getInstance(): NotificationObserver {
        if (!NotificationObserver.instance) {
            NotificationObserver.instance = new NotificationObserver();
        }
        return NotificationObserver.instance;
    }

    subscribe(observer: NotificationHandler): void {
        this.observers.push(observer);
    }

    notify(message: NotificationMessage): void {
        this.observers.forEach(observer => {
            observer.notify(message);
        });
    }
}

export interface NotificationHandler {
    notify(message: NotificationMessage): void;
}

export class LogNotificationHandler implements NotificationHandler {
    notify(message: NotificationMessage): void {
        console.log(`   Message: ${message.message}`);
        console.log(`   Priority: ${message.priority}`);
    }
}

export class EmailNotificationHandler implements NotificationHandler {
    private logHandler: LogNotificationHandler;
    private emailClient: EmailClient;

    constructor(logHandler: LogNotificationHandler, emailClient?: EmailClient) {
        this.logHandler = logHandler;
        this.emailClient = emailClient || new EmailClient();
    }

    notify(message: NotificationMessage): void {
        this.logHandler.notify(message);
        this.sendEmail(message);
    }

    private async sendEmail(message: NotificationMessage): Promise<void> {
        try {
            const emailMessage: EmailMessage = {
                to: message.userId,
                subject: message.title,
                body: message.message,
                priority: message.priority
            };

            await this.emailClient.sendEmail(emailMessage);
        } catch (error) {
            console.error(`Failed to send notification email for message ${message.id}:`, error);
        }
    }
}