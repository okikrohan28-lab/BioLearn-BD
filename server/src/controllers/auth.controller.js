const authService = require('../services/auth.service');

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const result = await authService.registerStudent({ name, email, phone, password });
    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginStudent({ email, password });
    res.status(200).json({
      success: true,
      message: 'Student login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin({ email, password });
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getStudentProfile(req.user._id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updated = await authService.updateStudentProfile(req.user._id, { name, phone });
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
  getProfile,
  updateProfile,
};
