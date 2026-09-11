import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../user/user.model.js";
import CashLedger from "../ledger/cashLedger.model.js";

const INITIAL_CASH = 1000000;

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const register = async ({ fullName, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const passwordHash = await bcrypt.hash(password, 10);

    const users = await User.create(
      [
        {
          fullName,
          email,
          passwordHash,
        },
      ],
      { session }
    );

    const user = users[0];

    await CashLedger.create(
      [
        {
          user: user._id,
          type: "INITIAL_CREDIT",
          amount: INITIAL_CASH,
          balanceAfter: INITIAL_CASH,
          description: "Initial paper trading balance",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const token = generateToken(user._id);

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    token,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};