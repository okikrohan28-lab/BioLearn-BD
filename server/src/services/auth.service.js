const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const env = require('../config/env');

const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  });
};

const registerStudent = async ({ name, email, phone, password }) => {
  const existingStudent = await Student.findOne({ email: email.toLowerCase() });
  if (existingStudent) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await Student.hashPassword(password);
  const student = await Student.create({
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    password_hash,
    status: 'active',
  });

  const token = generateToken({
    id: student._id,
    role: 'student',
    email: student.email,
  });

  return {
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      role: 'student',
      status: student.status,
    },
    token,
  };
};

const loginStudent = async ({ email, password }) => {
  const student = await Student.findOne({ email: email.toLowerCase() }).select('+password_hash');
  if (!student) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  if (student.status !== 'active') {
    const error = new Error('Your student account is not active. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await student.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: student._id,
    role: 'student',
    email: student.email,
  });

  return {
    student: {
      id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      role: 'student',
      status: student.status,
    },
    token,
  };
};

const loginAdmin = async ({ email, password }) => {
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password_hash');
  if (!admin) {
    const error = new Error('Invalid admin email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid admin email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: admin._id,
    role: admin.role,
    email: admin.email,
  });

  return {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token,
  };
};

const getStudentProfile = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Student profile not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: student._id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    role: 'student',
    status: student.status,
    created_at: student.created_at,
  };
};

const updateStudentProfile = async (studentId, { name, phone }) => {
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone.trim();

  const updatedStudent = await Student.findByIdAndUpdate(
    studentId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedStudent) {
    const error = new Error('Student profile not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: updatedStudent._id,
    name: updatedStudent.name,
    email: updatedStudent.email,
    phone: updatedStudent.phone,
    role: 'student',
    status: updatedStudent.status,
    updated_at: updatedStudent.updated_at,
  };
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  getStudentProfile,
  updateStudentProfile,
};
