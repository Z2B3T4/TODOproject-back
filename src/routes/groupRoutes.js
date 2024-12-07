const express = require("express");
const groupController = require("../controllers/groupController");
const router = express.Router();

// 创建新组别
router.post("/", groupController.createGroup);
// 获取所有分组信息
router.get("/", groupController.getAllGroups);
// 修改
router.put("/", groupController.updateGroup);
// 删除
router.delete("/:id", groupController.deleteGroupById);
module.exports = router;
