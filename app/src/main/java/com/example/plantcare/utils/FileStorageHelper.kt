package com.example.plantcare.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

object FileStorageHelper {
    fun saveImageFromUri(context: Context, uri: Uri): String? {
        try {
            val inputStream = context.contentResolver.openInputStream(uri) ?: return null
            val originalBitmap = BitmapFactory.decodeStream(inputStream)
            inputStream.close()

            // Resize max 1280px longest side (FIL-02)
            val maxSide = 1280
            val width = originalBitmap.width
            val height = originalBitmap.height
            var targetWidth = width
            var targetHeight = height

            if (width > maxSide || height > maxSide) {
                if (width > height) {
                    targetWidth = maxSide
                    targetHeight = (maxSide.toFloat() / width * height).toInt()
                } else {
                    targetHeight = maxSide
                    targetWidth = (maxSide.toFloat() / height * width).toInt()
                }
            }

            val resizedBitmap = Bitmap.createScaledBitmap(originalBitmap, targetWidth, targetHeight, true)

            // Save to filesDir/jurnal/
            val jurnalDir = File(context.filesDir, "jurnal")
            if (!jurnalDir.exists()) {
                jurnalDir.mkdirs()
            }

            val fileName = "jurnal_${UUID.randomUUID()}.jpg"
            val file = File(jurnalDir, fileName)

            val outputStream = FileOutputStream(file)
            resizedBitmap.compress(Bitmap.CompressFormat.JPEG, 80, outputStream)
            outputStream.flush()
            outputStream.close()

            return file.absolutePath
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    fun deleteImageFile(path: String?): Boolean {
        if (path.isNullOrEmpty()) return false
        try {
            val file = File(path)
            if (file.exists()) {
                return file.delete()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return false
    }
}
