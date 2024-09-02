chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "summarizePage" || message.action === "askFollowUp") {
        const pageContent = message.content;
        

        let prompt;
        if (message.action === "summarizePage") {
            prompt = `Summarize the following text in about 3-5 key points: ${pageContent}`;
        } else {
            prompt = `Based on the following content, answer this question: "${message.query}"\n\nContent: ${pageContent}`;
        }

        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPEN_AI_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant that summarizes web pages and answers questions about their content.' },
                    { role: 'user', content: prompt }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Received API response:', data);
            if (data.choices && data.choices.length > 0) {
                const response = data.choices[0].message.content;
                console.log('Generated response:', response);
                chrome.tabs.sendMessage(sender.tab.id, { 
                    action: message.action === "summarizePage" ? "showSummaryInChatDrawer" : "showFollowUpResponse", 
                    response 
                });
            } else {
                console.log('No response generated');
                chrome.tabs.sendMessage(sender.tab.id, { action: "showError", error: "No response generated" });
            }
        })
        .catch(error => {
            console.error('Error fetching response:', error);
            chrome.tabs.sendMessage(sender.tab.id, { action: "showError", error: "Failed to generate response" });
        });
    }
});
