const groupService = require("../services/groupService");

exports.createGroup = async (req, res) => {
  try {
    const { name, description, priority } = req.body;

    // 参数校验
    if (!name) {
      return res
        .status(400)
        .json({ code: 400, msg: "组别名称是必填项", data: {} });
    }
    console.log("controller - priority", priority);
    // 调用服务层
    const result = await groupService.createGroup({
      name,
      description,
      priority,
    });

    // 返回结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in createGroup:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    // 调用服务层获取数据
    const result = await groupService.getAllGroups();

    // 返回结果
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in getAllGroups:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: [] });
  }
};
exports.updateGroup = async (req, res) => {
  try {
    const { id, name, description, priority } = req.body;

    // 参数校验
    if (!id) {
      return res
        .status(400)
        .json({ code: 400, msg: "分组 ID 是必填项", data: {} });
    }

    // 调用服务层
    const result = await groupService.updateGroup({
      id,
      name,
      description,
      priority,
    });

    // 返回结果
    if (result.code === 400) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in updateGroup:", err.message);
    res.status(500).json({ code: 500, msg: "服务器错误", data: {} });
  }
};
exports.deleteGroupById = async (req, res) => {
  const { id } = req.params;

  // 参数校验
  if (!id) {
    return res
      .status(400)
      .json({ code: 400, msg: "分组 ID 是必填项", data: {} });
  }

  // 调用服务层
  const result = await groupService.deleteGroupById(id);
  res.status(200).json(result);
};
