document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('urlForm');
    const urlInput = document.getElementById('urlInput');
    const checkBtn = document.getElementById('checkBtn');
    const btnText = document.getElementById('btnText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    
    const resultContainer = document.getElementById('resultContainer');
    const resultBox = document.getElementById('resultBox');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const reasonsList = document.getElementById('reasonsList');
    
    const historyList = document.getElementById('historyList');
    
    // Load history from local storage
    let urlHistory = JSON.parse(localStorage.getItem('phishing_history')) || [];
    renderHistory();

    // Icons
    const icons = {
        safe: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        suspicious: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
    };

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (err) {
            // Also accept without protocol for basic validation, so backend can process it.
            if(string.includes('.')) return true;
            return false;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        if (!url) return;
        
        if (!isValidUrl(url)) {
            errorMessage.textContent = "Please enter a valid URL structure.";
            errorMessage.classList.remove('hidden');
            return;
        }
        
        errorMessage.classList.add('hidden');
        
        // Show loading state
        btnText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        checkBtn.disabled = true;
        resultContainer.classList.add('hidden');
        
        try {
            const response = await fetch('/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                displayResult(data);
                addToHistory(data);
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            // Hide loading state
            btnText.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            checkBtn.disabled = false;
        }
    });
    
    function displayResult(data) {
        resultContainer.classList.remove('hidden');
        resultBox.className = 'result-box'; // Reset
        
        if (data.is_safe) {
            resultBox.classList.add('safe');
            statusIcon.innerHTML = icons.safe;
            statusText.textContent = 'SAFE';
        } else {
            resultBox.classList.add('suspicious');
            statusIcon.innerHTML = icons.suspicious;
            statusText.textContent = 'SUSPICIOUS';
        }
        
        // Populate reasons
        reasonsList.innerHTML = '';
        data.reasons.forEach(reason => {
            const li = document.createElement('li');
            li.textContent = reason;
            reasonsList.appendChild(li);
        });
    }
    
    function addToHistory(data) {
        // Add to beginning of array
        // Prevent duplicate adjacent checks in history
        if (urlHistory.length > 0 && urlHistory[0].url === data.url) {
            return;
        }

        urlHistory.unshift({
            url: data.url,
            is_safe: data.is_safe,
            date: new Date().toISOString()
        });
        
        // Keep only last 5
        if (urlHistory.length > 5) {
            urlHistory.pop();
        }
        
        // Save to local storage
        localStorage.setItem('phishing_history', JSON.stringify(urlHistory));
        
        renderHistory();
    }
    
    function renderHistory() {
        if (urlHistory.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No URLs checked yet.</li>';
            return;
        }
        
        historyList.innerHTML = '';
        urlHistory.forEach(item => {
            const li = document.createElement('li');
            
            const urlSpan = document.createElement('span');
            urlSpan.className = 'history-url';
            urlSpan.textContent = item.url;
            urlSpan.title = item.url; // Tooltip for full url
            
            const badgeSpan = document.createElement('span');
            badgeSpan.className = `history-badge ${item.is_safe ? 'badge-safe' : 'badge-suspicious'}`;
            badgeSpan.textContent = item.is_safe ? 'SAFE' : 'SUSPICIOUS';
            
            li.appendChild(urlSpan);
            li.appendChild(badgeSpan);
            
            // Allow clicking history item to re-check
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                urlInput.value = item.url;
                form.dispatchEvent(new Event('submit'));
            });
            
            historyList.appendChild(li);
        });
    }
});
