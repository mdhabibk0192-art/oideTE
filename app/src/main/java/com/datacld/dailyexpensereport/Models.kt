package com.datacld.dailyexpensereport

import androidx.annotation.Keep

@Keep
enum class TransactionType { INCOME, EXPENSE, BILL, DEBT }

@Keep
data class Transaction(
    val id: String = "",
    val type: String = "EXPENSE",
    val amount: Double = 0.0,
    val note: String = "",
    val personName: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)