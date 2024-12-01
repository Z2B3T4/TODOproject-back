const request = require("supertest");
const app = require("../app");

describe("POST /todo/tasks", () => {
  it("should create a new task successfully", async () => {
    const response = await request(app).post("/todo/tasks").send({
      name: "Test Task",
      startTime: "2024-12-01",
      endTime: "2024-12-05",
      group: "Test Group",
      isImportant: true,
      category: "Test Category",
    });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.msg).toBe("添加成功");
  });

  it("should fail if group does not exist", async () => {
    const response = await request(app).post("/todo/tasks").send({
      name: "Test Task",
      startTime: "2024-12-01",
      endTime: "2024-12-05",
      group: "Non-existent Group",
      isImportant: true,
      category: "Test Category",
    });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(400);
    expect(response.body.msg).toBe("分组不存在，请先新建");
  });
});
