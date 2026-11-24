package com.example.plantcare.data.network

import com.example.plantcare.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // Auth
    @POST("api/auth/register")
    suspend fun register(@Body body: Map<String, String>): Response<ApiResponse<User>>

    @POST("api/auth/login")
    suspend fun login(@Body body: Map<String, String>): Response<ApiResponse<AuthData>>

    @POST("api/auth/refresh")
    suspend fun refreshToken(@Body body: Map<String, String>): Response<ApiResponse<RefreshData>>

    @POST("api/auth/logout")
    suspend fun logout(@Body body: Map<String, String?>): Response<ApiResponse<Any>>

    @GET("api/auth/profile")
    suspend fun getProfile(): Response<ApiResponse<User>>

    // Categories
    @GET("api/categories")
    suspend fun getCategories(@Query("search") search: String? = null): Response<ApiResponse<List<Category>>>

    @GET("api/categories/{id}")
    suspend fun getCategoryById(@Path("id") id: Int): Response<ApiResponse<Category>>

    @POST("api/categories")
    suspend fun createCategory(@Body body: Map<String, String?>): Response<ApiResponse<Category>>

    @PUT("api/categories/{id}")
    suspend fun updateCategory(@Path("id") id: Int, @Body body: Map<String, String?>): Response<ApiResponse<Category>>

    @DELETE("api/categories/{id}")
    suspend fun deleteCategory(@Path("id") id: Int): Response<ApiResponse<Any>>

    // Treatment Types
    @GET("api/treatments")
    suspend fun getTreatments(@Query("search") search: String? = null): Response<ApiResponse<List<TreatmentType>>>

    @POST("api/treatments")
    suspend fun createTreatment(@Body body: Map<String, String?>): Response<ApiResponse<TreatmentType>>

    @PUT("api/treatments/{id}")
    suspend fun updateTreatment(@Path("id") id: Int, @Body body: Map<String, String?>): Response<ApiResponse<TreatmentType>>

    @DELETE("api/treatments/{id}")
    suspend fun deleteTreatment(@Path("id") id: Int): Response<ApiResponse<Any>>

    // Plants
    @GET("api/plants")
    suspend fun getPlants(@Query("search") search: String? = null, @Query("category_id") categoryId: Int? = null): Response<ApiResponse<List<Plant>>>

    @GET("api/plants/{id}")
    suspend fun getPlantById(@Path("id") id: Int): Response<ApiResponse<Plant>>

    @POST("api/plants")
    suspend fun createPlant(@Body body: Map<String, Any?>): Response<ApiResponse<Plant>>

    @PUT("api/plants/{id}")
    suspend fun updatePlant(@Path("id") id: Int, @Body body: Map<String, Any?>): Response<ApiResponse<Plant>>

    @DELETE("api/plants/{id}")
    suspend fun deletePlant(@Path("id") id: Int): Response<ApiResponse<Any>>

    // Schedules
    @GET("api/schedules")
    suspend fun getSchedules(@Query("search") search: String? = null, @Query("status") status: String? = null, @Query("plant_id") plantId: Int? = null): Response<ApiResponse<List<Schedule>>>

    @GET("api/schedules/home")
    suspend fun getHomeSchedules(): Response<ApiResponse<List<Schedule>>>

    @POST("api/schedules")
    suspend fun createSchedule(@Body body: Map<String, Any?>): Response<ApiResponse<Schedule>>

    @PUT("api/schedules/{id}/done")
    suspend fun markScheduleDone(@Path("id") id: Int): Response<ApiResponse<Schedule>>

    @PUT("api/schedules/{id}")
    suspend fun updateSchedule(@Path("id") id: Int, @Body body: Map<String, Any?>): Response<ApiResponse<Schedule>>

    @DELETE("api/schedules/{id}")
    suspend fun deleteSchedule(@Path("id") id: Int): Response<ApiResponse<Any>>

    // Journals
    @GET("api/journals")
    suspend fun getJournals(@Query("search") search: String? = null, @Query("kondisi") kondisi: String? = null, @Query("plant_id") plantId: Int? = null): Response<ApiResponse<List<Journal>>>

    @GET("api/journals/{id}")
    suspend fun getJournalById(@Path("id") id: Int): Response<ApiResponse<Journal>>

    @POST("api/journals")
    suspend fun createJournal(@Body body: Map<String, Any?>): Response<ApiResponse<Journal>>

    @PUT("api/journals/{id}")
    suspend fun updateJournal(@Path("id") id: Int, @Body body: Map<String, Any?>): Response<ApiResponse<Journal>>

    @DELETE("api/journals/{id}")
    suspend fun deleteJournal(@Path("id") id: Int): Response<ApiResponse<Any>>
}
