package com.example.plantcare.data.local

import android.content.Context
import android.content.SharedPreferences

class TokenManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("plantcare_prefs", Context.MODE_PRIVATE)

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit().putString("access_token", accessToken).putString("refresh_token", refreshToken).apply()
    }

    fun getAccessToken(): String? = prefs.getString("access_token", null)
    fun getRefreshToken(): String? = prefs.getString("refresh_token", null)

    fun saveUser(id: Int, name: String, email: String, role: String) {
        prefs.edit()
            .putInt("user_id", id)
            .putString("user_name", name)
            .putString("user_email", email)
            .putString("user_role", role)
            .apply()
    }

    fun getUserId(): Int = prefs.getInt("user_id", -1)
    fun getUserRole(): String = prefs.getString("user_role", "user") ?: "user"
    fun getUserName(): String = prefs.getString("user_name", "") ?: ""
    fun getUserEmail(): String = prefs.getString("user_email", "") ?: ""

    fun clear() {
        prefs.edit().clear().apply()
    }
}
