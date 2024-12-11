const express = require("express");
const taskController = require("../controllers/taskController");
const router = express.Router();

// 创建任务
router.post("/", taskController.createTask);
// 更新任务
router.put("/", taskController.updateTask);
// 删除任务
router.delete("/", taskController.deleteTask);
// 根据一级分类的id查询对应的二级分类的数据
router.get("/subtasks/:id", taskController.getSubTasks);
// 条件查询任务
router.post("/search", taskController.searchTasks);
// 完成任务
router.put("/finish", taskController.finishTask);

module.exports = router;
