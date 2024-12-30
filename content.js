// Create and inject tooltip HTML
const tooltipHTML = `
  <div class="ai-tooltip" style="display: none;">
    <div class="ai-tooltip-content"></div>
    <div class="ai-tooltip-buttons">
      <button class="ai-copy-button">Copy to clipboard</button>
      <button class="ai-replace-button">Replace text</button>
    </div>
  </div>
`;
document.body.insertAdjacentHTML('beforeend', tooltipHTML);

const tooltip = document.querySelector('.ai-tooltip');
const tooltipContent = document.querySelector('.ai-tooltip-content');
const copyButton = document.querySelector('.ai-copy-button');
const replaceButton = document.querySelector('.ai-replace-button');

let lastSelection = null;
let lastElement = null;
let lastStart = null;
let lastEnd = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "improveText") {
    lastSelection = window.getSelection();
    // Store the active element and selection positions
    lastElement = document.activeElement;
    if (lastElement.tagName.toLowerCase() === 'input' || lastElement.tagName.toLowerCase() === 'textarea') {
      lastStart = lastElement.selectionStart;
      lastEnd = lastElement.selectionEnd;
    }
    showTooltip(request.text);
  }
});

// Function to check if selection is in an editable area
function isEditableArea() {
  if (!lastElement) return false;
  
  // Get the active element and its parent
  const element = lastElement;
  const parent = element.parentElement;
  
  // Check if element or its parent is editable
  const isEditable = (el) => {
    if (!el) return false;
    return el.tagName.toLowerCase() === 'input' || 
           el.tagName.toLowerCase() === 'textarea' ||
           el.contentEditable === 'true' ||  // Standard contenteditable
           el.getAttribute('role') === 'textbox' || // ARIA textbox
           el.classList.contains('editable') || // Common editable class
           el.getAttribute('g_editable') === 'true'; // Google editable
  };

  return isEditable(element) || isEditable(parent);
}

// Modify the showTooltip function
function showTooltip(text) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  tooltipContent.textContent = text;
  tooltip.style.display = 'block';
  tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;

  // Disable replace button if not in editable area
  if (!isEditableArea()) {
    replaceButton.disabled = true;
    replaceButton.style.opacity = '0.5';
    replaceButton.title = 'Can only replace text in editable areas';
  } else {
    replaceButton.disabled = false;
    replaceButton.style.opacity = '1';
    replaceButton.title = 'Replace selected text';
  }
}

// Handle copy button click
copyButton.addEventListener('click', () => {
  const textToCopy = tooltipContent.textContent;
  navigator.clipboard.writeText(textToCopy);
  copyButton.textContent = 'Copied!';
  setTimeout(() => {
    copyButton.textContent = 'Copy to clipboard';
    tooltip.style.display = 'none';
  }, 1500);
});

// Handle replace button click
replaceButton.addEventListener('click', () => {
  if (lastElement) {
    const tagName = lastElement.tagName.toLowerCase();
    
    // Handle input and textarea elements
    if (tagName === 'input' || tagName === 'textarea') {
      const currentValue = lastElement.value;
      lastElement.value = 
        currentValue.substring(0, lastStart) + 
        tooltipContent.textContent + 
        currentValue.substring(lastEnd);
      
      // Focus the element and set cursor position
      lastElement.focus();
      const newCursorPos = lastStart + tooltipContent.textContent.length;
      lastElement.setSelectionRange(newCursorPos, newCursorPos);
      
      // Trigger input event
      lastElement.dispatchEvent(new Event('input', { bubbles: true }));
    } 
    // Handle editable divs
    else if (tagName === 'div' && 
            (lastElement.getAttribute('contenteditable') === 'true' || 
             lastElement.getAttribute('g_editable') === 'true')) {
      if (lastSelection && lastSelection.rangeCount > 0) {
        const range = lastSelection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(tooltipContent.textContent));
      }
    }
  } 
  // Fallback for other contenteditable elements
  else if (lastSelection && lastSelection.rangeCount > 0) {
    const range = lastSelection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentElement = container.nodeType === 3 ? container.parentElement : container;
    
    if (parentElement.getAttribute('contenteditable') === 'true' || 
        parentElement.getAttribute('g_editable') === 'true') {
      range.deleteContents();
      range.insertNode(document.createTextNode(tooltipContent.textContent));
    }
  }
  
  replaceButton.textContent = 'Replaced!';
  setTimeout(() => {
    replaceButton.textContent = 'Replace text';
    tooltip.style.display = 'none';
  }, 1500);
});

// Close tooltip when clicking outside
document.addEventListener('click', (e) => {
  if (!tooltip.contains(e.target) && e.target !== tooltip) {
    tooltip.style.display = 'none';
  }
});

// Updated styles
const style = document.createElement('style');
style.textContent = `
  .ai-tooltip {
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .ai-tooltip-content {
    margin-bottom: 10px;
    color: black;
  }
  
  .ai-tooltip-buttons {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  
  .ai-tooltip button {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background: #1a365d;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }
  
  .ai-tooltip button:hover {
    background: #2c5282;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .ai-tooltip button:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;
document.head.appendChild(style); 