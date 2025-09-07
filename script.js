const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const leafImage = document.getElementById('leaf-image');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsSection = document.getElementById('results-section');
const loadingState = document.getElementById('loading-state');
const adviceState = document.getElementById('advice-state');
const diagnosisText = document.getElementById('diagnosis-text');
const adviceText = document.getElementById('advice-text');
const previewPlaceholder = document.getElementById('preview-placeholder');

let imageUploaded = false;

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

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            leafImage.src = e.target.result;
            leafImage.classList.remove('hidden');
            previewPlaceholder.classList.add('hidden');
            imagePreview.classList.add('has-image');
            imageUploaded = true;
            analyzeBtn.disabled = false;
            analyzeBtn.classList.remove('bg-gray-200', 'text-gray-700', 'cursor-not-allowed');
            analyzeBtn.classList.add('bg-green-500', 'text-white', 'hover:bg-green-600', 'cursor-pointer');
            
            // Hide previous results
            resultsSection.classList.add('hidden');
            adviceState.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
});

analyzeBtn.addEventListener('click', () => {
    if (!imageUploaded) {
        // In a real app, this would be a custom modal, not an alert.
        // This is a placeholder for the purpose of this demo.
        console.log("Please upload a leaf image first.");
        return;
    }

    // Show loading state
    resultsSection.classList.remove('hidden');
    loadingState.classList.remove('hidden');
    adviceState.classList.add('hidden');
    
    // Simulate a network request with a delay
    setTimeout(() => {
        loadingState.classList.add('hidden');
        adviceState.classList.remove('hidden');

        // Pick a random diagnosis for the demo
        const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];

        // Display the results
        diagnosisText.textContent = randomDiagnosis.diagnosis;
        adviceText.textContent = randomDiagnosis.advice;
    }, 2000);
});
