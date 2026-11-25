// Set the school's WhatsApp number here (international format, no + or spaces).
// Leave it empty and the floating button stays hidden.
export const WHATSAPP_NUMBER = "";
export const WHATSAPP_MESSAGE = "Hello, I need help with the Mayakas Management System.";

export const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I register a new student?",
    a: "Go to Students, then click + Register student. Fill in the details, choose the curriculum, then the grade or level, and save. The admission number is created automatically.",
  },
  {
    q: "How do I edit a student's details?",
    a: "Go to Students and click the ✏️ Edit button next to the student. Change what you need and click Save changes.",
  },
  {
    q: "How do I remove a student from the list?",
    a: "Open the student's edit page and untick Active student, then save. The student is hidden from the list, but their records are kept.",
  },
  {
    q: "How are staff numbers assigned?",
    a: "Staff numbers are created automatically in the format STF/2026/0001 when you save a new staff member. You can't change them.",
  },
  {
    q: "What departments can I choose for staff?",
    a: "Choose from the department list on the staff form, such as Mathematics, English, Sciences, or Support Staff for non-teaching workers.",
  },
  {
    q: "What photo files can I upload?",
    a: "Any picture from your phone or computer. The system resizes it automatically, so large camera photos work.",
  },
  {
    q: "How do I set up fee structures?",
    a: "Go to Finance, then Fee structures & balances. Add the fee for each curriculum, grade, year, and term. You can edit or delete a fee structure later.",
  },
  {
    q: "How do I record a payment?",
    a: "Go to Finance and click + Record payment. Choose the student, enter the amount and method, and save.",
  },
  {
    q: "Why can't I save a record?",
    a: "The message on the form tells you what to fix, such as a missing field or a grade that doesn't match the curriculum. If it still won't save, WhatsApp us with a screenshot.",
  },
  {
    q: "Who do I contact for other problems?",
    a: "Use the floating WhatsApp button at the bottom right of any page. Our team will reply as soon as possible.",
  },
];
