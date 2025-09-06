const imgInput = document.getElementById('leafImage');
const preview = document.getElementById('preview');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultDiv = document.getElementById('result');

imgInput.addEventListener('change', () => {
  const file = imgInput.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';
});

analyzeBtn.addEventListener('click', async () => {
  if (!imgInput.files[0]) { resultDiv.textContent = 'Please select an image first.'; return; }
  const formData = new FormData();
  formData.append('image', imgInput.files[0]);

  resultDiv.textContent = 'Analyzing...';

  const response = await fetch('/analyze', { method: 'POST', body: formData });
  const data = await response.json();
  
  resultDiv.innerHTML = `
    <p><strong>Diagnosis:</strong> ${data.disease}</p>
    <p><strong>Advice:</strong> ${data.advice}</p>
  `;
});
