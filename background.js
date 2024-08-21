// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the received message is to summarize the page content
    if (message.action === "summarizePage") {
        // Execute a script in the sender tab to get the page's text content
        chrome.tabs.executeScript(sender.tab.id, {
            code: "document.body.innerText"
        }, async (results) => {
            // Extract the page content from the results
            const pageContent = results[0];
            
            // OpenAI API key for authentication
            const OPEN_AI_KEY = '';
            const openaiApiKey = process.env.OPENAI_API_KEY;

            try {
                // Send a request to the OpenAI API to summarize the page content
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPEN_AI_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo', // Use GPT-3.5-turbo model
                        messages: [
                            { role: 'user', content: `Summarize the following text: ${pageContent}` }
                        ]
                    })
                });

                // Parse the response from the OpenAI API
                const data = await response.json();
                
                // If the response contains a summary, send it back to the content script
                if (data.choices && data.choices.length > 0) {
                    const summary = data.choices[0].message.content;
                    chrome.tabs.sendMessage(sender.tab.id, { action: "showSummary", summary });
                }
            } catch (error) {
                // Log any errors that occur during the API request
                console.error('Error fetching summary:', error);
            }
        });
    }
});
