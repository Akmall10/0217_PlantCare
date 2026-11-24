// Format respons seragam: { success, message, data }
const ok = (res, data = null, message = 'Berhasil', status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, message = 'Terjadi kesalahan', status = 500, data = null) =>
  res.status(status).json({ success: false, message, data });

module.exports = { ok, fail };
