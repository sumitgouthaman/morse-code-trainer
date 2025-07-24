export function generatePhoneKeyboard(modeState, guessHandler) {
    const keyboardContainer = modeState.qwertyKeyboard;
    keyboardContainer.innerHTML = '';
    
    // Create keyboard structure
    const keyboardDiv = document.createElement('div');
    keyboardDiv.className = 'phone-keyboard';
    
    // Number row
    const numberRow = document.createElement('div');
    numberRow.className = 'keyboard-row number-row';
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    numbers.forEach(num => {
        const btn = document.createElement('button');
        btn.textContent = num;
        btn.className = 'key-btn number-key';
        btn.addEventListener('click', () => guessHandler(num, modeState));
        numberRow.appendChild(btn);
    });
    keyboardDiv.appendChild(numberRow);
    
    // Letter rows (phone-style layout)
    const letterRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    
    letterRows.forEach((row, index) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = `keyboard-row letter-row row-${index + 1}`;
        
        // Add punctuation toggle button to the beginning of the last row
        if (index === 2) {
            const punctToggle = document.createElement('button');
            punctToggle.textContent = '?!';
            punctToggle.className = 'key-btn punct-toggle-btn';
            punctToggle.id = 'punct-toggle-btn';
            rowDiv.appendChild(punctToggle);
        }
        
        row.forEach(letter => {
            const btn = document.createElement('button');
            btn.textContent = letter;
            btn.className = 'key-btn letter-key';
            btn.addEventListener('click', () => guessHandler(letter, modeState));
            rowDiv.appendChild(btn);
        });
        
        keyboardDiv.appendChild(rowDiv);
    });
    
    // Create punctuation keyboard (initially hidden)
    const punctKeyboard = document.createElement('div');
    punctKeyboard.className = 'punctuation-keyboard';
    punctKeyboard.style.display = 'none';
    
    const punctuationChars = ['.', ',', '?', "'", '!', '/', '(', ')', '&', ':', ';', '=', '+', '-', '_', '"', '$', '@'];
    punctuationChars.forEach(punct => {
        const btn = document.createElement('button');
        btn.textContent = punct;
        btn.className = 'key-btn punct-key';
        btn.addEventListener('click', () => guessHandler(punct, modeState));
        punctKeyboard.appendChild(btn);
    });
    
    // Add toggle button at the bottom of punctuation keyboard
    const punctBackToggle = document.createElement('button');
    punctBackToggle.textContent = 'ABC';
    punctBackToggle.className = 'key-btn punct-back-toggle';
    punctKeyboard.appendChild(punctBackToggle);
    
    keyboardDiv.appendChild(punctKeyboard);
    
    // Get the punctuation toggle button and add event listener
    const punctToggle = keyboardDiv.querySelector('#punct-toggle-btn');
    
    let showingPunctuation = false;
    
    function toggleKeyboard() {
        showingPunctuation = !showingPunctuation;
        if (showingPunctuation) {
            // Hide main keyboard rows and show punctuation
            numberRow.style.display = 'none';
            keyboardDiv.querySelectorAll('.letter-row').forEach(row => {
                row.style.display = 'none';
            });
            punctKeyboard.style.display = 'flex';
            punctToggle.textContent = 'ABC';
            punctToggle.classList.add('active');
        } else {
            // Show main keyboard rows and hide punctuation
            numberRow.style.display = 'flex';
            keyboardDiv.querySelectorAll('.letter-row').forEach(row => {
                row.style.display = 'flex';
            });
            punctKeyboard.style.display = 'none';
            punctToggle.textContent = '?!';
            punctToggle.classList.remove('active');
        }
    }
    
    punctToggle.addEventListener('click', toggleKeyboard);
    punctBackToggle.addEventListener('click', toggleKeyboard);
    
    keyboardContainer.appendChild(keyboardDiv);
}