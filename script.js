import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, addDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db, auth, userId = null;
let isAuthReady = false;

// Set up the Firebase application on window load
window.onload = async function() {
    setLogLevel('debug');
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Listen for authentication state changes
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, get their UID
            userId = user.uid;
            isAuthReady = true;
            document.getElementById('user-id-display').textContent = userId;
            console.log("Authenticated with user ID:", userId);
            startHistoryListener();
        } else {
            // No user is signed in, sign in anonymously
            console.log("No user signed in. Signing in anonymously.");
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
            }
        }
    });
}

// Function to listen for real-time history updates from Firestore
function startHistoryListener() {
    if (!db || !userId) {
        console.log("DB or User ID not available, waiting...");
        return;
    }
    
    // Set up a real-time listener for the user's scan history
    const scansRef = collection(db, `artifacts/${appId}/users/${userId}/scans`);
    onSnapshot(scansRef, (snapshot) => {
        const historyList = document.getElementById('history-list');
        const historyPlaceholder = document.getElementById('history-placeholder');
        historyList.innerHTML = '';
        
        // Show placeholder if no history items exist
        if (snapshot.empty) {
            historyPlaceholder.classList.remove('hidden');
        } else {
            historyPlaceholder.classList.add('hidden');
            // Populate the history list with new data
            snapshot.forEach((doc) => {
                const scan = doc.data();
                const scanCard = document.createElement('div');
                scanCard.className = 'flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md';
                scanCard.innerHTML = `
                    <img src="${scan.imageData}" alt="Scanned Leaf" class="w-16 h-16 object-cover rounded-lg border border-gray-200">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${scan.diagnosis}</h4>
                        <p class="text-sm text-gray-500">${new Date(scan.timestamp).toLocaleString()}</p>
                    </div>
                `;
                historyList.appendChild(scanCard);
            });
        }
    }, (error) => {
        console.error("Error listening to history:", error);
    });
}

// Simulated diagnoses data for the demo
const diagnoses = [
    {
        diagnosis: "Healthy Leaf",
        advice: "Great news! Your leaf looks healthy. To prevent future bacterial issues, ensure good air circulation around the plant, avoid overwatering, and keep the leaves dry when you water. Consider applying a preventative organic fungicide if the weather is humid."
    },
    {
        diagnosis: "Mild Bacterial Leaf Spot",
        advice: "Your leaf shows signs of a mild bacterial infection. First, carefully prune and dispose of the affected leaves. Make sure to sterilize your pruning shears after each cut with rubbing alcohol. Improve air circulation by thinning the plant and water at the base to keep the leaves dry. Avoid overhead irrigation."
    },
    {
        diagnosis: "Early Fungal Infection",
        advice: "This leaf appears to have an early fungal disease. Remove and discard all infected leaves immediately to prevent it from spreading. Apply a copper-based fungicide or a neem oil solution. Also, consider improving soil drainage and reducing watering frequency to keep the environment less hospitable for fungi."
    }
];

// Handles the analysis button click
window.handleAnalyze = async function() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (!file) {
        console.log("Please upload a leaf image first.");
        return;
    }
    if (!isAuthReady) {
        console.log("Authentication not ready. Please wait a moment.");
        return;
    }
    
    const imageData = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });

    const resultsSection = document.getElementById('results-section');
    const loadingState = document.getElementById('loading-state');
    const adviceState = document.getElementById('advice-state');
    const diagnosisText = document.getElementById('diagnosis-text');
    const adviceText = document.getElementById('advice-text');

    resultsSection.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    adviceState.classList.add('hidden');

    // Simulate a network request with a delay
    setTimeout(async () => {
        loadingState.classList.add('hidden');
        
        // Simulate analysis result by picking a random diagnosis
        const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

        // Display the results
        diagnosisText.textContent = randomDiagnosis.diagnosis;
        adviceText.textContent = randomDiagnosis.advice;
        adviceState.classList.remove('hidden');

        // Save the analysis result to Firestore
        try {
            const scansRef = collection(db, `artifacts/${appId}/users/${userId}/scans`);
            await addDoc(scansRef, {
                diagnosis: randomDiagnosis.diagnosis,
                advice: randomDiagnosis.advice,
                imageData: imageData,
                timestamp: Date.now()
            });
            console.log("Analysis saved to Firestore.");
        } catch (e) {
            console.error("Error adding document: ", e);
        }

    }, 2000);
}

// Handles the file input change event
window.handleFileChange = function(event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById('image-preview');
    const leafImage = document.getElementById('leaf-image');
    const analyzeBtn = document.getElementById('analyze-btn');
    const previewPlaceholder = document.getElementById('preview-placeholder');

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            leafImage.src = e.target.result;
            leafImage.classList.remove('hidden');
            previewPlaceholder.classList.add('hidden');
            imagePreview.classList.add('has-image');
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('bg-gray-200', 'text-gray-700', 'cursor-not-allowed');
            analyzeBtn.classList.add('bg-green-500', 'text-white', 'hover:bg-green-600', 'cursor-pointer');
            
            document.getElementById('results-section').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}
