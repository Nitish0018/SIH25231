import { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import "./App.css";

function App() {
  const [language, setLanguage] = useState("English");
  const [page, setPage] = useState("home");

  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const [isListening, setIsListening] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const fileInputRef = useRef(null);

  // ================================
  // LANGUAGE
  // ================================

  const languages = {
    English: {
      speech: "en-IN",
      welcome: "Namaste! 👋",
      subtitle: "I can help you with government services.",
      placeholder: "Type your question here...",
      ask: "Ask JanSetu",
      scan: "Scan Document",
      schemes: "Government Schemes",
      eligibility: "Check Eligibility",
      grievance: "Register Grievance",
      voice: "Speak",
      result: "Your answer",
    },

    Hindi: {
      speech: "hi-IN",
      welcome: "नमस्ते! 👋",
      subtitle: "मैं सरकारी सेवाओं में आपकी मदद कर सकता हूँ।",
      placeholder: "अपना सवाल यहाँ लिखें...",
      ask: "जनसेतु से पूछें",
      scan: "दस्तावेज़ स्कैन करें",
      schemes: "सरकारी योजनाएँ",
      eligibility: "पात्रता जाँचें",
      grievance: "शिकायत दर्ज करें",
      voice: "बोलें",
      result: "आपका उत्तर",
    },

    Gujarati: {
      speech: "gu-IN",
      welcome: "નમસ્તે! 👋",
      subtitle: "હું સરકારી સેવાઓમાં તમારી મદદ કરી શકું છું.",
      placeholder: "તમારો પ્રશ્ન અહીં લખો...",
      ask: "જનસેતુને પૂછો",
      scan: "દસ્તાવેજ સ્કેન કરો",
      schemes: "સરકારી યોજનાઓ",
      eligibility: "પાત્રતા તપાસો",
      grievance: "ફરિયાદ નોંધાવો",
      voice: "બોલો",
      result: "તમારો જવાબ",
    },

    Marathi: {
      speech: "mr-IN",
      welcome: "नमस्कार! 👋",
      subtitle: "मी सरकारी सेवांमध्ये तुमची मदत करू शकतो.",
      placeholder: "तुमचा प्रश्न येथे लिहा...",
      ask: "जनसेतुला विचारा",
      scan: "कागदपत्र स्कॅन करा",
      schemes: "सरकारी योजना",
      eligibility: "पात्रता तपासा",
      grievance: "तक्रार नोंदवा",
      voice: "बोला",
      result: "तुमचे उत्तर",
    },

    Tamil: {
      speech: "ta-IN",
      welcome: "வணக்கம்! 👋",
      subtitle: "அரசு சேவைகளில் நான் உங்களுக்கு உதவ முடியும்.",
      placeholder: "உங்கள் கேள்வியை இங்கே எழுதுங்கள்...",
      ask: "ஜனசேதுவிடம் கேளுங்கள்",
      scan: "ஆவணத்தை ஸ்கேன் செய்யுங்கள்",
      schemes: "அரசு திட்டங்கள்",
      eligibility: "தகுதியை சரிபார்க்கவும்",
      grievance: "புகார் பதிவு செய்யுங்கள்",
      voice: "பேசுங்கள்",
      result: "உங்கள் பதில்",
    },
  };

  const text = languages[language];

  // ================================
  // DEMO SCHEMES
  // ================================

  const schemes = [
    {
      name: "PM Awas Yojana",
      shortName: "Housing Support",
      icon: "🏠",
      description:
        "Financial assistance for eligible families to build or improve a house.",
      category: "Housing",
      income: 300000,
      documents: [
        "Aadhaar Card",
        "Income Certificate",
        "Address Proof",
        "Bank Account",
      ],
    },

    {
      name: "PM-KISAN",
      shortName: "Farmer Support",
      icon: "🌾",
      description:
        "Income support assistance for eligible farmer families.",
      category: "Agriculture",
      income: 500000,
      documents: [
        "Aadhaar Card",
        "Land Records",
        "Bank Account",
        "Mobile Number",
      ],
    },

    {
      name: "Ayushman Bharat",
      shortName: "Health Support",
      icon: "🏥",
      description:
        "Health coverage support for eligible families.",
      category: "Healthcare",
      income: 300000,
      documents: [
        "Aadhaar Card",
        "Family ID",
        "Address Proof",
      ],
    },

    {
      name: "PM Ujjwala Yojana",
      shortName: "LPG Support",
      icon: "🔥",
      description:
        "LPG connection support for eligible households.",
      category: "Household",
      income: 250000,
      documents: [
        "Aadhaar Card",
        "Address Proof",
        "Bank Account",
        "Ration Card",
      ],
    },

    {
      name: "National Scholarship",
      shortName: "Education Support",
      icon: "🎓",
      description:
        "Financial assistance for eligible students.",
      category: "Education",
      income: 250000,
      documents: [
        "Aadhaar Card",
        "Student ID",
        "Income Certificate",
        "Bank Account",
      ],
    },

    {
      name: "PM SVANidhi",
      shortName: "Street Vendor Support",
      icon: "🛒",
      description:
        "Financial support for eligible street vendors.",
      category: "Business",
      income: 400000,
      documents: [
        "Aadhaar Card",
        "Vendor Certificate",
        "Bank Account",
        "Mobile Number",
      ],
    },
  ];

  // ================================
  // ELIGIBILITY FORM
  // ================================

  const [form, setForm] = useState({
    state: "",
    age: "",
    income: "",
    family: "",
    occupation: "",
  });

  const [schemeResults, setSchemeResults] = useState([]);

  const updateForm = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const findSchemes = () => {
    const income = Number(form.income) || 0;

    const results = schemes.filter(
      (scheme) => income === 0 || income <= scheme.income
    );

    setSchemeResults(results);
  };

  // ================================
  // AI RESPONSE
  // ================================

  const getResponse = (input) => {
    const lower = input.toLowerCase();

    if (
      lower.includes("scheme") ||
      lower.includes("yojana") ||
      lower.includes("योजना") ||
      lower.includes("યોજના")
    ) {
      return {
        title: "Government Schemes",
        message:
          "I can help you find suitable government schemes. Please open the Scheme Finder and enter your basic details.",
      };
    }

    if (
      lower.includes("eligible") ||
      lower.includes("eligibility") ||
      lower.includes("पात्र") ||
      lower.includes("પાત્ર")
    ) {
      return {
        title: "Eligibility Check",
        message:
          "To check eligibility, I need your state, age, family income, family size and occupation.",
      };
    }

    if (
      lower.includes("document") ||
      lower.includes("दस्तावेज़") ||
      lower.includes("દસ્તાવેજ")
    ) {
      return {
        title: "Document Help",
        message:
          "Open the Document Scanner and take a clear photograph of your document.",
      };
    }

    if (
      lower.includes("complaint") ||
      lower.includes("grievance") ||
      lower.includes("शिकायत") ||
      lower.includes("ફરિયાદ")
    ) {
      return {
        title: "Grievance Help",
        message:
          "Describe your problem and JanSetu can help classify your grievance.",
      };
    }

    return {
      title: "JanSetu",
      message:
        "I can help with welfare schemes, eligibility, documents and grievances.",
    };
  };

  const askJanSetu = () => {
    if (!question.trim()) return;

    setResponse(getResponse(question));
  };

  // ================================
  // SPEECH TO TEXT
  // ================================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = text.speech;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setQuestion(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // ================================
  // TEXT TO SPEECH
  // ================================

  const speakResponse = () => {
    if (!response) return;

    const speech = new SpeechSynthesisUtterance(
      response.message
    );

    speech.lang = text.speech;

    window.speechSynthesis.speak(speech);
  };

  // ================================
  // OCR
  // ================================

  const handleImage = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    setSelectedImage(imageURL);
    setOcrText("");
    setOcrLoading(true);

    try {
      const worker = await createWorker("eng");

      const result = await worker.recognize(file);

      setOcrText(result.data.text);

      await worker.terminate();
    } catch (error) {
      console.error(error);

      setOcrText(
        "Unable to read this document. Please try a clearer image."
      );
    }

    setOcrLoading(false);
  };

  // ================================
  // HOME
  // ================================

  if (page === "home") {
    return (
      <div className="app">

        <header className="header">

          <div className="brand">

            <div className="brand-icon">
              J
            </div>

            <div>
              <h2>JanSetu</h2>
              <span>Your welfare helper</span>
            </div>

          </div>

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            className="language-select"
          >
            {Object.keys(languages).map(
              (item) => (
                <option key={item}>
                  {item}
                </option>
              )
            )}
          </select>

        </header>


        <main>

          <section className="welcome-section">

            <div className="welcome-text">

              <span className="small-title">
                SIMPLE • SAFE • FOR EVERYONE
              </span>

              <h1>
                Government help,
                <br />
                <span>made easy.</span>
              </h1>

              <p>
                {text.subtitle}
                <br />
                Ask using your voice, type a question,
                or scan a document.
              </p>

              <button
                className="main-button"
                onClick={() =>
                  setPage("assistant")
                }
              >
                🎤 {text.ask}
              </button>

            </div>


            <div className="village-card">

              <div className="sun">
                ☀️
              </div>

              <div className="house">
                🏠
              </div>

              <div className="tree">
                🌳
              </div>

              <div className="farmer">
                👨‍🌾
              </div>

            </div>

          </section>


          <section className="action-section">

            <h2>
              How can we help?
            </h2>

            <div className="action-grid">

              <button
                className="action-card"
                onClick={() =>
                  setPage("assistant")
                }
              >
                <div className="action-icon">
                  🎤
                </div>

                <div>
                  <h3>
                    {text.voice}
                  </h3>

                  <p>
                    Ask by speaking
                  </p>
                </div>
              </button>


              <button
                className="action-card"
                onClick={() =>
                  setPage("schemes")
                }
              >
                <div className="action-icon">
                  🔎
                </div>

                <div>
                  <h3>
                    {text.schemes}
                  </h3>

                  <p>
                    Find benefits for your family
                  </p>
                </div>
              </button>


              <button
                className="action-card"
                onClick={() =>
                  setPage("eligibility")
                }
              >
                <div className="action-icon">
                  ✅
                </div>

                <div>
                  <h3>
                    {text.eligibility}
                  </h3>

                  <p>
                    Find out if you qualify
                  </p>
                </div>
              </button>


              <button
                className="action-card"
                onClick={() =>
                  setPage("ocr")
                }
              >
                <div className="action-icon">
                  📷
                </div>

                <div>
                  <h3>
                    {text.scan}
                  </h3>

                  <p>
                    Take a photo of a document
                  </p>
                </div>
              </button>

            </div>

          </section>


          <section className="privacy-box">

            <span>🔒</span>

            <div>
              <strong>
                Your information matters
              </strong>

              <p>
                JanSetu is designed for private,
                low-connectivity environments.
              </p>
            </div>

          </section>

        </main>

      </div>
    );
  }

  // ================================
  // SCHEME FINDER
  // ================================

  if (page === "schemes") {
    return (
      <div className="app">

        <header className="header">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back
          </button>

          <div className="brand">

            <div className="brand-icon">
              J
            </div>

            <div>
              <h2>JanSetu</h2>
              <span>Scheme Finder</span>
            </div>

          </div>

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
            className="language-select"
          >
            {Object.keys(languages).map(
              (item) => (
                <option key={item}>
                  {item}
                </option>
              )
            )}
          </select>

        </header>


        <main className="tool-page">

          <span className="small-title">
            GOVERNMENT SCHEME FINDER
          </span>

          <h1>
            Find help
            <br />
            <span>for your family.</span>
          </h1>

          <p className="tool-description">
            Tell us a few basic details. JanSetu
            will show schemes that may match your
            situation.
          </p>


          <div className="form-card">

            <label>
              📍 Your State
            </label>

            <select
              value={form.state}
              onChange={(e) =>
                updateForm("state", e.target.value)
              }
            >
              <option value="">
                Select your state
              </option>

              <option>Gujarat</option>
              <option>Maharashtra</option>
              <option>Tamil Nadu</option>
              <option>Rajasthan</option>
              <option>Uttar Pradesh</option>
              <option>Madhya Pradesh</option>
              <option>Karnataka</option>
              <option>Rajasthan</option>
              <option>Delhi</option>
              <option>West Bengal</option>
              <option>Andhra Pradesh</option>
              <option>Telangana</option>
              <option>Bihar</option>
              <option>Kerala</option>
              <option>Punjab</option>
              <option>Haryana</option>
              <option>Odisha</option>
              <option>Chhattisgarh</option>
              <option>Jharkhand</option>
              <option>Assam</option>
              <option>Himachal Pradesh</option>
              <option>Uttarakhand</option>
              <option>Goa</option>
              <option>Tripura</option>
              <option>Meghalaya</option>
              <option>Manipur</option>
              <option>Nagaland</option>
              <option>Mizoram</option>
              <option>Arunachal Pradesh</option>
              <option>Sikkim</option>
              <option>Chandigarh</option>
              <option>Dadra and Nagar Haveli and Daman and Diu</option>
              <option>Ladakh</option>
              <option>Puducherry</option>
              <option>Jammu and Kashmir</option>


            </select>


            <label>
              👤 Your Age
            </label>

            <input
              type="number"
              placeholder="Example: 42"
              value={form.age}
              onChange={(e) =>
                updateForm("age", e.target.value)
              }
            />


            <label>
              💰 Annual Family Income
            </label>

            <input
              type="number"
              placeholder="Example: 150000"
              value={form.income}
              onChange={(e) =>
                updateForm("income", e.target.value)
              }
            />


            <label>
              👨‍👩‍👧 Family Members
            </label>

            <input
              type="number"
              placeholder="Example: 4"
              value={form.family}
              onChange={(e) =>
                updateForm("family", e.target.value)
              }
            />


            <label>
              💼 Occupation
            </label>

            <select
              value={form.occupation}
              onChange={(e) =>
                updateForm(
                  "occupation",
                  e.target.value
                )
              }
            >
              <option value="">
                Select occupation
              </option>

              <option>Farmer</option>
              <option>Student</option>
              <option>Daily Wage Worker</option>
              <option>Street Vendor</option>
              <option>Small Business</option>
              <option>Private Employee</option>
              <option>Government Employee</option>
              <option>Other</option>
            </select>


            <button
              className="main-button full-button"
              onClick={findSchemes}
            >
              🔎 Find Schemes
            </button>

          </div>


          {/* RESULTS */}

          {schemeResults.length > 0 && (

            <div className="scheme-results">

              <div className="results-heading">

                <span className="small-title">
                  MATCHES FOUND
                </span>

                <h2>
                  Schemes for you
                </h2>

                <p>
                  These are possible matches based
                  on the information you provided.
                </p>

              </div>


              <div className="scheme-grid">

                {schemeResults.map(
                  (scheme, index) => (

                    <div
                      className="scheme-card"
                      key={index}
                    >

                      <div className="scheme-icon">
                        {scheme.icon}
                      </div>

                      <div className="scheme-category">
                        {scheme.category}
                      </div>

                      <h3>
                        {scheme.name}
                      </h3>

                      <strong>
                        {scheme.shortName}
                      </strong>

                      <p>
                        {scheme.description}
                      </p>


                      <div className="possible-match">
                        <span>
                          ✓
                        </span>

                        Possible match
                      </div>


                      <div className="documents">

                        <strong>
                          📄 Documents usually needed
                        </strong>

                        {scheme.documents.map(
                          (document, i) => (
                            <div
                              key={i}
                              className="document-item"
                            >
                              ✓ {document}
                            </div>
                          )
                        )}

                      </div>


                      <button
                        className="scheme-details"
                        onClick={() => {
                          setQuestion(
                            `Tell me more about ${scheme.name}`
                          );

                          setPage("assistant");
                        }}
                      >
                        Ask JanSetu about this →
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </main>

      </div>
    );
  }

  // ================================
  // OCR PAGE
  // ================================

  if (page === "ocr") {
    return (
      <div className="app">

        <header className="header">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back
          </button>

          <div className="brand">

            <div className="brand-icon">
              J
            </div>

            <div>
              <h2>JanSetu</h2>
              <span>Document Scanner</span>
            </div>

          </div>

          <div></div>

        </header>


        <main className="tool-page">

          <span className="small-title">
            DOCUMENT SCANNER
          </span>

          <h1>
            Scan your
            <br />
            <span>document.</span>
          </h1>

          <p className="tool-description">
            Take a clear photo of your certificate,
            form or government document.
          </p>


          <div className="scanner-card">

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              hidden
            />


            {!selectedImage && (

              <button
                className="scan-button"
                onClick={() =>
                  fileInputRef.current.click()
                }
              >
                <span>📷</span>

                <strong>
                  Take Photo
                </strong>

                <small>
                  or choose an image
                </small>
              </button>

            )}


            {selectedImage && (

              <div className="image-preview">

                <img
                  src={selectedImage}
                  alt="Selected document"
                />

                <button
                  onClick={() =>
                    fileInputRef.current.click()
                  }
                >
                  Scan another
                </button>

              </div>

            )}


            {ocrLoading && (

              <div className="loading-box">

                <div className="loader"></div>

                <strong>
                  Reading document...
                </strong>

                <p>
                  Please wait.
                </p>

              </div>

            )}


            {ocrText && !ocrLoading && (

              <div className="ocr-result">

                <div className="result-header">

                  <h2>
                    Extracted Text
                  </h2>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        ocrText
                      );
                    }}
                  >
                    Copy
                  </button>

                </div>

                <textarea
                  value={ocrText}
                  onChange={(e) =>
                    setOcrText(e.target.value)
                  }
                />

                <button
                  className="main-button"
                  onClick={() =>
                    setPage("assistant")
                  }
                >
                  Explain this document →
                </button>

              </div>

            )}

          </div>

        </main>

      </div>
    );
  }

  // ================================
  // ELIGIBILITY
  // ================================

  if (page === "eligibility") {
    return (
      <div className="app">

        <header className="header">

          <button
            className="back-button"
            onClick={() => setPage("home")}
          >
            ← Back
          </button>

          <div className="brand">

            <div className="brand-icon">
              J
            </div>

            <div>
              <h2>JanSetu</h2>
              <span>Eligibility Helper</span>
            </div>

          </div>

          <div></div>

        </header>


        <main className="tool-page">

          <span className="small-title">
            WELFARE ELIGIBILITY
          </span>

          <h1>
            Check if you
            <br />
            <span>qualify.</span>
          </h1>

          <p className="tool-description">
            Answer a few simple questions.
            JanSetu will compare your information
            with scheme rules.
          </p>


          <div className="form-card">

            <label>
              Your State
            </label>

            <select>
              <option>
                Select your state
              </option>

              <option>Gujarat</option>
              <option>Maharashtra</option>
              <option>Tamil Nadu</option>
            </select>


            <label>
              Age
            </label>

            <input
              type="number"
              placeholder="Enter your age"
            />


            <label>
              Annual Family Income
            </label>

            <input
              type="number"
              placeholder="Example: 150000"
            />


            <label>
              Family Members
            </label>

            <input
              type="number"
              placeholder="Number of family members"
            />


            <button
              className="main-button full-button"
              onClick={() => {
                setResponse({
                  title: "Information received",
                  message:
                    "Your information has been collected. In the complete JanSetu system, these details will be checked against official scheme rules.",
                });

                setPage("assistant");
              }}
            >
              Check Eligibility →
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ================================
  // ASSISTANT
  // ================================

  return (
    <div className="app">

      <header className="header">

        <button
          className="back-button"
          onClick={() => setPage("home")}
        >
          ← Back
        </button>

        <div className="brand">

          <div className="brand-icon">
            J
          </div>

          <div>
            <h2>JanSetu</h2>
            <span>Citizen Assistant</span>
          </div>

        </div>


        <select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          className="language-select"
        >
          {Object.keys(languages).map(
            (item) => (
              <option key={item}>
                {item}
              </option>
            )
          )}
        </select>

      </header>


      <main className="assistant-container">

        <div className="assistant-title">

          <span className="small-title">
            JANSETU AI ASSISTANT
          </span>

          <h1>
            {text.welcome}
            <br />
            <span>How can I help?</span>
          </h1>

        </div>


        <div className="chat-box">

          <div className="ai-message">

            <div className="ai-avatar">
              ✦
            </div>

            <div>

              <strong>
                JanSetu
              </strong>

              <p>
                {text.subtitle}
              </p>

            </div>

          </div>


          {response && (

            <div className="answer-box">

              <div className="answer-title">

                <strong>
                  {text.result}
                </strong>

                <button
                  onClick={speakResponse}
                >
                  🔊 Listen
                </button>

              </div>

              <h3>
                {response.title}
              </h3>

              <p>
                {response.message}
              </p>

            </div>

          )}


          <div className="input-area">

            <textarea
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              placeholder={text.placeholder}
            />

            <div className="input-buttons">

              <button
                className={
                  isListening
                    ? "voice-button listening"
                    : "voice-button"
                }
                onClick={startVoiceInput}
              >
                🎤

                <span>
                  {isListening
                    ? "Listening..."
                    : text.voice}
                </span>

              </button>


              <button
                className="send-button-large"
                onClick={askJanSetu}
              >
                ↑
              </button>

            </div>

          </div>

        </div>


        <div className="quick-section">

          <h3>
            Try asking
          </h3>

          <div className="quick-grid">

            <button
              onClick={() =>
                setPage("schemes")
              }
            >
              🏛️
              <span>
                Find government schemes
              </span>
            </button>


            <button
              onClick={() =>
                setPage("eligibility")
              }
            >
              ✅
              <span>
                Check my eligibility
              </span>
            </button>


            <button
              onClick={() =>
                setPage("ocr")
              }
            >
              📷
              <span>
                Scan a document
              </span>
            </button>


            <button
              onClick={() =>
                setQuestion(
                  "I want to register a grievance"
                )
              }
            >
              📝
              <span>
                Register a grievance
              </span>
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default App;