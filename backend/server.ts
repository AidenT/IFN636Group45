import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import incomeRoutes from './routes/incomeRoutes';
import expenseRoutes from './routes/expenseRoutes';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expense', expenseRoutes);

// Define the port type
const PORT: number = parseInt(process.env.PORT || '5001', 10);

// Export the app object for testing
if (require.main === module) {
    connectDB();
    // If the file is run directly, start the server
    app.listen(PORT, (): void => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for testing and module usage
export default app;
