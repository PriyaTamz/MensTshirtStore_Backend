import jwt from "jsonwebtoken";

// Middleware to check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated. Please login." });
  }

  try {
    // Verify the token using the secret from your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // The decoded payload (e.g., { id, role }) is attached to the request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Middleware to authorize roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user is available because isAuthenticated runs first
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
      });
    }
    next();
  };
};