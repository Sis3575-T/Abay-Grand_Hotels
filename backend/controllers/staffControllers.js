import Staff from '../models/staffModels.js'

const addStaff = async (req, res) => {
  try {
    const { name, employeeId, role, department, phone, email, salary, status, joinDate } = req.body
    if (!name || !employeeId || !role) {
      return res.status(400).json({ success: false, message: 'Name, Employee ID, and Role are required' })
    }
    const existing = await Staff.findOne({ employeeId })
    if (existing) return res.status(400).json({ success: false, message: 'Employee ID already exists' })
    const staff = new Staff({ name, employeeId, role, department, phone, email, salary, status, joinDate })
    await staff.save()
    res.json({ success: true, message: 'Staff added successfully', staff })
  } catch (error) {
    console.error('addStaff error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error adding staff' })
  }
}

const listStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 })
    res.json({ success: true, staff })
  } catch (error) {
    console.error('listStaff error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching staff' })
  }
}

const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' })
    res.json({ success: true, staff })
  } catch (error) {
    console.error('getStaffById error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching staff' })
  }
}

const updateStaff = async (req, res) => {
  try {
    const { name, employeeId, role, department, phone, email, salary, status, joinDate } = req.body
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (employeeId !== undefined) updateData.employeeId = employeeId
    if (role !== undefined) updateData.role = role
    if (department !== undefined) updateData.department = department
    if (phone !== undefined) updateData.phone = phone
    if (email !== undefined) updateData.email = email
    if (salary !== undefined) updateData.salary = salary
    if (status !== undefined) updateData.status = status
    if (joinDate !== undefined) updateData.joinDate = joinDate
    const updated = await Staff.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!updated) return res.status(404).json({ success: false, message: 'Staff not found' })
    res.json({ success: true, message: 'Staff updated successfully', staff: updated })
  } catch (error) {
    console.error('updateStaff error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating staff' })
  }
}

const deleteStaff = async (req, res) => {
  try {
    const deleted = await Staff.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Staff not found' })
    res.json({ success: true, message: 'Staff deleted successfully' })
  } catch (error) {
    console.error('deleteStaff error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting staff' })
  }
}

export { addStaff, listStaff, getStaffById, updateStaff, deleteStaff }
