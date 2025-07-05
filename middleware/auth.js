import jwt from "jsonwebtoken";

const JWT_SECRET = "apple";

export const isAuthenticated = (req, res, next) => {
  //console.log("Cookies:", req.cookies);
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains id and role
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (roles) => {
  return (req, res, next) => {
    // console.log('User role:', req.user?.role);
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient privileges" });
    }
    next();
  };
};
