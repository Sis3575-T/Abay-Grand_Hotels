import Role from '../models/roleModels.js'

const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body
    if (!name) return res.status(400).json({ success: false, message: 'Role name is required' })
    const existing = await Role.findOne({ name })
    if (existing) return res.status(400).json({ success: false, message: 'Role already exists' })
    const role = new Role({ name, permissions: permissions || [] })
    await role.save()
    res.json({ success: true, message: 'Role created successfully', role })
  } catch (error) {
    console.error('createRole error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error creating role' })
  }
}

const listRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 })
    res.json({ success: true, roles })
  } catch (error) {
    console.error('listRoles error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching roles' })
  }
}

const updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (permissions !== undefined) updateData.permissions = permissions
    const updated = await Role.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!updated) return res.status(404).json({ success: false, message: 'Role not found' })
    res.json({ success: true, message: 'Role updated successfully', role: updated })
  } catch (error) {
    console.error('updateRole error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating role' })
  }
}

const deleteRole = async (req, res) => {
  try {
    const deleted = await Role.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Role not found' })
    res.json({ success: true, message: 'Role deleted successfully' })
  } catch (error) {
    console.error('deleteRole error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting role' })
  }
}

export { createRole, listRoles, updateRole, deleteRole }
