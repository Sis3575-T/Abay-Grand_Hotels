import jwt from "jsonwebtoken"

const adminAuth = async (req, res, next) => {
  try {
    let token = req.headers.token
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.json({ success: false, message: "unauthorized user" })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (typeof decoded === 'object' && decoded.email && decoded.password) {
      const emailMatch = decoded.email === process.env.ADMIN_EMAIL
      const passMatch = decoded.password === process.env.ADMIN_PASSWORD
      if (!emailMatch || !passMatch) {
        return res.json({ success: false, message: "user not authorized" })
      }
      req.admin = {
        userId: decoded.email,
        name: decoded.name || 'Administrator',
        role: decoded.role || 'Admin',
      }
    } else {
      const tokenStr = typeof decoded === 'string' ? decoded : String(decoded)
      if (tokenStr !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
        return res.json({ success: false, message: "user not authorized" })
      }
      req.admin = {
        userId: process.env.ADMIN_EMAIL,
        name: process.env.ADMIN_NAME || 'Administrator',
        role: process.env.ADMIN_ROLE || 'Admin',
      }
    }
    next()
  } catch (error) {
    return res.json({ success: false, message: "Authentication not successful" })
  }
}

export default adminAuth
