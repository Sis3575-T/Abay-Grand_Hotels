import jwt from "jsonwebtoken"
const adminAuth = async (req, res, next) => {
 try {
    const {token} = req.headers
    if(!token){
        return res.json({success: false, message: "unauthorized user"})
    }
    const token_decode = jwt.verify(token,process.env.JWT_SECRET);
    if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD)
    {
        return res.json({success: false, message: "user not authorized" })
    }
    next()
 } catch (error) {
    return res.json({ success: false, message: "Authentication not successful"})
 }
}
export default adminAuth