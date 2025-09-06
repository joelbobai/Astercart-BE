import User from '../../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Store securely

// ✅ Admin Signup Controller
export const signupAdmin = async (req, res) => {
  try {
    console.log(req.body);
    
    const { email, phoneNumber, password } = req.body;

    if (!email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Account already exists' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Credentials not registered' });
    }
    
    if (!(user.phoneNumber == Number(phoneNumber))) {
      return res.status(400).json({ message: 'Credentials not registered' });
    }
    

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password= hashedPassword
    user.isEmailVerified = true
    await user.save()

    res.status(201).json({
      message: 'Admin signed up successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};


// ✅ Admin Login Controller
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // No need to use .select('+password') since password is not excluded in schema
    const user = await User.findOne({ email, userType: 'Admin' });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }
    
    // if (!user.isEmailVerified) {
    //   return res.status(401).json({ message: 'Email has not been verified' });
    // }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    if (user.adminStatus==="inactive") {
      return res.status(401).json({ message: 'Your account is inactive Contact Support' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// ✅ Admin Logout Controller
export const logoutAdmin = async (_req, res) => {
  try {
    // Stateless JWT: Logout is handled on the frontend (remove token)
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};
