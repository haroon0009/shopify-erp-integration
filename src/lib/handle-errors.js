export const handleError = (res, error) => {
  let msg = error.toString();
  if (error?.response?.data) msg = error.response.data;

  return res.status(500).send({ error: msg });
};

export const handle404error = (res, msg) =>
  res.status(404).send({
    error: msg,
  });
