chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "summarizePage") {
        chrome.tabs.executeScript(sender.tab.id, {
            code: "document.body.innerText"
        }, async (results) => {
            const pageContent = results[0];
            

            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPEN_AI_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: 'You are a helpful assistant that summarizes web pages.' },
                            { role: 'user', content: `Summarize the following text in about 3-5 key points: ${pageContent}` }
                        ]
                    })
                });

                const data = await response.json();
                
                if (data.choices && data.choices.length > 0) {
                    const summary = data.choices[0].message.content;
                    chrome.tabs.sendMessage(sender.tab.id, { action: "showSummaryInChatDrawer", summary });
                }
            } catch (error) {
                console.error('Error fetching summary:', error);
                chrome.tabs.sendMessage(sender.tab.id, { action: "showError", error: "Failed to generate summary" });
            }
        });
    }
});

