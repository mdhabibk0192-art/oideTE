package com.datacld.dailyexpensereport

import androidx.annotation.Keep

@Keep
data class Transaction(
    val id: String = "",
    val type: String = "EXPENSE", // INCOME, EXPENSE, BILL, DEBT
    val amount: Double = 0.0,
    val note: String = "",
    val timestamp: Long = System.currentTimeMillis()
)