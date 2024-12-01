const GroupModel = require("../models/groupModel");
const { format } = require("date-fns");
exports.createGroup = async (groupData) => {
  try {
    // 将请求数据封装为 GroupModel 实例
    const group = new GroupModel(groupData);

    // 检查组别名称是否已存在
    const exists = await GroupModel.exists(group.name);
    if (exists) {
      return { code: 400, msg: "组别名称已存在", data: {} };
    }

    // 创建组别
    await GroupModel.create({
      name: group.name,
      description: group.description,
      priority: group.priority,
    });

    return { code: 200, msg: "添加成功", data: {} };
  } catch (error) {
    console.error("Error in createGroup:", error.message);
    throw new Error("数据库操作失败");
  }
};
exports.getAllGroups = async () => {
  try {
    // 查询所有未被逻辑删除的分组
    const groups = await GroupModel.getAll();

    // 格式化日期字段
    const formattedGroups = groups.map((group) => ({
      ...group,
      created_at: group.created_at
        ? format(new Date(group.created_at), "yyyy-MM-dd")
        : null,
      updated_at: group.updated_at
        ? format(new Date(group.updated_at), "yyyy-MM-dd")
        : null,
    }));

    return { code: 200, msg: "查询成功", data: formattedGroups };
  } catch (error) {
    console.error("Error in getAllGroups:", error.message);
    throw new Error("数据库操作失败");
  }
};
exports.updateGroup = async (groupData) => {
  try {
    const { id, name, description, priority } = groupData;

    // 检查组别是否存在
    const exists = await GroupModel.existsById(id);
    if (!exists) {
      return { code: 400, msg: "组别不存在", data: {} };
    }

    // 检查组别名称是否重复
    if (name) {
      const nameExists = await GroupModel.existsByName(name, id);
      if (nameExists) {
        return { code: 400, msg: "组别名称已存在", data: {} };
      }
    }

    // 更新组别信息
    await GroupModel.updateById({ id, name, description, priority });

    return { code: 200, msg: "修改成功", data: {} };
  } catch (error) {
    console.error("Error in updateGroup:", error.message);
    throw new Error("数据库操作失败");
  }
};
