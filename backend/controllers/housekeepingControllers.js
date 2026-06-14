import Housekeeping from '../models/housekeepingModels.js'

const createTask = async (req, res) => {
  try {
    const { roomId, roomName, assignedTo, status, notes } = req.body
    const task = new Housekeeping({ roomId, roomName, assignedTo, status: status || 'Dirty', notes })
    await task.save()
    res.json({ success: true, message: 'Cleaning task created', task })
  } catch (error) {
    console.error('createTask error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error creating task' })
  }
}

const listTasks = async (req, res) => {
  try {
    const tasks = await Housekeeping.find().sort({ createdAt: -1 })
    res.json({ success: true, tasks })
  } catch (error) {
    console.error('listTasks error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error fetching tasks' })
  }
}

const updateTask = async (req, res) => {
  try {
    const { roomId, roomName, assignedTo, status, notes } = req.body
    const updateData = {}
    if (roomId !== undefined) updateData.roomId = roomId
    if (roomName !== undefined) updateData.roomName = roomName
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (status === 'Clean') updateData.completedAt = Date.now()
    const updated = await Housekeeping.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!updated) return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, message: 'Task updated', task: updated })
  } catch (error) {
    console.error('updateTask error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error updating task' })
  }
}

const deleteTask = async (req, res) => {
  try {
    const deleted = await Housekeeping.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Task not found' })
    res.json({ success: true, message: 'Task deleted' })
  } catch (error) {
    console.error('deleteTask error:', error?.message || error)
    res.status(500).json({ success: false, message: 'Error deleting task' })
  }
}

export { createTask, listTasks, updateTask, deleteTask }
