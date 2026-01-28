package com.datacld.dailyexpensereport

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.firestore.FirebaseFirestore
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var auth: FirebaseAuth
    private lateinit var db: FirebaseFirestore
    private lateinit var googleSignInClient: GoogleSignInClient

    private val googleSignInLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        try {
            val account = task.getResult(ApiException::class.java)!!
            firebaseAuthWithGoogle(account.idToken!!)
        } catch (e: ApiException) {
            val errorMsg = "Google Sign-In error: ${e.statusCode}"
            Log.e("Auth", errorMsg, e)
            sendToWeb("onAuthError", errorMsg)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            FirebaseApp.initializeApp(this)
            auth = FirebaseAuth.getInstance()
            db = FirebaseFirestore.getInstance()
        } catch (e: Exception) {
            Log.e("Firebase", "Init Error", e)
        }

        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken("152893674286-1u0g4ljpmq4o9r99rkr9hkvp0m5lqp5f.apps.googleusercontent.com")
            .requestEmail()
            .build()
        googleSignInClient = GoogleSignIn.getClient(this, gso)

        window.apply {
            clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
            addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
            decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            statusBarColor = Color.TRANSPARENT
        }

        webView = WebView(this)
        setContentView(webView)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            databaseEnabled = true
            // Add custom user agent to help React identify the environment
            userAgentString = userAgentString + " LedgerProAndroid"
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Bridge MUST be added before loading URL
        webView.addJavascriptInterface(AndroidBridge(), "Android")
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Small delay to ensure React state is ready
                webView.postDelayed({
                    val user = auth.currentUser
                    if (user != null) {
                        sendToWeb("onAuthSuccess", user.email ?: user.uid)
                    } else {
                        sendToWeb("onLogout", "")
                    }
                }, 500)
            }
        }

        webView.loadUrl("file:///android_asset/www/index.html")
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential).addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val user = auth.currentUser
                sendToWeb("onAuthSuccess", user?.email ?: user?.uid ?: "")
            } else {
                sendToWeb("onAuthError", task.exception?.message ?: "Auth Failed")
            }
        }
    }

    private fun sendToWeb(functionName: String, data: String) {
        runOnUiThread {
            webView.evaluateJavascript("if(window.$functionName) { window.$functionName('$data'); }", null)
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun loginWithGoogle() {
            runOnUiThread {
                val signInIntent = googleSignInClient.signInIntent
                googleSignInLauncher.launch(signInIntent)
            }
        }

        @JavascriptInterface
        fun loginWithEmail(email: String, pass: String) {
            auth.signInWithEmailAndPassword(email, pass).addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    sendToWeb("onAuthSuccess", email)
                } else {
                    auth.createUserWithEmailAndPassword(email, pass).addOnCompleteListener { createTab ->
                        if (createTab.isSuccessful) {
                            sendToWeb("onAuthSuccess", email)
                        } else {
                            sendToWeb("onAuthError", createTab.exception?.message ?: "Error")
                        }
                    }
                }
            }
        }

        @JavascriptInterface
        fun saveTransaction(json: String) {
            val user = auth.currentUser ?: return
            try {
                val obj = JSONObject(json)
                val id = obj.getString("id")
                val data = mutableMapOf<String, Any>()
                val keys = obj.keys()
                while(keys.hasNext()) {
                    val key = keys.next()
                    data[key] = obj.get(key)
                }
                db.collection("users").document(user.uid)
                  .collection("transactions").document(id)
                  .set(data)
            } catch (e: Exception) { Log.e("Bridge", "Firestore Error", e) }
        }

        @JavascriptInterface
        fun logout() {
            auth.signOut()
            googleSignInClient.signOut()
            sendToWeb("onLogout", "")
        }

        @JavascriptInterface
        fun checkAuth() {
            val user = auth.currentUser
            if (user != null) {
                sendToWeb("onAuthSuccess", user.email ?: user.uid)
            } else {
                sendToWeb("onLogout", "")
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack()
        else super.onBackPressed()
    }
}