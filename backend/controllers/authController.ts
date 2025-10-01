import User from '../models/User';
import { IUserDocument } from '../types/backendUserTypes';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { 
    UserResponseData, 
    RegisterRequest, 
    LoginRequest, 
    UpdateProfileRequest,
    ExpressResponse
} from '../types/authTypes';
import { Country } from '../types/globalTypes';

interface ProfileResponseData {
    name: string;
    email: string;
    address?: string;
    country?: Country;
}

interface ExpressRequest {
    body: any;
    user?: {
        id: string;
    };
}

const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: '30d' });
};

const registerUser = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    const { name, email, password, country }: RegisterRequest = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const user: IUserDocument = await User.create({ name, email, password, country });
        const response: UserResponseData = {
            id: user._id.toString(), 
            name: user.name, 
            email: user.email, 
            token: generateToken(user._id.toString()) 
        };
        res.status(201).json(response);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    const { email, password }: LoginRequest = req.body;
    try {
        const user: IUserDocument | null = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password as string))) {
            const response: UserResponseData = {
                id: user._id.toString(), 
                name: user.name, 
                email: user.email, 
                token: generateToken(user._id.toString()) 
            };
            res.json(response);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    try {
        const user: IUserDocument | null = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const response: ProfileResponseData = {
            name: user.name,
            email: user.email,
            address: user.address,
            country: user.country
        };
        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req: ExpressRequest, res: ExpressResponse): Promise<void> => {
    try {
        const user: IUserDocument | null = await User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { name, email, address, country }: UpdateProfileRequest = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        user.country = country || user.country;

        const updatedUser: IUserDocument = await user.save();
        const response: UserResponseData = {
            id: updatedUser._id.toString(), 
            name: updatedUser.name, 
            email: updatedUser.email, 
            address: updatedUser.address, 
            token: generateToken(updatedUser._id.toString()) 
        };
        res.json(response);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// CommonJS export for Node.js for tests
module.exports = { registerUser, loginUser, updateUserProfile, getProfile };

// ES6 export for TypeScript/modern environments
export { registerUser, loginUser, updateUserProfile, getProfile };
export default { registerUser, loginUser, updateUserProfile, getProfile };
