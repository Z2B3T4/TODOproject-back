class TaskModel {
  constructor({
    id = null,
    groupId = null,
    categoryId = null,
    startTime = null,
    endTime = null,
    isImportant = false,
    name,
    sort = 0,
    type = 1,
    progressNum = 0,
  }) {
    this.id = id; // 任务 ID
    this.groupId = groupId; // 分组名称
    this.categoryId = categoryId; // 分类名称
    this.startTime = startTime; // 开始时间
    this.endTime = endTime; // 结束时间
    this.isImportant = isImportant; // 是否重要
    this.name = name; // 任务名称
    this.sort = sort; // 排序
    this.type = type; // 类型
    this.progressNum = progressNum;
  }
}
module.exports = TaskModel;
