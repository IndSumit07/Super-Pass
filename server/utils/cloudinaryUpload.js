// utils/cloudinaryUpload.js
import cloudinary from "../configs/cloudinary.config.js";

/**
 * Upload a buffer to Cloudinary via upload_stream.
 * @param {Buffer} buffer
 * @param {Object} options { folder, public_id, transformation? }
 */
export const uploadBuffer = (
  buffer,
  { folder, public_id, transformation } = {}
) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        resource_type: "image",
        overwrite: true,
        transformation,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export const deleteByPublicId = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (e) {
    // swallow delete errors to not block main flow
    return null;
  }
};
