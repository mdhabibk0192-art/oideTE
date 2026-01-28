package com.datacld.dailyexpensereport

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query

class MainActivity : ComponentActivity() {
    private val auth by lazy { FirebaseAuth.getInstance() }
    private val db by lazy { FirebaseFirestore.getInstance() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            LedgerTheme {
                var currentUser by remember { mutableStateOf(auth.currentUser) }

                if (currentUser == null) {
                    LoginScreen(
                        onLoginSuccess = { user -> currentUser = user },
                        auth = auth
                    )
                } else {
                    DashboardScreen(
                        uid = currentUser!!.uid,
                        db = db,
                        onLogout = {
                            auth.signOut()
                            currentUser = null
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun LedgerTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF6366F1),
            background = Color(0xFF0F172A),
            surface = Color(0xFF1E293B)
        ),
        content = content
    )
}

@Composable
fun LoginScreen(onLoginSuccess: (com.google.firebase.auth.FirebaseUser) -> Unit, auth: FirebaseAuth) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    val context = LocalContext.current

    Column(
        modifier = Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Ledger Pro", fontSize = 40.sp, fontWeight = FontWeight.Black, color = Color.White)
        Text("NATIVE FIREBASE SECURE", fontSize = 10.sp, color = Color.Gray, letterSpacing = 2.sp)
        
        Spacer(Modifier.height(48.dp))

        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(Modifier.height(16.dp))

        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(Modifier.height(32.dp))

        if (isLoading) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
        } else {
            Button(
                onClick = {
                    if (email.isEmpty() || password.isEmpty()) {
                        Toast.makeText(context, "Please enter email & password", Toast.LENGTH_SHORT).show()
                        return@Button
                    }
                    isLoading = true
                    auth.signInWithEmailAndPassword(email, password)
                        .addOnSuccessListener { result ->
                            onLoginSuccess(result.user!!)
                        }
                        .addOnFailureListener {
                            // If login fails, try to create account (Auto-registration)
                            auth.createUserWithEmailAndPassword(email, password)
                                .addOnSuccessListener { result ->
                                    onLoginSuccess(result.user!!)
                                }
                                .addOnFailureListener { e ->
                                    isLoading = false
                                    Toast.makeText(context, "Error: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                                }
                        }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("ENTER LEDGER", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DashboardScreen(uid: String, db: FirebaseFirestore, onLogout: () -> Unit) {
    var transactions by remember { mutableStateOf(listOf<Transaction>()) }
    var showDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uid) {
        db.collection("users").document(uid).collection("transactions")
            .orderBy("timestamp", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, _ ->
                transactions = snapshot?.toObjects(Transaction::class.java) ?: emptyList()
            }
    }

    Scaffold(
        topBar = {
            SmallTopAppBar(
                title = { Text("Daily Records", fontWeight = FontWeight.Bold) },
                actions = {
                    TextButton(onClick = onLogout) { Text("Logout", color = Color.LightGray) }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showDialog = true }, containerColor = Color(0xFF6366F1)) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
            }
        }
    ) { padding ->
        Column(Modifier.padding(padding).padding(16.dp)) {
            val balance = transactions.sumOf { 
                if (it.type == "INCOME") it.amount else -it.amount 
            }
            
            Card(
                modifier = Modifier.fillMaxWidth().height(140.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(Modifier.fillMaxSize(), Arrangement.Center, Alignment.CenterHorizontally) {
                    Text("Total Savings", color = Color.Gray, fontSize = 12.sp)
                    Text("৳${String.format("%,.0f", balance)}", fontSize = 38.sp, fontWeight = FontWeight.Black)
                }
            }

            Spacer(Modifier.height(24.dp))
            
            LazyColumn {
                items(transactions) { t ->
                    ListItem(
                        headlineContent = { Text(t.note.ifEmpty { t.type }, fontWeight = FontWeight.Bold) },
                        supportingContent = { Text(if(t.type == "INCOME") "Deposit" else "Spent") },
                        trailingContent = {
                            Text(
                                "${if(t.type == "INCOME") "+" else "-"}৳${t.amount.toInt()}",
                                color = if(t.type == "INCOME") Color(0xFF10B981) else Color(0xFFF43F5E),
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp
                            )
                        }
                    )
                    Divider(color = Color.DarkGray.copy(alpha = 0.2f))
                }
            }
        }

        if (showDialog) {
            TransactionEntryDialog(
                onDismiss = { showDialog = false },
                onSave = { type, amt, note ->
                    val id = db.collection("users").document(uid).collection("transactions").document().id
                    val trans = Transaction(id, type, amt, note)
                    db.collection("users").document(uid).collection("transactions").document(id).set(trans)
                    showDialog = false
                }
            )
        }
    }
}

@Composable
fun TransactionEntryDialog(onDismiss: () -> Unit, onSave: (String, Double, String) -> Unit) {
    var amount by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("EXPENSE") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Record") },
        text = {
            Column {
                OutlinedTextField(amount, { amount = it }, label = { Text("Amount") })
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(note, { note = it }, label = { Text("Note") })
                Spacer(Modifier.height(16.dp))
                Row(modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { type = "INCOME" }, Modifier.weight(1f), 
                        colors = ButtonDefaults.buttonColors(containerColor = if(type=="INCOME") Color(0xFF10B981) else Color.DarkGray)) {
                        Text("Income")
                    }
                    Spacer(Modifier.width(8.dp))
                    Button(onClick = { type = "EXPENSE" }, Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = if(type=="EXPENSE") Color(0xFFF43F5E) else Color.DarkGray)) {
                        Text("Expense")
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(type, amount.toDoubleOrNull() ?: 0.0, note) }) {
                Text("Save Record")
            }
        }
    )
}