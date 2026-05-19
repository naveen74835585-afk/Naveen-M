# Namma Pustaka: Android (Kotlin) Implementation Guide

Since you requested a Jetpack Compose structure, here are the core data classes and navigation setup for your Android project.

## 1. Data Models (`Models.kt`)
```kotlin
enum class UserRole { STUDENT, TEACHER }

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole
)

data class Book(
    val id: String,
    val serialNumber: String,
    val title: String,
    val author: String,
    val category: String,
    val coverUrl: String,
    val isAvailable: Boolean,
    val borrowerId: String? = null,
    val dueDate: String? = null
)
```

## 2. Navigation Architecture (`NavHost.kt`)
```kotlin
@Composable
fun NammaPustakaNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "welcome") {
        composable("welcome") { WelcomeScreen(onGetStarted = { navController.navigate("auth") }) }
        composable("auth") { AuthScreen(onLoginSuccess = { user -> navController.navigate("home") }) }
        composable("home") { HomeScreen(onBookClick = { book -> /* show detail */ }) }
        composable("scanner") { ScannerScreen(onScanSuccess = { serial -> /* issue book logic */ }) }
        composable("dashboard") { DashboardScreen(onLogout = { navController.navigate("welcome") }) }
    }
}
```

## 3. Room Database (`BookDao.kt`)
```kotlin
@Dao
interface BookDao {
    @Query("SELECT * FROM books WHERE serialNumber = :serial")
    suspend fun getBookBySerial(serial: String): Book?

    @Update
    suspend fun updateBook(book: Book)

    @Query("SELECT * FROM books WHERE borrowerId = :userId")
    fun getBorrowedBooks(userId: String): Flow<List<Book>>
}
```

## 4. ML Kit Integration (QR Scanning)
Use the CameraX Analysis API with `BarcodeScanning.getClient()` to process frames.
```kotlin
val scanner = BarcodeScanning.getClient()
val image = InputImage.fromMediaImage(mediaImage, rotation)
scanner.process(image)
    .addOnSuccessListener { barcodes ->
        for (barcode in barcodes) {
            val serial = barcode.rawValue ?: continue
            onScanResult(serial)
        }
    }
```
