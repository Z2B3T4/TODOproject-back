const pool = require("../db");
const { format } = require("date-fns");
const TaskModel = require("../models/TaskModel");
const { server } = require("../config");
exports.createTask = async ({
  name,
  startTime,
  endTime,
  groupId,
  isImportant,
  category,
  type,
  taskId, // 当 type 为 2 时，表示主任务的 ID
}) => {
  try {
    // 验证参数
    if (!name || !type) {
      throw new Error("任务名称和类型是必填项");
    }
    console.log(taskId);
    // 初始化插入表的变量
    let tableName;
    let fields;
    let values;
    // 根据类型决定插入主任务还是子任务
    if (type === 1) {
      // 主任务
      tableName = "tasks";
      fields = `(name, start_time, end_time, group_id, category_id, is_important, type)`;
      values = [
        name,
        startTime || null,
        endTime || null,
        groupId || 0,
        category || 0,
        isImportant ? 1 : 0,
        type,
      ];
    } else if (type === 2) {
      // 子任务
      if (!taskId) {
        throw new Error("创建子任务时必须提供主任务 ID");
      }
      tableName = "subtasks";
      fields = `(name, start_time, end_time, task_id, is_important)`;
      values = [
        name,
        startTime || null,
        endTime || null,
        taskId,
        isImportant ? 1 : 0,
      ];
    } else {
      throw new Error("无效的任务类型");
    }

    // 插入数据
    const [result] = await pool.query(
      `
      INSERT INTO ${tableName} ${fields}
      VALUES (${values.map(() => "?").join(", ")})
      `,
      values
    );

    return { code: 200, msg: "创建任务成功", data: { id: result.insertId } }; // 返回插入的任务 ID
  } catch (error) {
    console.error("Error in createTask:", error.message);
    throw new Error("数据库操作失败");
  }
};

exports.updateTask = async (taskData) => {
  try {
    // 将任务数据封装为 TaskModel
    const task = new TaskModel(taskData);

    // 检查任务 ID 是否存在
    if (!task.id) {
      throw new Error("任务 ID 是必填项");
    }

    // 确定目标表
    const tableName =
      task.type === 1 ? "tasks" : task.type === 2 ? "subtasks" : null;
    if (!tableName) {
      throw new Error("无效的任务类型");
    }

    // 获取当前任务信息
    const [currentTaskResult] = await pool.query(
      `SELECT id, sort FROM ${tableName} WHERE id = ?`,
      [task.id]
    );

    if (currentTaskResult.length === 0) {
      return { code: 400, msg: "任务不存在", data: {} };
    }

    const currentTask = currentTaskResult[0];
    const originalSort = currentTask.sort; // 原始排序值
    const newSort = task.sort; // 请求中的目标排序值

    // 如果排序值发生变化
    if (originalSort !== newSort) {
      // 调整其他任务的排序
      if (originalSort < newSort) {
        // 如果新的排序位置靠后，将范围内的任务的 `sort` 减 1
        await pool.query(
          `
          UPDATE ${tableName}
          SET sort = sort - 1
          WHERE sort > ? AND sort <= ?
          `,
          [originalSort, newSort]
        );
      } else {
        // 如果新的排序位置靠前，将范围内的任务的 `sort` 加 1
        await pool.query(
          `
          UPDATE ${tableName}
          SET sort = sort + 1
          WHERE sort >= ? AND sort < ?
          `,
          [newSort, originalSort]
        );
      }
    }

    // 更新当前任务数据
    const [result] = await pool.query(
      `
      UPDATE ${tableName}
      SET
        group_id = ?,
        category_id = ?,
        start_time = ?,
        end_time = ?,
        is_important = ?,
        name = ?,
        sort = ?,
        progress_num = ?,
        type = ?
      WHERE id = ?
      `,
      [
        task.groupId,
        task.categoryId,
        task.startTime || null,
        task.endTime || null,
        task.isImportant ? 1 : 0,
        task.name,
        newSort, // 使用新的排序值
        task.progressNum,
        task.type,
        task.id,
      ]
    );

    if (result.affectedRows === 0) {
      return { code: 400, msg: "任务不存在或更新失败", data: {} };
    }

    return { code: 200, msg: "修改成功", data: {} };
  } catch (error) {
    console.error("Error in updateTask:", error.message);
    throw new Error("数据库操作失败");
  }
};

exports.deleteTask = async ({ id, type }) => {
  try {
    // 验证参数
    if (!id || !type) {
      throw new Error("任务 ID 和类型是必填项");
    }

    let tableName;
    if (type === 1) {
      tableName = "tasks";
    } else if (type === 2) {
      tableName = "subtasks";
    } else {
      return { code: 400, msg: "无效的任务类型", data: {} };
    }

    // 执行逻辑删除
    const [result] = await pool.query(
      `
      UPDATE ${tableName}
      SET is_deleted = 1
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return { code: 400, msg: "任务不存在或删除失败", data: {} };
    }

    return { code: 200, msg: "删除成功", data: {} };
  } catch (error) {
    console.error("Error in deleteTask:", error.message);
    throw new Error("数据库操作失败");
  }
};

exports.getTasks = async (type, flag) => {
  try {
    // 判断查询的表

    let tableName;
    if (type === 1) {
      tableName = "tasks";
    } else if (type === 2) {
      tableName = "subtasks";
    } else {
      return { code: 400, msg: "无效的任务类型", data: [] };
    }
    let sql = `SELECT * FROM ${tableName} `;
    if (flag == 0) {
      sql += `WHERE is_completed = 0 AND is_deleted = 0 ORDER BY sort`;
    } else if (flag == 1) {
      sql += `WHERE is_completed = 1 AND is_deleted = 0 ORDER BY sort`;
    } else if (flag == 2) {
      sql += `WHERE is_deleted = 1 ORDER BY sort`;
    }
    // 查询未完成任务
    const [rows] = await pool.query(sql);

    // 格式化时间字段为 yyyy-mm-dd
    const formattedRows = rows.map((row) => ({
      ...row,
      start_time: row.start_time
        ? format(new Date(row.start_time), "yyyy-MM-dd")
        : null,
      end_time: row.end_time
        ? format(new Date(row.end_time), "yyyy-MM-dd")
        : null,
      created_at: row.created_at
        ? format(new Date(row.created_at), "yyyy-MM-dd")
        : null,
      updated_at: row.updated_at
        ? format(new Date(row.updated_at), "yyyy-MM-dd")
        : null,
    }));

    return { code: 200, msg: "查询成功", data: formattedRows };
  } catch (error) {
    console.error("Error in getIncompleteTasks:", error.message);
    throw new Error("数据库操作失败");
  }
};

exports.getSubTasks = async (id) => {
  try {
    console.log(id);
    const [result] = await pool.query(
      `
      select * from subtasks where task_id = ?
      `,
      [id]
    );
    // 格式化时间字段为 yyyy-mm-dd
    const formattedRows = result.map((row) => ({
      ...row,
      start_time: row.start_time
        ? format(new Date(row.start_time), "yyyy-MM-dd")
        : null,
      end_time: row.end_time
        ? format(new Date(row.end_time), "yyyy-MM-dd")
        : null,
      created_at: row.created_at
        ? format(new Date(row.created_at), "yyyy-MM-dd")
        : null,
      updated_at: row.updated_at
        ? format(new Date(row.updated_at), "yyyy-MM-dd")
        : null,
    }));
    if (result.affectedRows === 0) {
      return { code: 400, msg: "任务不存在或操作失败", data: {} };
    }

    return { code: 200, msg: "获取二级分类成功", data: formattedRows };
  } catch (error) {
    console.error("Error in finishTask:", error.message);
    throw new Error("数据库操作失败");
  }
};
exports.finishTask = async ({ id, type }) => {
  try {
    // 验证参数
    if (!id || !type) {
      throw new Error("任务 ID 和类型是必填项");
    }

    // 判断表名
    let tableName;
    if (type === 1) {
      tableName = "tasks";
    } else if (type === 2) {
      tableName = "subtasks";
    } else {
      return { code: 400, msg: "无效的任务类型", data: {} };
    }

    // 更新任务状态为完成
    const [result] = await pool.query(
      `
      UPDATE ${tableName}
      SET is_completed = 1, progress_num = 100
      WHERE id = ? AND is_deleted = 0
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return { code: 400, msg: "任务不存在或操作失败", data: {} };
    }

    // 如果是主任务，更新所有子任务为完成状态
    if (type === 1) {
      await pool.query(
        `
        UPDATE subtasks
        SET is_completed = 1, progress_num = 100
        WHERE task_id = ? AND is_deleted = 0
        `,
        [id]
      );
    }

    // 如果是子任务，更新主任务的进度
    if (type === 2) {
      // 查询子任务的主任务 ID
      const [subtaskResult] = await pool.query(
        `
        SELECT * FROM subtasks WHERE id = ?
        `,
        [id]
      );

      if (!subtaskResult || subtaskResult.length === 0) {
        throw new Error("子任务不存在");
      }

      const subtask = subtaskResult[0];
      const task_id = subtask.task_id;

      // 查询与主任务相关的所有子任务
      const [subtasks] = await pool.query(
        `
        SELECT * FROM subtasks WHERE task_id = ?
        `,
        [task_id]
      );

      // 统计完成的子任务数量
      const completedCount = subtasks.filter(
        (subtask) => subtask.is_completed === 1
      ).length;

      // 计算比率（保留整数部分）
      const totalCount = subtasks.length;
      const completionRate =
        totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;

      // 更新主任务进度
      await pool.query(
        `
        UPDATE tasks
        SET progress_num = ?
        WHERE id = ? AND is_deleted = 0
        `,
        [completionRate, task_id]
      );
    }

    return { code: 200, msg: "完成任务成功", data: {} };
  } catch (error) {
    console.error("Error in finishTask:", error.message);
    throw new Error("数据库操作失败");
  }
};

exports.getTasksByPage = async ({ page, pageSize, flag }) => {
  try {
    // 验证分页参数
    if (!page || !pageSize || page < 1 || pageSize < 1) {
      return { code: 400, msg: "分页参数缺失或无效", data: [] };
    }

    const offset = (page - 1) * pageSize; // 计算偏移量

    let sql = `SELECT * FROM tasks `;
    if (flag == 0) {
      sql += `WHERE is_completed = 0 AND is_deleted = 0 ORDER BY sort`;
    } else if (flag == 1) {
      sql += `WHERE is_completed = 1 AND is_deleted = 0 ORDER BY sort`;
    } else if (flag == 2) {
      sql += `WHERE is_deleted = 1 ORDER BY sort`;
    }
    sql += ` LIMIT ? OFFSET ?`;
    console.log(sql);
    // 查询 tasks 表数据
    const [rows] = await pool.query(sql, [
      parseInt(pageSize),
      parseInt(offset),
    ]);

    // 格式化时间字段为 yyyy-MM-dd
    const formattedRows = rows.map((row) => ({
      ...row,
      start_time: row.start_time
        ? format(new Date(row.start_time), "yyyy-MM-dd")
        : null,
      end_time: row.end_time
        ? format(new Date(row.end_time), "yyyy-MM-dd")
        : null,
      created_at: row.created_at
        ? format(new Date(row.created_at), "yyyy-MM-dd")
        : null,
      updated_at: row.updated_at
        ? format(new Date(row.updated_at), "yyyy-MM-dd")
        : null,
    }));

    return { code: 200, msg: "查询成功", data: formattedRows };
  } catch (error) {
    console.error("Error in getTasksByPage:", error.message);
    throw new Error("数据库操作失败");
  }
};

exports.searchTasks = async (searchParams) => {
  try {
    const {
      name,
      startTime,
      endTime,
      groupId,
      categoryId,
      isImportant,
      flag,
      page = 1, // 默认第 1 页
      pageSize = 10, // 默认每页 10 条
    } = searchParams || {};

    // 基础 SQL 查询
    let sql = `
      SELECT *
      FROM tasks
      WHERE is_deleted = 0
    `;
    const params = [];

    // 类型查询条件
    if (flag === 0) {
      sql += " AND is_completed = 0"; // 未完成
    } else if (flag === 1) {
      sql += " AND is_completed = 1"; // 已完成
    } else if (flag === 2) {
      sql += " AND is_deleted = 1"; // 已删除
    }

    // 模糊查询：名称
    if (name) {
      sql += " AND name LIKE ?";
      params.push(`%${name}%`);
    }

    // 精确查询：组别 ID
    if (groupId) {
      sql += " AND group_id = ?";
      params.push(groupId);
    }

    // 精确查询：分类 ID
    if (categoryId) {
      sql += " AND category_id = ?";
      params.push(categoryId);
    }

    // 精确查询：是否重要
    if (isImportant !== undefined) {
      sql += " AND is_important = ?";
      params.push(isImportant);
    }

    // 时间范围查询：开始时间
    if (startTime) {
      sql += " AND start_time >= ?";
      params.push(startTime);
    }

    // 时间范围查询：结束时间
    if (endTime) {
      sql += " AND end_time <= ?";
      params.push(endTime);
    }

    // 排序
    sql += " ORDER BY sort";

    // 分页
    const offset = (page - 1) * pageSize;
    sql += " LIMIT ? OFFSET ?";
    params.push(parseInt(pageSize, 10), parseInt(offset, 10));

    // 执行查询
    const [rows] = await pool.query(sql, params);

    // 格式化时间字段
    const formattedRows = rows.map((row) => ({
      ...row,
      start_time: row.start_time
        ? format(new Date(row.start_time), "yyyy-MM-dd")
        : null,
      end_time: row.end_time
        ? format(new Date(row.end_time), "yyyy-MM-dd")
        : null,
      created_at: row.created_at
        ? format(new Date(row.created_at), "yyyy-MM-dd")
        : null,
      updated_at: row.updated_at
        ? format(new Date(row.updated_at), "yyyy-MM-dd")
        : null,
    }));

    // 计算总记录数
    const countSql = `
      SELECT COUNT(*) as total
      FROM tasks
      WHERE is_deleted = 0
    `;
    const [countRows] = await pool.query(countSql, []);
    const total = countRows[0]?.total || 0;

    return {
      code: 200,
      msg: "查询成功",
      data: formattedRows,
    };
  } catch (error) {
    console.error("Error in searchTasks:", error.message);
    throw new Error("数据库操作失败");
  }
};
