exports.success = (res, msg = "操作成功", data = {}) => {
  res.status(200).json({
    code: 200,
    msg,
    data,
  });
};

exports.error = (res, msg = "操作失败", code = 500) => {
  res.status(code).json({
    code,
    msg,
    data: {},
  });
};
