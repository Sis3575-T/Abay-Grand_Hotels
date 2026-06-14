import Maintenance from '../models/maintenanceModels.js'

const createRequest = async (req, res) => {
  try {
    const { roomId, roomName, issue, description, assignedTo, priority } = req.body
    if (!issue) return res.status(400).json({ success: false, message: 'Issue description is required' })
    const request = new Maintenance({ roomId, roomName, issue, description, assignedTo, priority: priority || 'Medium' })
    await request.save()
    res.json({ success: true, message: 'Maintenance request created', request })
  } catch (error) {
    console.error('createRequest error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error creating request' })
  }
}

const listRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find().sort({ createdAt: -1 })
    res.json({ success: true, requests })
  } catch (error) {
    console.error('listRequests error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching requests' })
  }
}

const updateRequest = async (req, res) => {
  try {
    const { roomId, roomName, issue, description, assignedTo, priority, status } = req.body
    const updateData = {}
    if (roomId !== undefined) updateData.roomId = roomId
    if (roomName !== undefined) updateData.roomName = roomName
    if (issue !== undefined) updateData.issue = issue
    if (description !== undefined) updateData.description = description
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (priority !== undefined) updateData.priority = priority
    if (status !== undefined) updateData.status = status
    if (status === 'Completed') updateData.completedAt = Date.now()
    const updated = await Maintenance.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!updated) return res.status(404).json({ success: false, message: 'Request not found' })
    res.json({ success: true, message: 'Request updated', request: updated })
  } catch (error) {
    console.error('updateRequest error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating request' })
  }
}

const deleteRequest = async (req, res) => {
  try {
    const deleted = await Maintenance.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Request not found' })
    res.json({ success: true, message: 'Request deleted' })
  } catch (error) {
    console.error('deleteRequest error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting request' })
  }
}

export { createRequest, listRequests, updateRequest, deleteRequest }
