console.log('Content script loaded');

let enabled = false;
let suggestionElements = {};

chrome.runtime.sendMessage({ action: "getState" }, (response) => {
  console.log('Extension state:', response.enabled);
  enabled = response.enabled;
  if (enabled) {
    initializeExtension();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleEnabled") {
    console.log('Toggle enabled:', request.enabled);
    enabled = request.enabled;
    if (enabled) {
      initializeExtension();
    } else {
      removeAllSuggestions();
    }
  }
});

function initializeExtension() {
  console.log('Initializing extension');
  const questions = extractQuestions();
  questions.forEach(createSuggestionElement);
  addHoverListeners();
}

function extractQuestions() {
  const questionElements = document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot');
  console.log('Found question elements:', questionElements.length);
  return Array.from(questionElements).map((element, index) => {
    const questionText = element.querySelector('.freebirdFormviewerComponentsQuestionBaseHeader').textContent.trim();
    const questionType = getQuestionType(element);
    return { id: index, element, text: questionText, type: questionType };
  });
}

function getQuestionType(element) {
  if (element.querySelector('input[type="text"]')) return 'short_answer';
  if (element.querySelector('textarea')) return 'long_answer';
  if (element.querySelector('input[type="radio"]')) return 'multiple_choice';
  if (element.querySelector('input[type="checkbox"]')) return 'checkbox';
  return 'unknown';
}

function createSuggestionElement(question) {
  console.log('Creating suggestion element for question:', question.id);
  const suggestionElement = document.createElement('div');
  suggestionElement.className = 'groq-suggestion';
  suggestionElement.style.cssText = `
    position: absolute;
    background-color: #f0f0f0;
    border: 2px solid #ff0000;
    padding: 10px;
    border-radius: 5px;
    max-width: 300px;
    z-index: 1000;
    display: none;
    top: 0;
    left: 100%;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  `;
  suggestionElement.innerHTML = '<p>Loading suggestion...</p>';
  
  const applyButton = document.createElement('button');
  applyButton.textContent = 'Apply Suggestion';
  applyButton.style.cssText = `
    display: none;
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  `;
  applyButton.addEventListener('click', () => applySuggestion(question.id));
  suggestionElement.appendChild(applyButton);

  question.element.style.position = 'relative';
  question.element.appendChild(suggestionElement);
  suggestionElements[question.id] = suggestionElement;
}

function addHoverListeners() {
  document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot').forEach((element, index) => {
    element.addEventListener('mouseenter', () => {
      console.log('Mouse entered question:', index);
      showSuggestion(index);
    });
    element.addEventListener('mouseleave', () => {
      console.log('Mouse left question:', index);
      hideSuggestion(index);
    });
  });
}

async function showSuggestion(questionId) {
  console.log('Showing suggestion for question:', questionId);
  if (!enabled) return;
  const suggestionElement = suggestionElements[questionId];
  if (suggestionElement) {
    try {
      const question = extractQuestions()[questionId];
      suggestionElement.style.display = 'block';
      suggestionElement.querySelector('p').textContent = 'Loading suggestion...';
      suggestionElement.querySelector('button').style.display = 'none';
      
      const suggestion = await getSuggestion(question.text);
      suggestionElement.querySelector('p').textContent = suggestion;
      suggestionElement.querySelector('button').style.display = 'block';
    } catch (error) {
      console.error('Error showing suggestion:', error);
      suggestionElement.querySelector('p').textContent = `Error: ${error.message}. Please try again.`;
      suggestionElement.querySelector('button').style.display = 'none';
    }
  }
}

function hideSuggestion(questionId) {
  console.log('Hiding suggestion for question:', questionId);
  const suggestionElement = suggestionElements[questionId];
  if (suggestionElement) {
    suggestionElement.style.display = 'none';
  }
}

async function getSuggestion(question) {
  try {
    return await window.getGroqSuggestion(question);
  } catch (error) {
    console.error('Error in getSuggestion:', error);
    throw new Error('Failed to get suggestion from Groq API');
  }
}

function removeAllSuggestions() {
  console.log('Removing all suggestions');
  Object.values(suggestionElements).forEach(element => element.remove());
  suggestionElements = {};
}

function fillFormField(questionId, suggestion) {
  console.log('Filling form field for question:', questionId);
  const question = extractQuestions()[questionId];
  const element = question.element;

  switch (question.type) {
    case 'short_answer':
    case 'long_answer':
      const input = element.querySelector('input[type="text"], textarea');
      if (input) {
        input.value = suggestion;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
      break;
    case 'multiple_choice':
      const radioButtons = element.querySelectorAll('input[type="radio"]');
      const labels = element.querySelectorAll('label');
      for (let i = 0; i < radioButtons.length; i++) {
        if (labels[i].textContent.trim().toLowerCase() === suggestion.toLowerCase()) {
          radioButtons[i].click();
          break;
        }
      }
      break;
    case 'checkbox':
      const checkboxes = element.querySelectorAll('input[type="checkbox"]');
      const checkboxLabels = element.querySelectorAll('label');
      const suggestedItems = suggestion.toLowerCase().split(',').map(item => item.trim());
      for (let i = 0; i < checkboxes.length; i++) {
        if (suggestedItems.includes(checkboxLabels[i].textContent.trim().toLowerCase())) {
          checkboxes[i].click();
        }
      }
      break;
  }
}

function applySuggestion(questionId) {
  console.log('Applying suggestion for question:', questionId);
  const suggestionElement = suggestionElements[questionId];
  const suggestion = suggestionElement.querySelector('p').textContent;
  fillFormField(questionId, suggestion);
}
