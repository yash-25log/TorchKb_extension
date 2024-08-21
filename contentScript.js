(function() {
    // Create and set up the floating action button (FAB) container
    const link = document.createElement('link');
    link.href = chrome.runtime.getURL('chatDrawer.css');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);




    const fabContainer = document.createElement('div');
    fabContainer.id = 'fab-container';

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
        chrome.runtime.sendMessage({ action: 'summarizePage' });
        
        // Show chat drawer
        showChatDrawer();
        console.log('Chat drawer element:', document.getElementById('chat-drawer'));
        drawer.classList.remove('open');
        drawer.style.display = 'none';

    });
    // Function to show the chat drawer
    function showChatDrawer() {
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
                <div class="chat-message ai-message">The provided context reflects on the shift to the 2020s and compares various historical events to bring perspective to how long ago certain events occurred. Here are the key points and summaries:

                The 2020s: The author highlights the significance of being in the "20s" and reflects on how the term sounds futuristic to current generations, mirroring the sentiment felt in the 1920s.

                Historical Comparisons: The text presents various comparisons to convey the relative proximity of certain historical events to the present day. For example, it compares the perceived distance between World War 2 and the Civil War felt by Americans and the accessibility of different eras to current generations.

                Cultural References: The passage mentions cultural touchstones like The Wonder Years, classic movies, and significant trials, placing them in temporal contexts to give a sense of their historical proximity.</div>
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
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'showSummary') {
            const chatBody = document.querySelector('.chat-body');
            chatBody.innerHTML = `<div class="chat-message ai-message">${message.summary}</div>`;
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

   
    

})();
