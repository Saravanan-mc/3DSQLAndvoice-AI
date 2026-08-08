// Gemini API Integration
class GeminiService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    }

    async generateContent(prompt) {
        if (!this.apiKey || this.apiKey === "YOUR_GEMINI_API_KEY") {
            throw new Error("Missing or invalid Gemini API Key in config.js");
        }

        try {
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || "Failed to generate content");
            }

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Unexpected API response structure");
            }
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }

    // Specialized function for converting intent to SQL
    async generateSQL(textPattern) {
        const prompt = `
            You are an AI assistant that ONLY converts natural language intent into a SQL query.
            The available tables are:
            1. 'students' with columns [id, name, age, major, gpa]
            2. 'employees' with columns [id, name, department, salary]
            3. 'products' with columns [id, name, category, price, stock]
            4. 'orders' with columns [id, customer_id, product_id, quantity, order_date]
            5. 'customers' with columns [id, name, email, country]
            6. 'books' with columns [id, title, author, genre, year]
            
            Given this natural language: "${textPattern}"
            
            1. Generate the valid SQL query (e.g., SELECT * FROM students WHERE age > 20). 
            2. Generate a very brief, plain English explanation of what the query does.
            3. Provide the response exactly in JSON format:
            {
                "sql": "SELECT ...",
                "explanation": "This query retrieves..."
            }
            Ensure the response is raw JSON without markdown formatting like \`\`\`json. Find any errors in the user logic and auto-fix.
        `;

        const responseText = await this.generateContent(prompt);
        
        try {
            // Clean markdown if Gemini still included it
            let cleaned = responseText.trim();
            if(cleaned.startsWith("```json")) cleaned = cleaned.substring(7);
            if(cleaned.startsWith("```")) cleaned = cleaned.substring(3);
            if(cleaned.endsWith("```")) cleaned = cleaned.substring(0, cleaned.length - 3);
            
            return JSON.parse(cleaned);
        } catch (e) {
            console.error("Failed to parse Gemini response:", responseText);
            throw new Error("Failed to parse AI response as JSON");
        }
    }

    // Specialized function for tutoring
    async tutorSQL(topic, userQuestion = null) {
        let prompt = `You are a friendly, encouraging AI SQL Tutor named Gemini SQL Academy. You are teaching a beginner about: ${topic}.`;
        
        if (userQuestion) {
            prompt += `\nThe student asked: "${userQuestion}". Answer it beautifully and simply.`;
        } else {
            prompt += `\nPlease explain the concept of ${topic} simply to a beginner. Give an example. Then present a 1-sentence practice challenge using a theoretical 'students', 'products', or 'orders' table.`;
        }

        return await this.generateContent(prompt);
    }
}
