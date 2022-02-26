// global error handler
export const globalErrorHandler = (error, req, res, next) => {
  console.error(`Err in ${req.url}`, error);
  return res.status(error.status || 500).json({
    error: {
      message: error.status === 500 ? "Internal server error" : error.message,
      success: false,
    },
  });
};
