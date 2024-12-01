const taskService = require("../services/taskService");
const { success, error } = require("../utils/response");

exports.createTask = async (req, res) => {
  try {
    const {
      name,
      startTime,
      endTime,
      group,
      isImportant,
      categoryId,
      type,
      taskId,
    } = req.body;

    // 验证必填字段
    if (!name) {
      return error(res, "任务名称是必填项", 400);
    }

    // 调用服务层创建任务
    await taskService.createTask({
      name,
      startTime,
      endTime,
      group,
      isImportant,
      categoryId,
      type,
      taskId,
    });

    success(res, "添加成功");
  } catch (err) {
    console.error("Error in createTask:", err.message);
    error(res, "服务器错误");
  }
};
const TaskModel = require("../models/TaskModel");

exports.updateTask = async (req, res) => {
  try {
    // 通过 TaskModel 接收前端传递的数据
    const task = new TaskModel(req.body);

    // 调用服务层进行更新
    const result = await taskService.updateTask(task);

    // 返回结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateTask:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};
exports.deleteTask = async (req, res) => {
  try {
    // 获取请求体中的参数
    const { id, type } = req.body;

    // 调用服务层删除任务
    const result = await taskService.deleteTask({ id, type });

    // 返回服务层的结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in deleteTask:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};
exports.getTasks = async (req, res) => {
  try {
    // 获取路径参数 type
    const { type, flag } = req.query;

    // 转换 type 为整数
    const typeValue = parseInt(type, 10);
    const flagValue = parseInt(flag, 10);
    console.log(typeValue, flagValue);
    // 调用服务层获取数据
    const result = await taskService.getTasks(typeValue, flagValue);

    // 返回服务层的结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getIncompleteTasks:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: [] });
  }
};
exports.getSubTasks = async (req, res) => {
  try {
    // 获取路径参数 type
    const { id } = req.params;

    // 转换 type 为整数
    const Intid = parseInt(id, 10);
    // 调用服务层获取数据
    const result = await taskService.getSubTasks(Intid);

    // 返回服务层的结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getIncompleteTasks:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: [] });
  }
};
exports.finishTask = async (req, res) => {
  try {
    // 获取请求体中的参数
    const { id, type } = req.body;

    // 调用服务层完成任务
    const result = await taskService.finishTask({ id, type });

    // 返回服务层的结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in finishTask:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};
exports.getTasksByPage = async (req, res) => {
  try {
    // 从查询参数中获取分页参数
    const { page, pageSize, flag } = req.query;
    console.log(page, pageSize);
    // 转换为整数
    const pageInt = parseInt(page, 10);
    const pageSizeInt = parseInt(pageSize, 10);
    const flagInt = parseInt(flag, 10);

    // 验证分页参数
    if (
      isNaN(pageInt) ||
      isNaN(pageSizeInt) ||
      pageInt < 1 ||
      pageSizeInt < 1 ||
      flag > 3 ||
      flag < 0
    ) {
      return res
        .status(400)
        .json({ code: 400, msg: "分页参数缺失或无效", data: [] });
    }

    // 调用服务层
    const result = await taskService.getTasksByPage({
      page: pageInt,
      pageSize: pageSizeInt,
      flag: flagInt,
    });

    // 返回结果
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getTasksByPage:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: [] });
  }
};
exports.searchTasks = async (req, res) => {
  try {
    // 获取查询参数
    const searchParams = req.body;

    // 调用服务层
    const result = await taskService.searchTasks(searchParams);

    // 返回结果
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in searchTasks:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: [] });
  }
};
