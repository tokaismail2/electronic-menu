import multer, { Multer } from "multer";


const storage = multer.memoryStorage();


const baseUpload: Multer = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});


function withErrorHandler(multerMiddleware: any) {
  return (req: any, res: any, next: any) => {
    multerMiddleware(req, res, (err: any) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "error",
          message: "Image size should not exceed 2MB",
        });
      } else if (err) {
        return res.status(400).json({
          status: "error",
          message: err.message,
        });
      }
      next();
    });
  };
}


export default {
  single: (field: string) => withErrorHandler(baseUpload.single(field)),
  fields: (fields: multer.Field[]) =>
    withErrorHandler(baseUpload.fields(fields)),
  array: (field: string, maxCount: number) =>
    withErrorHandler(baseUpload.array(field, maxCount)),
  any: () => withErrorHandler(baseUpload.any()),
};
