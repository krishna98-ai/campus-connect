import express from "express";

import { protect, authorize } from "../middleware/auth.js";
import {
  getDashboard,
  getUsers,
  toggleUserActive,
  deleteUser,
  getReportedContent,
  changeUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

// Only logged-in admins can access these routes
router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.put("/users/:id/toggle-active", toggleUserActive);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", changeUserRole);
router.get("/reported", getReportedContent);

export default router;
