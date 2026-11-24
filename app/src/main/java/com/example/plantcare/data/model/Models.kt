package com.example.plantcare.data.model

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)

data class User(
    val id: Int,
    val nama: String,
    val email: String,
    val role: String,
    val created_at: String?
)

data class AuthData(
    val user: User,
    val access_token: String,
    val refresh_token: String
)

data class RefreshData(
    val access_token: String
)

data class Category(
    val id: Int,
    val nama: String,
    val deskripsi: String?,
    val kebutuhan_cahaya: String,
    val created_at: String?
)

data class TreatmentType(
    val id: Int,
    val nama: String,
    val satuan: String,
    val deskripsi: String?,
    val created_at: String?
)

data class Plant(
    val id: Int,
    val user_id: Int,
    val category_id: Int,
    val nama: String,
    val nama_latin: String?,
    val tanggal_tanam: String,
    val lokasi: String?,
    val jumlah: Int,
    val catatan: String?,
    val category_nama: String?,
    val owner_nama: String?,
    val schedules: List<Schedule>?,
    val journals: List<Journal>?,
    val created_at: String?
)

data class Schedule(
    val id: Int,
    val plant_id: Int,
    val treatment_type_id: Int,
    val interval_hari: Int,
    val tanggal_berikutnya: String,
    val jam_perawatan: String?,
    val status: String,
    val catatan: String?,
    val plant_nama: String?,
    val treatment_nama: String?,
    val satuan: String?,
    val is_overdue: Boolean?,
    val created_at: String?
)

data class Journal(
    val id: Int,
    val plant_id: Int,
    val tanggal: String,
    val tinggi_cm: Double?,
    val jumlah_daun: Int?,
    val kondisi: String,
    val catatan: String?,
    val foto_path: String?,
    val plant_nama: String?,
    val created_at: String?
)
