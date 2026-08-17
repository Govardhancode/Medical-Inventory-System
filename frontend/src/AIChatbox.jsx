import { useEffect, useRef, useState } from "react";
import "./AIChatbox.css";

const API_URL = "http://localhost:8080/api";

function AIChatbox({ medicines = [], totalBills = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! 👋 I'm MedInventory AI. Ask me anything about your inventory, medicines, stock, billing, expiry dates, or how to use the system.",
    },
  ]);

  const [input, setInput] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  // =====================================================
  // INVENTORY CONTEXT
  // =====================================================

  const getInventoryContext = () => {
    const today = new Date();

    const lowStockMedicines = medicines.filter(
      (medicine) =>
        Number(medicine.quantity || 0) <= 10
    );

    const outOfStockMedicines = medicines.filter(
      (medicine) =>
        Number(medicine.quantity || 0) <= 0
    );

    const expiringSoonMedicines = medicines.filter(
      (medicine) => {
        if (!medicine.expiryDate) {
          return false;
        }

        const expiry = new Date(
          medicine.expiryDate
        );

        const difference =
          (expiry - today) /
          (1000 * 60 * 60 * 24);

        return (
          difference >= 0 &&
          difference <= 90
        );
      }
    );

    const expiredMedicines = medicines.filter(
      (medicine) => {
        if (!medicine.expiryDate) {
          return false;
        }

        return (
          new Date(medicine.expiryDate) <
          today
        );
      }
    );

    return {
      totalMedicines: medicines.length,

      totalStock: medicines.reduce(
        (sum, medicine) =>
          sum +
          Number(medicine.quantity || 0),
        0
      ),

      totalBills,

      lowStockCount:
        lowStockMedicines.length,

      outOfStockCount:
        outOfStockMedicines.length,

      expiringSoonCount:
        expiringSoonMedicines.length,

      expiredCount:
        expiredMedicines.length,

      lowStockMedicines:
        lowStockMedicines.map(
          (medicine) => ({
            name: medicine.name,
            quantity:
              Number(
                medicine.quantity || 0
              ),
            category:
              medicine.category,
          })
        ),

      outOfStockMedicines:
        outOfStockMedicines.map(
          (medicine) => ({
            name: medicine.name,
            quantity:
              Number(
                medicine.quantity || 0
              ),
          })
        ),

      expiringSoonMedicines:
        expiringSoonMedicines.map(
          (medicine) => ({
            name: medicine.name,
            expiryDate:
              medicine.expiryDate,
            quantity:
              Number(
                medicine.quantity || 0
              ),
          })
        ),

      expiredMedicines:
        expiredMedicines.map(
          (medicine) => ({
            name: medicine.name,
            expiryDate:
              medicine.expiryDate,
            quantity:
              Number(
                medicine.quantity || 0
              ),
          })
        ),
    };
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = async () => {
    const question = input.trim();

    if (!question || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question,
            inventoryContext:
              getInventoryContext(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to get AI response."
        );
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data.answer ||
          "I couldn't generate an answer.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "AI chat error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error.message ||
            "Sorry, I couldn't connect to MedInventory AI. Please make sure the Spring Boot backend is running and the OpenAI API key is configured.",
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  // =====================================================
  // CLEAR CHAT
  // =====================================================

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Chat cleared. 👋 What would you like to know about MedInventory?",
      },
    ]);
  };

  // =====================================================
  // QUICK QUESTIONS
  // =====================================================

  const quickQuestions = [
    "Which medicines are low in stock?",
    "Which medicines are expiring soon?",
    "How many medicines do we have?",
    "How do I create a bill?",
  ];

  const askQuickQuestion = (question) => {
    if (isLoading) {
      return;
    }

    setInput(question);

    setTimeout(() => {
      sendQuickQuestion(question);
    }, 50);
  };

  const sendQuickQuestion = async (
    question
  ) => {
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/ai/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question,
            inventoryContext:
              getInventoryContext(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to get AI response."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            data.answer ||
            "I couldn't generate an answer.",
        },
      ]);
    } catch (error) {
      console.error(
        "Quick AI question error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error.message ||
            "Unable to connect to AI.",
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          FLOATING AI BUTTON
      ================================================= */}

      {!isOpen && (
        <button
          type="button"
          className="ai-floating-button"
          onClick={() =>
            setIsOpen(true)
          }
          title="Ask MedInventory AI"
        >
          <span className="ai-floating-icon">
            🤖
          </span>

          <span className="ai-floating-label">
            Ask AI
          </span>
        </button>
      )}

      {/* =================================================
          CHAT WINDOW
      ================================================= */}

      {isOpen && (
        <div className="ai-chat-window">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="ai-chat-header">

            <div className="ai-header-info">

              <div className="ai-header-avatar">
                🤖
              </div>

              <div>
                <strong>
                  MedInventory AI
                </strong>

                <span>
                  <i></i>
                  AI Assistant
                </span>
              </div>

            </div>

            <div className="ai-header-actions">

              <button
                type="button"
                onClick={clearChat}
                title="Clear chat"
              >
                🗑
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                title="Close"
              >
                ×
              </button>

            </div>

          </div>

          {/* =================================================
              CHAT BODY
          ================================================= */}

          <div className="ai-chat-body">

            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className={
                    message.role ===
                    "user"
                      ? "ai-message-row user"
                      : "ai-message-row"
                  }
                >

                  {message.role ===
                    "assistant" && (
                    <div className="ai-message-avatar">
                      🤖
                    </div>
                  )}

                  <div
                    className={
                      message.role ===
                      "user"
                        ? "ai-message user-message"
                        : message.error
                        ? "ai-message assistant-message error"
                        : "ai-message assistant-message"
                    }
                  >
                    {message.content}
                  </div>

                </div>
              )
            )}

            {isLoading && (
              <div className="ai-message-row">

                <div className="ai-message-avatar">
                  🤖
                </div>

                <div className="ai-message assistant-message typing-message">

                  <span></span>
                  <span></span>
                  <span></span>

                  <small>
                    AI is thinking...
                  </small>

                </div>

              </div>
            )}

            <div
              ref={messagesEndRef}
            />

          </div>

          {/* =================================================
              QUICK QUESTIONS
          ================================================= */}

          {messages.length <= 2 &&
            !isLoading && (
              <div className="ai-quick-questions">

                <small>
                  Try asking:
                </small>

                <div>
                  {quickQuestions.map(
                    (question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() =>
                          askQuickQuestion(
                            question
                          )
                        }
                      >
                        {question}
                      </button>
                    )
                  )}
                </div>

              </div>
            )}

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="ai-chat-input-area">

            <textarea
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask MedInventory AI..."
              rows="1"
              disabled={isLoading}
            />

            <button
              type="button"
              className="ai-send-button"
              onClick={sendMessage}
              disabled={
                !input.trim() ||
                isLoading
              }
              title="Send"
            >
              ➤
            </button>

          </div>

          <div className="ai-chat-footer">
            AI can help with MedInventory questions.
          </div>

        </div>
      )}
    </>
  );
}

export default AIChatbox;