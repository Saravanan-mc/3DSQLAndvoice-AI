// app.js - Main Application Logic for both index.html and learn.html

// Data and History Storage (Global namespace for our frontend app)
window.appDB = { students: [], employees: [] };
window.appHistory = [];

async function loadInitialData() {
    try {
        const dbRes = await fetch('database.json');
        window.appDB = await dbRes.json();
    } catch(e) {
        console.warn('Could not load database.json, using fallback data.', e);
        window.appDB = {
            students: [
                {id: 1, name: "Alice Smith", age: 22, major: "Computer Science", gpa: 3.8},
                {id: 2, name: "Bob Johnson", age: 19, major: "Mathematics", gpa: 3.2},
                {id: 3, name: "Charlie Brown", age: 21, major: "Physics", gpa: 3.5},
                {id: 4, name: "Diana Prince", age: 20, major: "Engineering", gpa: 3.9},
                {id: 5, name: "Evan Wright", age: 23, major: "History", gpa: 3.1}
            ],
            employees: [
                {id: 101, name: "John Doe", department: "IT", salary: 75000},
                {id: 102, name: "Jane Roe", department: "HR", salary: 65000},
                {id: 103, name: "Sam Smith", department: "Finance", salary: 80000},
                {id: 104, name: "Anna Lee", department: "Marketing", salary: 72000},
                {id: 105, name: "David Kim", department: "IT", salary: 85000}
            ],
            products: [
                {id: 201, name: "Laptop", category: "Electronics", price: 1200, stock: 45},
                {id: 202, name: "Mouse", category: "Electronics", price: 25, stock: 150},
                {id: 203, name: "Desk", category: "Furniture", price: 250, stock: 20}
            ],
            orders: [
                {id: 301, customer_id: 401, product_id: 201, quantity: 1, order_date: "2024-03-01"},
                {id: 302, customer_id: 402, product_id: 202, quantity: 2, order_date: "2024-03-02"}
            ],
            customers: [
                {id: 401, name: "Alice Wonderland", email: "alice@email.com", country: "USA"},
                {id: 402, name: "Bob Builder", email: "bob@email.com", country: "UK"}
            ],
            books: [
                {id: 501, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", year: 1925},
                {id: 502, title: "1984", author: "George Orwell", genre: "Dystopian", year: 1949}
            ]
        };
    }

    try {
        const savedHistory = localStorage.getItem('sql_history');
        if (savedHistory) {
            window.appHistory = JSON.parse(savedHistory);
            if (typeof renderHistory === 'function') renderHistory();
        } else {
            const histRes = await fetch('history.json');
            window.appHistory = await histRes.json();
            if (typeof renderHistory === 'function') renderHistory();
        }
    } catch(e) {
        window.appHistory = [];
    }
}

// Ultra-lightweight mock SQL Parser for SELECT queries (to execute on our JSON structures safely)
window.executeMockSQL = function(sql) {
    try {
        let query = sql.replace(/;/g, ' ').trim().replace(/\n/g, ' ');
        // Basic pattern matching for SELECT * FROM <table> WHERE <cond>
        const selectRegex = /SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i;
        const match = query.match(selectRegex);
        
        if (!match) throw new Error("Only simple SELECT queries are supported in this simulation engine.");

        const [, cols, tableName, whereClause, orderClause, limitClause] = match;
        const table = window.appDB[tableName.toLowerCase()];
        if (!table) throw new Error(`Table '${tableName}' not found in database.`);

        let results = [...table];

        // Process WHERE
        if (whereClause) {
            results = results.filter(row => {
                // Warning: eval is used, but acceptable ONLY for this highly constrained frontend mock
                // We securely convert SQL syntax (=, <>) to JS syntax (===, !==) and wrap fields
                let validLogic = whereClause
                    .replace(/=/g, '===')
                    .replace(/<>|!=/g, '!==')
                    .replace(/AND/i, '&&')
                    .replace(/OR/i, '||');
                
                Object.keys(row).forEach(key => {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    validLogic = validLogic.replace(regex, `row['${key}']`);
                });
                
                try {
                    return eval(validLogic);
                } catch(e) {
                    return false;
                }
            });
        }

        // Process ORDER BY
        if (orderClause) {
            // Very simple ORDER BY parser (field [ASC|DESC])
            const parts = orderClause.trim().split(/\s+/);
            const field = parts[0];
            const dir = (parts[1] && parts[1].toUpperCase() === 'DESC') ? -1 : 1;
            
            results.sort((a,b) => {
                if (a[field] < b[field]) return -1 * dir;
                if (a[field] > b[field]) return 1 * dir;
                return 0;
            });
        }

        // Process LIMIT
        if (limitClause) {
            results = results.slice(0, parseInt(limitClause, 10));
        }

        // Optional: Filter columns if cols !== '*'
        if (cols.trim() !== '*') {
            const selectedCols = cols.split(',').map(c => c.trim());
            results = results.map(row => {
                let newRow = {};
                selectedCols.forEach(c => {
                    if(row[c] !== undefined) newRow[c] = row[c];
                });
                return newRow;
            });
        }

        return { success: true, rows: results, msg: `Found ${results.length} rows.` };

    } catch(err) {
        return { success: false, msg: err.message };
    }
}

// -------------------------------------------------------------
// Voice to SQL Page Logic (index.html)
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('micBtn');
    if (!micBtn) return; // Not on the Voice to SQL page

    loadInitialData();

    const gemini = new GeminiService(CONFIG.GEMINI_API_KEY);
    const speech = new SpeechService(
        (final, interim) => {
            const txt = final || interim;
            document.getElementById('transcriptText').textContent = txt;
            const manualInput = document.getElementById('manualInput');
            if (manualInput) manualInput.value = txt;
            
            if (final) {
                // Voice confirmation implicit: we stop recording and analyze
                micBtn.classList.remove('recording');
                document.getElementById('recordingStatus').textContent = "Processing logic with AI...";
                processTranscript(final);
            }
        },
        (status) => {
            if (status === "Listening...") {
                micBtn.classList.add('recording');
                document.getElementById('transcriptText').textContent = "Listening...";
            } else if (!status.startsWith("Listening")) {
                micBtn.classList.remove('recording');
            }
            document.getElementById('recordingStatus').textContent = status;
        }
    );

    let lastGeneratedSql = "";

    micBtn.addEventListener('click', () => {
        speech.toggle();
    });

    const manualBtn = document.getElementById('manualBtn');
    const manualInput = document.getElementById('manualInput');
    if (manualBtn && manualInput) {
        manualBtn.addEventListener('click', () => {
            const text = manualInput.value.trim();
            if (text) {
                document.getElementById('recordingStatus').textContent = "Processing logic with AI...";
                document.getElementById('transcriptText').textContent = text; // sync for history saving
                processTranscript(text);
            }
        });
        manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') manualBtn.click();
        });
    }

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            document.body.classList.toggle('light-mode');
            e.target.textContent = document.body.classList.contains('light-mode') ? "🌙 Dark" : "☀️ Light";
        });
    }

    async function processTranscript(text) {
        try {
            const aiResponse = await gemini.generateSQL(text);
            document.getElementById('generatedSql').textContent = aiResponse.sql;
            
            // Highlight keywords
            let highlightedExplanation = aiResponse.explanation
                .replace(/\b(SELECT|FROM|WHERE|ORDER BY|LIMIT)\b/g, '<strong style="color:var(--accent-color)">$1</strong>');
            
            document.getElementById('sqlExplanation').innerHTML = highlightedExplanation;
            lastGeneratedSql = aiResponse.sql;
            
            document.getElementById('runQueryBtn').disabled = false;
            document.getElementById('speakQueryBtn').disabled = false;
            
            speech.speak("Query generated. Ready to run.");

        } catch(error) {
            document.getElementById('generatedSql').textContent = `/* Error: ${error.message} */`;
            document.getElementById('sqlExplanation').textContent = "The AI could not generate SQL for that logic.";
            speech.speak("Sorry, I could not understand that intent.");
        }
    }

    document.getElementById('speakQueryBtn').addEventListener('click', () => {
        if(lastGeneratedSql) speech.speak(lastGeneratedSql);
    });

    document.getElementById('runQueryBtn').addEventListener('click', () => {
        if (!lastGeneratedSql) return;
        
        const result = window.executeMockSQL(lastGeneratedSql);
        renderTable(result);
        
        // Save to history
        saveHistory(document.getElementById('transcriptText').textContent, lastGeneratedSql, result.success ? result.rows : []);

        const speakBtn = document.getElementById('speakResultsBtn');
        speakBtn.style.display = 'inline-block';
        
        const feedbackMsg = result.success ? result.msg : `Error: ${result.msg}`;
        speech.speak(feedbackMsg);
    });

    document.getElementById('speakResultsBtn').addEventListener('click', () => {
        const rowsCount = document.querySelectorAll('#resultsContainer tr').length - 1; // subtract header
        if (rowsCount >= 0) {
            speech.speak(`The table shows ${rowsCount} result rows.`);
        }
    });

    // We make renderHistory global so loadInitialData can call it
    window.renderHistory = function() {
        const list = document.getElementById('historyList');
        if(!list) return;

        list.innerHTML = "";
        if (window.appHistory.length === 0) {
            list.innerHTML = `<p class="placeholder">No queries yet.</p>`;
            return;
        }

        window.appHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="history-transcript">"${item.transcript}"</span>
                <span class="history-sql">${item.sql}</span>
                <span class="history-timestamp">${item.timestamp} - ${item.resultsCount} rows</span>
            `;
            list.appendChild(li);
        });
    };

    function renderTable(result) {
        const container = document.getElementById('resultsContainer');
        if (!result.success) {
            container.innerHTML = `<p style="color:var(--error-color)">Error Executing Query: ${result.msg}</p>`;
            return;
        }

        if (result.rows.length === 0) {
            container.innerHTML = `<p>No results found.</p>`;
            return;
        }

        // Build table
        const columns = Object.keys(result.rows[0]);
        let html = `<table><thead><tr>`;
        columns.forEach(col => html += `<th>${col}</th>`);
        html += `</tr></thead><tbody>`;
        
        result.rows.forEach(row => {
            html += `<tr>`;
            columns.forEach(col => html += `<td>${row[col]}</td>`);
            html += `</tr>`;
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
    }

    function saveHistory(transcript, sql, results) {
        const item = {
            transcript,
            sql,
            timestamp: new Date().toLocaleString(),
            resultsCount: results.length
        };
        
        window.appHistory.unshift(item); // add to top
        if (window.appHistory.length > 20) window.appHistory.pop(); // keep last 20
        
        localStorage.setItem('sql_history', JSON.stringify(window.appHistory));
        window.renderHistory();
    }
});


// -------------------------------------------------------------
// Learning Academy Logic (learn.html)
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const chatBtn = document.getElementById('sendChatBtn');
    if (!chatBtn) return; // Not on learning page

    // Ensure mock DB is available for playground
    loadInitialData();

    const gemini = new GeminiService(CONFIG.GEMINI_API_KEY);
    const speech = new SpeechService(); // For reading lessons aloud
    const sqlAnimator = new SQLAnimator('threejs-container');
    
    let currentTopic = "Introduction to Databases";
    
    const topicsList = document.querySelectorAll('.topic-list li');
    topicsList.forEach(li => {
        li.addEventListener('click', (e) => {
            topicsList.forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');
            currentTopic = e.target.getAttribute('data-topic');
            document.getElementById('currentLessonTitle').textContent = `Lesson: ${currentTopic}`;
            loadLesson(currentTopic);
        });
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            document.body.classList.toggle('light-mode');
            e.target.textContent = document.body.classList.contains('light-mode') ? "🌙 Dark" : "☀️ Light";
        });
    }

    async function loadLesson(topic) {
        if (typeof sqlAnimator !== 'undefined') sqlAnimator.playAnimation(topic);
        const chatBox = document.getElementById('chatMessages');
        chatBox.innerHTML = '';
        addBotMessage(`Preparing your lesson on *${topic}*...`);
        
        try {
            const response = await gemini.tutorSQL(topic);
            chatBox.innerHTML = ''; // clear loading
            addBotMessage(response);
            
            // Speak the lesson summary
            speech.speak(`Welcome to the lesson on ${topic}.`);
            
            // Update progress arbitrarily based on index
            const topicsArray = Array.from(topicsList).map(el => el.getAttribute('data-topic'));
            const idx = topicsArray.indexOf(topic);
            const progress = ((idx + 1) / topicsArray.length) * 100;
            document.getElementById('learningProgress').style.width = `${progress}%`;
            
        } catch(e) {
            chatBox.innerHTML = '';
            addBotMessage("Sorry, I couldn't load the lesson right now. Please check your API key in config.js");
        }
    }

    chatBtn.addEventListener('click', handleChat);
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }

    async function handleChat() {
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if(!text) return;
        
        addUserMessage(text);
        input.value = '';
        
        addBotMessage("Thinking...");
        const msgs = document.querySelectorAll('.chat-bubble.bot');
        const loadingMsg = msgs[msgs.length - 1];
        
        try {
            const response = await gemini.tutorSQL(currentTopic, text);
            loadingMsg.innerHTML = formatChat(response);
        } catch(e) {
            loadingMsg.textContent = "Error: Could not get a response.";
        }
        speech.speak("I've responded to your question.");
    }

    function addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-bubble bot';
        div.innerHTML = formatChat(text);
        document.getElementById('chatMessages').appendChild(div);
        scrollToBottom();
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-bubble user';
        div.textContent = text;
        document.getElementById('chatMessages').appendChild(div);
        scrollToBottom();
    }

    function formatChat(text) {
        // very basic markdown parsing for bold and code
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<span style="font-family:monospace; background:rgba(0,0,0,0.3); padding:2px; border-radius:3px;">$1</span>')
            .replace(/\n/g, '<br>');
        return formatted;
    }

    function scrollToBottom() {
        const box = document.getElementById('chatMessages');
        box.scrollTop = box.scrollHeight;
    }

    document.getElementById('runPlaygroundBtn').addEventListener('click', () => {
        const val = document.getElementById('playgroundCode').value;
        if(val.trim() === '') {
            return;
        }
        const result = window.executeMockSQL ? window.executeMockSQL(val) : {success:false, msg:"Mock execution unavailable."};
        
        document.getElementById('chatMessages').style.background = 'rgba(46, 160, 67, 0.2)';
        setTimeout(() => document.getElementById('chatMessages').style.background = 'rgba(0,0,0,0.2)', 500);
        
        if (result.success) {
            addBotMessage(`You ran: \`${val}\` \n\nGreat job! Your query returned ${result.rows.length} rows.`);
            speech.speak(`Query successful. ${result.rows.length} rows returned.`);
        } else {
            addBotMessage(`There was an issue with your query: ${result.msg}`);
            speech.speak("Query failed. " + result.msg);
        }
    });

    // Start first topic
    loadLesson(currentTopic);
});
