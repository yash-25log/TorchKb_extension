(function() {
    // Create and set up the floating action button (FAB) container
    const link = document.createElement('link');
    link.href = chrome.runtime.getURL('chatDrawer.css');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const authDrawerLink = document.createElement('link');
    authDrawerLink.href = chrome.runtime.getURL('authDrawer.css');
    authDrawerLink.type = 'text/css';
    authDrawerLink.rel = 'stylesheet';
    document.head.appendChild(authDrawerLink);
    
    const fabContainer = document.createElement('div');
    fabContainer.id = 'fab-container';
    
    function addTestButton() {
        const testButton = document.createElement('button');
        testButton.id = 'test-auth-drawer';
        testButton.textContent = 'Test Auth Drawer';
        testButton.style.position = 'fixed';
        testButton.style.top = '10px';
        testButton.style.left = '10px';
        testButton.style.zIndex = '10000';
        document.body.appendChild(testButton);
    
        testButton.addEventListener('click', () => {
            createAuthDrawer();
        });
    }

    // Get the text content of the page and send it to the background script
    const pageText = document.body.innerText;
    
    // Define the HTML structure for the floating button and its options (summarize, ask, save)
    fabContainer.innerHTML = `
        <div class="floating-button">
            <div class="main-icon">
                <img src="${chrome.runtime.getURL('icons/TorchKB.png')}" alt="Main Icon">
            </div>
            <div class="drawer">
                <div class="sub-icon" id="summarize">
                    <img src="${chrome.runtime.getURL('icons/Summarise.png')}" alt="Summarize">
                    
                    <span class="tooltip">Summarise This Page</span>
                </div>
                <div class="sub-icon" id="ask">
                    <img src="${chrome.runtime.getURL('icons/Ask.png')}" alt="Ask">
                    <span class="tooltip">Ask this page</span>
                </div>
                <div class="sub-icon" id="save">
                    <img src="${chrome.runtime.getURL('icons/Save.png')}" alt="Save">
                    <span class="tooltip">Save this page</span>
                </div>
            </div>
        </div>
    `;

    // Add the FAB container to the page
    document.body.appendChild(fabContainer);

    // Grab references to the main icon and the drawer (sub-icons container)
    const mainIcon = document.querySelector('.main-icon');
    const drawer = document.querySelector('.drawer');
    const summarizeButton = document.getElementById('summarize');
    // Check if elements are correctly defined
    if (!mainIcon || !drawer || !summarizeButton) {
        console.error('One or more elements are not found in the DOM.');
        return;
    }

    // Toggle the visibility of the drawer when the main icon is clicked
    mainIcon.addEventListener('click', function() {
        if (drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            setTimeout(() => {
                drawer.style.display = 'none';  // Hide after the close animation completes
            }, 300);  // This duration matches the CSS transition
        } else {
            drawer.style.display = 'flex';
            setTimeout(() => {
                drawer.classList.add('open');  // Add class slightly after display:flex to trigger transition
            }, 10);
        }
    });

     // Handle click on "Summarize" button
     summarizeButton.addEventListener('click', () => {
        console.log('Summarize button clicked'); // Debugging log
        // Send message to background script to summarize the page
        chrome.runtime.sendMessage({ 
            action: 'summarizePage', 
            content: document.body.innerText 
        });
        // Show chat drawer
        showChatDrawer("Summarizing...");
        console.log('Chat drawer element:', document.getElementById('chat-drawer'));
        drawer.classList.remove('open');
        drawer.style.display = 'none';

    });
    // Update the chrome.runtime.onMessage listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showSummaryInChatDrawer") {
        const chatBody = document.querySelector('.chat-body');
        if (chatBody) {
            chatBody.innerHTML = `
                <div class="chat-message user-message">Summarise & provide the key take aways from this article…</div>
                <div class="chat-message ai-message">${message.summary}</div>
            `;
        }
    } else if (message.action === "showError") {
        const chatBody = document.querySelector('.chat-body');
        if (chatBody) {
            chatBody.innerHTML = `
                <div class="chat-message user-message">Summarize & provide the key takeaways from this article…</div>
                <div class="chat-message ai-message">Error: ${message.error}</div>
            `;
        }
    }
});
    // Function to show the chat drawer
    function showChatDrawer(initialMessage) {
         // Check if chat drawer already exists
        //  if (document.getElementById('chat-drawer')) {
        //     console.log('Chat drawer already exists');
        //     return;
        // }
        const chatDrawer = document.createElement('div');
        chatDrawer.id = 'chat-drawer';
        chatDrawer.innerHTML = `
            <div class="chat-header">
                <div class="header-left">
                    <img src="${chrome.runtime.getURL('icons/TorchKB.png')}" alt="TorchKB Icon" class="header-icon">
                </div>
                <div class="header-title">Torch KB - AI Powered Knowledge Base</div>
                <div class="header-right">
                      
                    <button id="return-icon"><img src="${chrome.runtime.getURL('icons/Return.png')}" alt="Return"></button>
                </div>
            </div>
            <div class="chat-body">
            <div class="chat-message user-message">Summarise & provide the key take aways from this article…</div>
            <div class="chat-message ai-message">${initialMessage || 'Summarizing...'}</div>
        </div>
            <div class="chat-footer">
                <input type="text" id="chat-input" placeholder="Start Chatting Now...">
                <button id="submit-button"><img src="${chrome.runtime.getURL('icons/Submit.png')}" alt="Submit"></button>
            </div>
       
        `;
        // chatDrawer.style.opacity = '1';
        // chatDrawer.style.display = 'flex';

        
        
        document.body.appendChild(chatDrawer);
        // Add this line to make the drawer visible
        setTimeout(() => {
            chatDrawer.classList.add('visible');
        }, 10);

            // Hide the main drawer
        drawer.classList.remove('open');
        drawer.style.display = 'none';
        document.getElementById('fab-container').style.display = 'none';

        // Handle return icon click to hide the chat drawer and show the main extension drawer
        document.getElementById('return-icon').addEventListener('click', () => {
            console.log('Return icon clicked'); // Debugging log
            document.getElementById('chat-drawer').remove();
            document.getElementById('fab-container').style.display = 'block';
            drawer.style.display = 'flex'; // Show main drawer
            drawer.classList.add('open');
        });
        document.getElementById('submit-button').addEventListener('click', handleFollowUpQuestion);

        // document.getElementById('submit-button').addEventListener('click', () => {
        //     console.log('Query submitted');
        //     if (!localStorage.getItem('authShown')) {
        //         document.getElementById('chat-drawer').style.display = 'none';
        //         createAuthDrawer();
        //         localStorage.setItem('authShown', 'true');
        //     } else {
        //         // Handle normal submit functionality here
        //         console.log('Query submitted');
        //     }
        // });
    
    }
    // Add a new function to handle follow-up questions
function handleFollowUpQuestion() {
    const chatInput = document.getElementById('chat-input');
    const query = chatInput.value.trim();
    if (query) {
        const chatBody = document.querySelector('.chat-body');
        chatBody.innerHTML += `<div class="chat-message user-message">${query}</div>`;
        chatInput.value = '';

        // Send message to background script with the query
        chrome.runtime.sendMessage({ 
            action: 'askFollowUp', 
            query: query,
            content: document.body.innerText  // Send the page content again
        });

        chatBody.innerHTML += `<div class="chat-message ai-message">Thinking...</div>`;
    }
}

    // Update the home icon click event listener
    function attachHomeIconListener() {
        const homeIcon = document.getElementById('home-icon');
        if (homeIcon) {
            homeIcon.addEventListener('click', () => {
                console.log('Home icon clicked');
                chrome.runtime.sendMessage({action: 'showHomePage'});
            });
        } else {
            setTimeout(attachHomeIconListener, 500);
        }
    }

    // Call this function after the chat drawer is created
    attachHomeIconListener();

    // Update the chrome.runtime.onMessage listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
       
        if (message.action === "showSummaryInChatDrawer") {
            const chatBody = document.querySelector('.chat-body');
            if (chatBody) {
                const summaryText = message.summary || message.response || 'Summary not available.';
                chatBody.innerHTML = `
                    <div class="chat-message user-message">Summarise & provide the key take aways from this article…</div>
                    <div class="chat-message ai-message">${summaryText}</div>
                `;
            }
        } else if (message.action === "showFollowUpResponse") {
            // Existing follow-up question logic remains unchanged
            const chatBody = document.querySelector('.chat-body');
            if (chatBody) {
                // Remove the "Thinking..." message
                const thinkingMessage = chatBody.querySelector('.ai-message:last-child');
                if (thinkingMessage && thinkingMessage.textContent === "Thinking...") {
                    thinkingMessage.remove();
                }
                
                // Add the new response
                chatBody.innerHTML += `<div class="chat-message ai-message">${message.response}</div>`;
            }
        } else if (message.action === "showError") {
            // Existing error handling logic remains unchanged
            const chatBody = document.querySelector('.chat-body');
            if (chatBody) {
                chatBody.innerHTML += `<div class="chat-message ai-message">Error: ${message.error}</div>`;
            }
        }
    
    });
    
    

     // Function to handle icon change on hover or click
     function changeIconOnHoverAndClick(subIconId, defaultIcon, hoverIcon, clickIcon) {
        const subIcon = document.getElementById(subIconId);

        if (!subIcon) {
            console.error(`Element with ID ${subIconId} not found.`);
            return;
        }

        // Simplified: select the first img element inside subIcon
        const iconImage = subIcon.querySelector('img');

        if (!iconImage) {
            console.error(`img element not found inside ${subIconId}.`);
            return;
        }

        subIcon.addEventListener('mouseover', () => {
            iconImage.src = hoverIcon;
        });

        subIcon.addEventListener('mouseout', () => {
            iconImage.src = defaultIcon;
        });

        subIcon.addEventListener('click', () => {
            iconImage.src = clickIcon;
        });
    }
    // Replace icons on hover and click for each sub-icon
    changeIconOnHoverAndClick('summarize', 
        chrome.runtime.getURL('icons/Summarise.png'), 
        chrome.runtime.getURL('icons/Summarise-hover.png'),
        chrome.runtime.getURL('icons/Summarise-hover.png'));

    changeIconOnHoverAndClick('ask', 
        chrome.runtime.getURL('icons/Ask.png'), 
        chrome.runtime.getURL('icons/Ask-hover.png'),
        chrome.runtime.getURL('icons/Ask-hover.png'));

    changeIconOnHoverAndClick('save', 
        chrome.runtime.getURL('icons/Save.png'), 
        chrome.runtime.getURL('icons/Save-hover.png'),
        chrome.runtime.getURL('icons/Save-hover.png'));

    // Add event listener for the "Summarize" sub-icon
    document.getElementById('summarize').addEventListener('click', () => {
        console.log('Summarize this page');  // Trigger summarize functionality
    });

    // Add event listener for the "Ask" sub-icon
    document.getElementById('ask').addEventListener('click', () => {
        console.log('Ask this page');  // Trigger ask functionality
    });

    // Add event listener for the "Save" sub-icon
    document.getElementById('save').addEventListener('click', () => {
        console.log('Save this page');  // Trigger save functionality
    });
    function tryShowHomePage() {
        if (typeof window.showHomePage === 'function') {
            window.showHomePage();
        } else {
            console.log('showHomePage function not available yet, retrying...');
            setTimeout(tryShowHomePage, 100);
        }
    }
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'executeShowHomePage') {
            tryShowHomePage();

        }
    });
    
    function createAuthDrawer() {
        const authDrawer = document.createElement('div');
    authDrawer.id = 'auth-drawer';
    authDrawer.innerHTML = `
        <img src="${chrome.runtime.getURL('icons/close.png')}" alt="Close" id="close-auth-drawer">
        <div class="auth-content">
            <div class="header-content">
                <img src="${chrome.runtime.getURL('icons/torchKb.png')}" alt="Torch KB" class="torch-kb-logo">
                <h1>Torch KB</h1>
            </div>
            <h2>Your AI Powered Knowledge Base</h2>
            <p>Summarise, Organise, Interact, Revise & Create Quizzes With Your YouTube Knowledge Base</p>
            <button id="auth-button">Sign Up / Log In</button>
        </div>
    `;
    document.body.appendChild(authDrawer);

    document.getElementById('close-auth-drawer').addEventListener('click', () => {
        authDrawer.style.display = 'none';
        document.getElementById('test-auth-drawer').style.display = 'block';
        document.getElementById('fab-container').style.display = 'block';
    });

    
        document.getElementById('auth-button').addEventListener('click', () => {
            // Implement authentication logic here
            console.log('Authentication button clicked');
        });
    }
    
    
    
    

    
// Modify the existing event listener for the main icon
// mainIcon.addEventListener('click', function() {
//     if (!localStorage.getItem('authShown')) {
//         createAuthDrawer();
//         fabContainer.style.display = 'none';
//         localStorage.setItem('authShown', 'true');
//     } else {
//         if (drawer.classList.contains('open')) {
//             drawer.classList.remove('open');
//             setTimeout(() => {
//                 drawer.style.display = 'none';
//             }, 300);
//         } else {
//             drawer.style.display = 'flex';
//             setTimeout(() => {
//                 drawer.classList.add('open');
//             }, 10);
//         }
//     }
// });

addTestButton();



})();