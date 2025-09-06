import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Store from "../models/storeModel.js";
import sendVerificationEmail from "../utils/mailsender/verificationEmail.js";

// Signup handler for store
export const storeSignup = async (req, res) => {
  try {
    let { email, password, ...rest } = req.body;

    email = email.toLowerCase();

    // Check if email already exists
    const existingUser = await Store.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const store = new Store({
      email,
      password: hashedPassword,
      ...rest,
    });

    await store.save();
    res.status(201).json({ message: "Store registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Signup handler for store
export const signup = async (req, res) => {
  try {
    let { email, password, userType, ...rest } = req.body;

    email = email.toLowerCase();

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      userType,
      ...rest,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// private_data
export const privateData = async (req, res) => {
  try {
    const userId = await req?.userId;
    let user;
    user = await User.findById(userId, "-password");
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).send({ user });
  } catch (error) {
    console.error("C Error fetching private data:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login Store handler
export const storeLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase();

    // Find user
    const user = await Store.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // if (user.userType !== userType)
    //   return res.status(400).json({ message: "invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, storeName: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login handler
export const login = async (req, res) => {
  try {
    let { email, password, userType } = req.body;
    email = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.userType !== userType)
      return res.status(400).json({ message: "invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// signup customer and set verifying email address

const tempStorage = {}; // Temporary storage for user data and verification codes

export const signupCustomer = async (req, res) => {
  try {
    const { email, password, userType, ...rest } = req.body;

    const normalizedEmail = email.toLowerCase();

    // Check if the email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists. Please log in." });
    }

    // Generate a 6-digit verification code
    const code = () => {
      return Math.floor(100000 + Math.random() * 900000);
    };

    const verificationCode = code();

    // Store user data and verification code temporarily
    tempStorage[normalizedEmail] = {
      userData: {
        email: normalizedEmail,
        password,
        userType,
        ...rest,
      },
      verificationCode,
      expiresAt: Date.now() + 1 * 60 * 1000, // 1 minute
    };

    // Debugging
    // console.log("Temp storage:", tempStorage);

    // Send the verification email
    await sendVerificationEmail(normalizedEmail, verificationCode);

    return res.status(200).json({
      message:
        "A verification code has been sent to your email. Please verify your email address to complete your signup.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Verify email address functionality
// export const verifyEmail = async (req, res) => {
//   try {
//       const { verificationCode } = req.body;

//       // Ensure verificationCode is parsed as an integer
//       const parsedCode = parseInt(verificationCode, 10);

//       // Find the user associated with this verification code
//       const storedEntry = Object.entries(tempStorage).find(
//           ([email,data]) => data.verificationCode === parsedCode // Corrected key name
//       );

//        console.log("Stored Entry:", storedEntry);

//       if (!storedEntry) {
//           return res.status(400).json({ message: "Invalid verification code." });
//       }

//       const [email, storedData] = storedEntry;

//       // Check if the code has expired
//       if (Date.now() > storedData.expiresAt) {
//           delete tempStorage[email];
//           return res.status(400).json({ message: "Verification code has expired." });
//       }

//       // Hash the password
//       const hashedPassword = await bcrypt.hash(storedData.userData.password, 10);

//       // Create a new user
//       const user = new User({
//           ...storedData.userData,
//           password: hashedPassword,
//           isEmailVerified: true, // Mark email as verified
//       });

//       await user.save();

//       // Cleanup the temporary storage
//       delete tempStorage[email];

//       return res.status(201).json({ message: "Email verified and user registered successfully." });
//   } catch (error) {
//       return res.status(500).json({ message: error.message });
//   }
// };

export const verifyEmail = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    // Ensure verification code is provided
    if (!verificationCode) {
      return res
        .status(400)
        .json({ message: "Verification code is required." });
    }

    // Parse the verification code to a number
    const parsedCode = parseInt(verificationCode, 10);

    // Log tempStorage for debugging
    // console.log("Temp Storage:", tempStorage);

    // Find the user associated with this verification code
    const storedEntry = Object.entries(tempStorage).find(
      ([email, data]) => parseInt(data.verificationCode) === parsedCode
    );

    // console.log("Provided Code:", parsedCode);
    // console.log("Stored Entry:", storedEntry);

    if (!storedEntry) {
      return res.status(400).json({ message: "Invalid verification code." });
    }

    const [email, storedData] = storedEntry;

    // Check if the code has expired
    if (Date.now() > storedData.expiresAt) {
      tempStorage[email].isExpired = true; // Mark the code as expired
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Proceed only if the code is not expired
    if (storedData.isExpired) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(storedData.userData.password, 10);

    // Create a new user
    const user = new User({
      ...storedData.userData,
      password: hashedPassword,
      isEmailVerified: true, // Mark email as verified
    });

    await user.save();

    // Cleanup the temporary storage
    delete tempStorage[email];

    return res
      .status(201)
      .json({ message: "Email verified and user registered successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Resend verification code functionality
export const resendVerificationCode = async (req, res) => {
  try {
    const { verificationCode } = req.body;

    // Ensure the verification code is provided
    if (!verificationCode) {
      return res
        .status(400)
        .json({ message: "Verification code is required." });
    }

    // Parse the verification code to a number
    const parsedCode = parseInt(verificationCode, 10);

    // Log tempStorage for debugging
    console.log("Temp Storage:", tempStorage);

    // Find the user entry in tempStorage using the verification code
    const storedEntry = Object.entries(tempStorage).find(
      ([email, data]) => parseInt(data.verificationCode) === parsedCode
    );

    console.log("Provided Code:", parsedCode);
    console.log("Stored Entry:", storedEntry);

    if (!storedEntry) {
      return res.status(400).json({
        message:
          "No signup process found for this verification code. Please sign up again.",
      });
    }

    const [email, storedData] = storedEntry;

    // Generate a new 6-digit verification code
    const newCode = Math.floor(100000 + Math.random() * 900000);

    // Update tempStorage with the new code and expiration time
    storedData.verificationCode = newCode;
    storedData.expiresAt = Date.now() + 1 * 60 * 1000; // Expires in 1 minutes
    storedData.isExpired = false; // Reset the expired status

    // Log the updated tempStorage for debugging
    console.log("Updated Temp Storage:", tempStorage);

    // Send the new verification code via email
    await sendVerificationEmail(email, newCode);

    return res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//   try {
//       const { email } = req.body;

//       // Ensure email is provided
//       if (!email) {
//           return res.status(400).json({ message: "Email is required." });
//       }

//       const normalizedEmail = email.toLowerCase();

//       // Check if the email exists in tempStorage
//       const userEntry = tempStorage[normalizedEmail];

//       // Debugging
//       console.log("User Entry:", userEntry);

//       if (!userEntry) {
//           return res.status(400).json({ message: "No signup process found for this email. Please sign up again." });
//       }

//       // Generate a new 6-digit verification code
//       const newCode = Math.floor(100000 + Math.random() * 900000);

//       // Update tempStorage with the new code and expiration time
//       tempStorage[normalizedEmail].verificationCode = newCode;
//       tempStorage[normalizedEmail].expiresAt = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

//       // Send the new verification code via email
//       await sendVerificationEmail(normalizedEmail, newCode);

//       return res.status(200).json({
//           message: "A new verification code has been sent to your email.",
//       });
//   } catch (error) {
//       return res.status(500).json({ message: error.message });
//   }
// };
