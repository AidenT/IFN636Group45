export interface EmailMessage {
    to: string;
    subject: string;
    body: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
}

export class EmailClient {


    async sendEmail(message: EmailMessage): Promise<void> {
        try {
            // TODO: Replace with actual email service integration
            console.log("Sample Email");
        } catch (error) {
            console.error("Failed to send email");
            throw new Error(`Failed to send email: ${error}`);
        }
    }
}
