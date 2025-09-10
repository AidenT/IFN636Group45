// Mock the User module before requiring anything else
const mockUser = {
    findOne: require('sinon').stub(),
    create: require('sinon').stub(),
    findById: require('sinon').stub()
};

// Mock all possible User module paths
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    if (id === '../models/User' || id.includes('User')) {
        return { default: mockUser, ...mockUser };
    }
    return originalRequire.apply(this, arguments);
};

const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Now require the COMPILED controller after mocking User
const { registerUser, loginUser, getProfile, updateUserProfile } = require('../dist/controllers/authController');

// Restore original require
Module.prototype.require = originalRequire;

describe('Auth Controller Tests - JavaScript/TypeScript Compatible', () => {
    let req;
    let res;
    let statusStub;
    let jsonStub;

    beforeEach(() => {
        // Create fresh request and response mocks for each test
        req = {
            body: {},
            user: { id: 'mockUserId123' }
        };

        jsonStub = sinon.stub();
        statusStub = sinon.stub().returns({ json: jsonStub });
        
        res = {
            status: statusStub,
            json: jsonStub
        };

        // Reset all User method stubs
        mockUser.findOne.reset();
        mockUser.create.reset();
        mockUser.findById.reset();

        // Set up environment variable
        process.env.JWT_SECRET = 'test-secret-key';
    });

    afterEach(() => {
        // Restore all stubs after each test
        sinon.restore();
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            req.body = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            const mockUserData = {
                _id: { toString: () => 'user123' },
                name: 'John Doe',
                email: 'john@example.com'
            };

            mockUser.findOne.resolves(null); // No existing user
            mockUser.create.resolves(mockUserData);
            sinon.stub(jwt, 'sign').returns('mock-jwt-token');

            // Act
            await registerUser(req, res);

            // Assert
            expect(statusStub.calledWith(201)).to.be.true;
            expect(jsonStub.calledWithMatch({
                id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                token: 'mock-jwt-token'
            })).to.be.true;
        });

        it('should return error if user already exists', async () => {
            // Arrange
            req.body = {
                name: 'John Doe',
                email: 'existing@example.com',
                password: 'password123'
            };

            const existingUser = { email: 'existing@example.com' };
            mockUser.findOne.resolves(existingUser);

            // Act
            await registerUser(req, res);

            // Assert
            expect(statusStub.calledWith(400)).to.be.true;
            expect(jsonStub.calledWith({ message: 'User already exists' })).to.be.true;
        });
    });

    describe('loginUser', () => {
        it('should login user with valid credentials', async () => {
            // Arrange
            req.body = {
                email: 'john@example.com',
                password: 'password123'
            };

            const mockUserData = {
                _id: { toString: () => 'user123' },
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword'
            };

            mockUser.findOne.resolves(mockUserData);
            sinon.stub(bcrypt, 'compare').resolves(true);
            sinon.stub(jwt, 'sign').returns('mock-jwt-token');

            // Act
            await loginUser(req, res);

            // Assert
            expect(jsonStub.calledWithMatch({
                id: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
                token: 'mock-jwt-token'
            })).to.be.true;
        });
    });

    describe('getProfile', () => {
        it('should return user profile successfully', async () => {
            // Arrange
            const mockUserData = {
                name: 'John Doe',
                email: 'john@example.com',
                university: 'Test University',
                address: '123 Test Street'
            };

            mockUser.findById.resolves(mockUserData);

            // Act
            await getProfile(req, res);

            // Assert
            expect(statusStub.calledWith(200)).to.be.true;
            expect(jsonStub.calledWith({
                name: 'John Doe',
                email: 'john@example.com',
                university: 'Test University',
                address: '123 Test Street'
            })).to.be.true;
        });
    });
});