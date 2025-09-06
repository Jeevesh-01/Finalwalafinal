let answers = {};
let currentQuestion = "";
let history = []; // To store the history of questions visited

// Survey structure
const questions = {
  q1: {
    text: "Do you currently own a pet?",
    type: "choice",
    options: {
      "Yes": "q2_owner",
      "No, but planning to get one soon": "q2_future",
      "No, and not planning to get one": "q2_service"
    }
  },

  // 🐾 Pet Owner Branch
  q2_owner: { text: "What type(s) of pet do you have?", type: "multi", next: "q3_owner", options: ["Dog","Cat","Bird","Fish","Rabbit","Other"] },
  q3_owner: { text: "What breed(s) is your pet? (optional)", type: "text", next: "q4_owner" },
  q4_owner: { text: "What’s your pet’s gender?", type: "choice", options: {"Male":"q5_owner","Female":"q5_owner","Prefer not to say":"q5_owner"} },
  q5_owner: { text: "What’s your biggest challenge as a pet parent?", type: "choice", options: {
    "Finding reliable services (vet, grooming, walkers)":"general",
    "Managing health and vaccinations":"general",
    "Connecting with other pet parents":"general",
    "Buying trusted products":"general",
    "Other":"general"
  }},

  // 🐣 Future Pet Parent Branch
  q2_future: { text: "When do you plan to get a pet?", type: "choice", options: {"Within 6 months":"q3_future","Within 1 year":"q3_future","Not sure":"q3_future"} },
  q3_future: { text: "What type of pet would you prefer?", type: "choice", options: {"Dog":"q4_future","Cat":"q4_future","Bird":"q4_future","Rabbit":"q4_future","Other":"q4_future"} },
  q4_future: { text: "What’s your main concern before getting a pet?", type: "choice", options: {
    "Responsibility/time commitment":"general",
    "Cost of care":"general",
    "Finding trusted services":"general",
    "Lack of information":"general",
    "Other":"general"
  }},

  // 👥 Service Provider Branch
  q2_service: { text: "Would you be interested in offering pet services to others?", type: "choice", options: {
    "Yes, professionally":"q3_service",
    "Yes, casually":"q3_service",
    "No, not interested":"general"
  }},
  q3_service: { text: "What kind of services would you be most interested in providing?", type: "multi", next: "general", options: ["Pet sitting","Dog walking","Grooming","Training","Play dates","Other"] },

  // 🌍 General Questions (common for all)
  general: { text: "Which apps or services do you currently use for pet needs?", type: "text", next: "q7" },
  q7: { text: "How often do you consume pet-related content online?", type: "choice", options: {"Daily":"q8","Weekly":"q8","Occasionally":"q8","Rarely":"q8"} },
  q8: { text: "Would you use a single platform that combines social community + pet care services + discovery?", type: "choice", options: {"Definitely yes":"q9","Maybe":"q9","No":"q9"} },
  q9: { text: "Would you like early access to Pettxo when we launch?", type: "choice", options: {"Yes, sign me up!":"email_yes","Maybe later":"email_maybe","No":"q10"} },

  email_yes: { text: "Your best email address to get early access", type: "email", required: true, next: "q10" },
  email_maybe: { text: "Your best email (optional)", type: "email", next: "q10" },

  q10: { text: "Any features or services you’d love to see in Pettxo? (optional)", type: "longtext", next: "thankyou" },

  thankyou: { text: "🎉 Thank you for helping shape Pettxo! Follow us on Instagram @pettxo for sneak peeks.", type: "end" }
};

function startSurvey() {
  document.querySelector('.form-container button').style.display = 'none'; // Hide the start button
  currentQuestion = "q1";
  renderQuestion(currentQuestion);
}

function renderQuestion(qId) {
  const q = questions[qId];
  if (!q) {
    console.error("Question not found:", qId);
    return;
  }

  const formArea = document.getElementById("formArea");
  let html = `<div class="question"><h3>${q.text}</h3>`;

  if (q.type === "choice") {
    for (let opt in q.options) {
      html += `<button class="option" onclick="handleAnswer('${qId}','${opt}','${q.options[opt]}')">${opt}</button>`;
    }
  } else if (q.type === "multi") {
    html += q.options.map(o => `<label><input type="checkbox" value="${o}" ${answers[qId] && answers[qId].includes(o) ? 'checked' : ''}> ${o}</label><br>`).join("");
    html += `<button onclick="submitMulti('${qId}','${q.next}')">Next</button>`;
  } else if (q.type === "text") {
    html += `<input type="text" id="input_${qId}" placeholder="Type here..." value="${answers[qId] || ''}">`;
    html += `<button onclick="submitText('${qId}','${q.next || "general"}')">Next</button>`;
  } else if (q.type === "email") {
    html += `<input type="email" id="input_${qId}" placeholder="Enter your email..." value="${answers[qId] || ''}" ${q.required ? 'required' : ''}>`;
    html += `<button onclick="submitText('${qId}','${q.next}')">Next</button>`;
  } else if (q.type === "longtext") {
    html += `<textarea id="input_${qId}" rows="4" placeholder="Your thoughts...">${answers[qId] || ''}</textarea>`;
    html += `<button onclick="submitText('${qId}','${q.next}')">Submit</button>`;
  } else if (q.type === "end") {
    html += `<p>${q.text}</p>`;
  }

  // Add the "Previous" button if not on the first question
  if (qId !== "q1" && q.type !== "end") {
    html += `<button class="previous-button" onclick="goBack()">Previous</button>`;
  }

  html += `</div>`;
  formArea.innerHTML = html;
}

function handleAnswer(qId, answer, next) {
  answers[qId] = answer;
  history.push(qId);
  currentQuestion = next;
  if (next === "thankyou") {
    renderQuestion("thankyou");
    console.log("Survey Completed:", answers);
    return;
  }
  renderQuestion(next);
}

function submitMulti(qId, next) {
  const checked = [...document.querySelectorAll("input[type=checkbox]:checked")].map(c => c.value);
  answers[qId] = checked;
  history.push(qId);
  currentQuestion = next;
  renderQuestion(next);
}

function submitText(qId, next) {
  const inputEl = document.getElementById("input_" + qId);
  const val = inputEl.value;

  if (questions[qId].required && !val.trim()) {
      alert("This field is required.");
      return;
  }

  answers[qId] = val;
  history.push(qId);
  currentQuestion = next;
  renderQuestion(next);
}

function goBack() {
  if (history.length > 0) {
    history.pop(); // Remove the current question from history
    const prevQId = history.length > 0 ? history[history.length - 1] : "q1";
    currentQuestion = prevQId;
    renderQuestion(prevQId);
  }
}
