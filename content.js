let enabled = false;
let suggestionElements = {};

chrome.runtime.sendMessage({ action: "getState" }, (response) => {
  enabled = response.enabled;
  if (enabled) {
    initializeExtension();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleEnabled") {
    enabled = request.enabled;
    if (enabled) {
      initializeExtension();
    } else {
      removeAllSuggestions();
    }
  }
});

function initializeExtension() {
  const questions = extractQuestions();
  questions.forEach(createSuggestionElement);
  addHoverListeners();
}

function extractQuestions() {
  const questionElements = document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot');
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
  const suggestionElement = document.createElement('div');
  suggestionElement.className = 'groq-suggestion';
  suggestionElement.style.cssText = `
    position: absolute;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    max-width: 300px;
    z-index: 1000;
    display: none;
  `;
  suggestionElement.textContent = 'Loading suggestion...';
  question.element.style.position = 'relative';
  question.element.appendChild(suggestionElement);
  suggestionElements[question.id] = suggestionElement;
}

function addHoverListeners() {
  document.querySelectorAll('.freebirdFormviewerComponentsQuestionBaseRoot').forEach((element, index) => {
    element.addEventListener('mouseenter', () => showSuggestion(index));
    element.addEventListener('mouseleave', () => hideSuggestion(index));
  });
}

async function showSuggestion(questionId) {
  if (!enabled) return;
  const suggestionElement = suggestionElements[questionId];
  if (suggestionElement) {
    try {
      const question = extractQuestions()[questionId].text;
      const suggestion = await getSuggestion(question);
      suggestionElement.textContent = suggestion;
      suggestionElement.style.display = 'block';
    } catch (error) {
      console.error('Error showing suggestion:', error);
      suggestionElement.textContent = 'Error getting suggestion. Please try again.';
      suggestionElement.style.display = 'block';
    }
  }
}

function hideSuggestion(questionId) {
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
  Object.values(suggestionElements).forEach(element => element.remove());
  suggestionElements = {};
}
