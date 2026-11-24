package com.example.plantcare.ui.viewmodel

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.plantcare.data.local.TokenManager
import com.example.plantcare.data.model.*
import com.example.plantcare.data.network.ApiService
import com.example.plantcare.data.network.RetrofitClient
import kotlinx.coroutines.launch

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val api: ApiService = RetrofitClient.create(application)
    val tokenManager = TokenManager(application)

    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)
    var isLoggedIn by mutableStateOf(!tokenManager.getAccessToken().isNullOrEmpty())

    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val res = api.login(mapOf("email" to email, "password" to pass))
                if (res.isSuccessful && res.body()?.success == true) {
                    val authData = res.body()?.data
                    if (authData != null) {
                        tokenManager.saveTokens(authData.access_token, authData.refresh_token)
                        tokenManager.saveUser(authData.user.id, authData.user.nama, authData.user.email, authData.user.role)
                        isLoggedIn = true
                        onSuccess()
                    }
                } else {
                    errorMessage = res.body()?.message ?: "Login gagal"
                }
            } catch (e: Exception) {
                errorMessage = e.localizedMessage ?: "Terjadi kesalahan jaringan"
            } finally {
                isLoading = false
            }
        }
    }

    fun register(nama: String, email: String, pass: String, confirmPass: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            isLoading = true
            errorMessage = null
            try {
                val res = api.register(mapOf("nama" to nama, "email" to email, "password" to pass, "konfirmasi_password" to confirmPass))
                if (res.isSuccessful && res.body()?.success == true) {
                    onSuccess()
                } else {
                    errorMessage = res.body()?.message ?: "Registrasi gagal"
                }
            } catch (e: Exception) {
                errorMessage = e.localizedMessage ?: "Terjadi kesalahan jaringan"
            } finally {
                isLoading = false
            }
        }
    }

    fun logout(onComplete: () -> Unit) {
        viewModelScope.launch {
            try {
                api.logout(mapOf("refresh_token" to tokenManager.getRefreshToken()))
            } catch (_: Exception) {}
            tokenManager.clear()
            isLoggedIn = false
            onComplete()
        }
    }
}

class PlantCareViewModel(application: Application) : AndroidViewModel(application) {
    private val api: ApiService = RetrofitClient.create(application)
    val tokenManager = TokenManager(application)

    var categories by mutableStateOf<List<Category>>(emptyList())
    var treatments by mutableStateOf<List<TreatmentType>>(emptyList())
    var plants by mutableStateOf<List<Plant>>(emptyList())
    var schedules by mutableStateOf<List<Schedule>>(emptyList())
    var homeSchedules by mutableStateOf<List<Schedule>>(emptyList())
    var journals by mutableStateOf<List<Journal>>(emptyList())

    var selectedPlant by mutableStateOf<Plant?>(null)
    var isLoading by mutableStateOf(false)
    var errorMessage by mutableStateOf<String?>(null)

    fun loadCategories(search: String? = null) {
        viewModelScope.launch {
            try {
                val res = api.getCategories(search)
                if (res.isSuccessful) categories = res.body()?.data ?: emptyList()
            } catch (_: Exception) {}
        }
    }

    fun loadTreatments(search: String? = null) {
        viewModelScope.launch {
            try {
                val res = api.getTreatments(search)
                if (res.isSuccessful) treatments = res.body()?.data ?: emptyList()
            } catch (_: Exception) {}
        }
    }

    fun loadPlants(search: String? = null, categoryId: Int? = null) {
        viewModelScope.launch {
            isLoading = true
            try {
                val res = api.getPlants(search, categoryId)
                if (res.isSuccessful) plants = res.body()?.data ?: emptyList()
            } catch (e: Exception) {
                errorMessage = e.localizedMessage
            } finally {
                isLoading = false
            }
        }
    }

    fun loadPlantDetail(id: Int) {
        viewModelScope.launch {
            isLoading = true
            try {
                val res = api.getPlantById(id)
                if (res.isSuccessful) selectedPlant = res.body()?.data
            } catch (e: Exception) {
                errorMessage = e.localizedMessage
            } finally {
                isLoading = false
            }
        }
    }

    fun loadSchedules(search: String? = null, status: String? = null, plantId: Int? = null) {
        viewModelScope.launch {
            isLoading = true
            try {
                val res = api.getSchedules(search, status, plantId)
                if (res.isSuccessful) schedules = res.body()?.data ?: emptyList()
            } catch (e: Exception) {
                errorMessage = e.localizedMessage
            } finally {
                isLoading = false
            }
        }
    }

    fun loadHomeSchedules() {
        viewModelScope.launch {
            try {
                val res = api.getHomeSchedules()
                if (res.isSuccessful) homeSchedules = res.body()?.data ?: emptyList()
            } catch (_: Exception) {}
        }
    }

    fun loadJournals(search: String? = null, kondisi: String? = null, plantId: Int? = null) {
        viewModelScope.launch {
            isLoading = true
            try {
                val res = api.getJournals(search, kondisi, plantId)
                if (res.isSuccessful) journals = res.body()?.data ?: emptyList()
            } catch (e: Exception) {
                errorMessage = e.localizedMessage
            } finally {
                isLoading = false
            }
        }
    }

    fun markScheduleDone(id: Int, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                val res = api.markScheduleDone(id)
                if (res.isSuccessful) {
                    loadHomeSchedules()
                    loadSchedules()
                    onDone()
                }
            } catch (_: Exception) {}
        }
    }

    fun deletePlant(id: Int, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                val res = api.deletePlant(id)
                if (res.isSuccessful) {
                    loadPlants()
                    onDone()
                }
            } catch (_: Exception) {}
        }
    }

    fun deleteSchedule(id: Int, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                val res = api.deleteSchedule(id)
                if (res.isSuccessful) {
                    loadSchedules()
                    onDone()
                }
            } catch (_: Exception) {}
        }
    }

    fun deleteJournal(id: Int, onDone: () -> Unit) {
        viewModelScope.launch {
            try {
                val res = api.deleteJournal(id)
                if (res.isSuccessful) {
                    loadJournals()
                    onDone()
                }
            } catch (_: Exception) {}
        }
    }
}
