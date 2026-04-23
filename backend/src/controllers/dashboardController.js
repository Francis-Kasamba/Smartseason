import { catchAsync } from '../middleware/errorHandler.js'
import { getDashboardDataForAdmin, getDashboardDataForAgent } from '../services/dashboardService.js'

export const getDashboard = catchAsync(async (req, res) => {
  const data = req.user.role === 'admin'
    ? await getDashboardDataForAdmin()
    : await getDashboardDataForAgent(req.user.id)
  res.json(data)
})
