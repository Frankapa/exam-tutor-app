// Sample WAEC/JAMB-style questions. In a real product these would come from
// a database or CMS, but a plain object is enough to demo the quiz flow.

export const QUESTION_BANK = {
  Mathematics: [
    {
      question: "Simplify: 3(2x − 4) − 2(x − 5)",
      options: ["4x − 2", "4x + 2", "8x − 22", "4x − 22"],
      correctIndex: 0,
      note: "Expand both brackets first: 6x − 12 − 2x + 10 = 4x − 2.",
    },
    {
      question: "If y = 3x + 2 and x = 4, find y.",
      options: ["10", "12", "14", "16"],
      correctIndex: 2,
      note: "y = 3(4) + 2 = 12 + 2 = 14.",
    },
    {
      question: "Find the value of x if 2x + 5 = 17.",
      options: ["4", "5", "6", "7"],
      correctIndex: 2,
      note: "2x = 12, so x = 6.",
    },
    {
      question: "What is the LCM of 6 and 8?",
      options: ["12", "16", "24", "48"],
      correctIndex: 2,
      note: "Multiples of 6: 6,12,18,24. Multiples of 8: 8,16,24. First common one is 24.",
    },
    {
      question:
        "A trader bought an item for ₦2,000 and sold it for ₦2,500. Find the percentage profit.",
      options: ["20%", "25%", "30%", "50%"],
      correctIndex: 1,
      note: "Profit = ₦500. Percentage = 500/2000 × 100 = 25%.",
    },
    {
      question: "Find the next number in the sequence: 2, 6, 12, 20, 30, ...",
      options: ["36", "40", "42", "44"],
      correctIndex: 2,
      note: "Differences are 4,6,8,10,12 — so next term is 30 + 12 = 42.",
    },
    {
      question: "The angles in a triangle are in ratio 2:3:4. Find the smallest angle.",
      options: ["20°", "30°", "40°", "60°"],
      correctIndex: 2,
      note: "Total ratio parts = 2+3+4 = 9. One part = 180° ÷ 9 = 20°. Smallest angle = 2 × 20° = 40°.",
    },
    {
      question: "Solve for x: x² − 5x + 6 = 0",
      options: ["x = 1 or 6", "x = 2 or 3", "x = -2 or -3", "x = 5 or 6"],
      correctIndex: 1,
      note: "Factorise: (x−2)(x−3) = 0, so x = 2 or x = 3.",
    },
    {
      question: "Convert 0.75 to a fraction in its lowest term.",
      options: ["3/4", "7/10", "15/20", "5/8"],
      correctIndex: 0,
      note: "0.75 = 75/100 = 3/4 after simplifying.",
    },
    {
      question: "A car travels 240km in 4 hours. What is its average speed?",
      options: ["50km/h", "60km/h", "70km/h", "80km/h"],
      correctIndex: 1,
      note: "Speed = distance ÷ time = 240 ÷ 4 = 60km/h.",
    },
  ],

  "English Language": [
    {
      question:
        "Choose the option that best completes the sentence: Neither the teacher nor the students ___ ready for the test.",
      options: ["was", "were", "is", "has been"],
      correctIndex: 1,
      note: "With 'neither...nor', the verb agrees with the nearer subject — 'students' is plural, so 'were' is correct.",
    },
    {
      question: "Select the correctly spelt word.",
      options: ["Occassion", "Ocasion", "Occasion", "Occasionn"],
      correctIndex: 2,
      note: "The correct spelling is 'Occasion' — double C, single S.",
    },
    {
      question: "Choose the word nearest in meaning to 'RETICENT'.",
      options: ["Talkative", "Reserved", "Angry", "Confused"],
      correctIndex: 1,
      note: "'Reticent' means reserved or reluctant to speak openly.",
    },
    {
      question:
        "Identify the figure of speech in: 'The classroom was a zoo during break time.'",
      options: ["Simile", "Metaphor", "Personification", "Hyperbole"],
      correctIndex: 1,
      note: "It directly calls the classroom 'a zoo' without using 'like' or 'as' — that's a metaphor.",
    },
    {
      question: "Choose the option opposite in meaning to 'GENEROUS'.",
      options: ["Kind", "Wealthy", "Stingy", "Humble"],
      correctIndex: 2,
      note: "'Stingy' means unwilling to give, the opposite of generous.",
    },
    {
      question: "Fill the gap: She is used to ___ up early every morning.",
      options: ["wake", "waking", "woken", "wakes"],
      correctIndex: 1,
      note: "'Used to' followed by a verb takes the gerund form: 'waking'.",
    },
    {
      question: "Which sentence is grammatically correct?",
      options: [
        "He don't like rice.",
        "He doesn't likes rice.",
        "He doesn't like rice.",
        "He not like rice.",
      ],
      correctIndex: 2,
      note: "Third person singular negative uses 'doesn't' + base verb: 'He doesn't like rice.'",
    },
    {
      question: "The underlined word in 'She spoke ELOQUENTLY at the ceremony' is a/an ___.",
      options: ["Noun", "Adjective", "Adverb", "Preposition"],
      correctIndex: 2,
      note: "'Eloquently' describes how she spoke — it modifies the verb, so it's an adverb.",
    },
    {
      question:
        "Choose the option that best explains the idiom: 'to let the cat out of the bag'.",
      options: [
        "To play with a pet",
        "To reveal a secret",
        "To cause trouble",
        "To escape danger",
      ],
      correctIndex: 1,
      note: "This idiom means to accidentally reveal a secret.",
    },
    {
      question: "Choose the correct plural form of 'CRISIS'.",
      options: ["Crisises", "Crisis", "Crises", "Crisi"],
      correctIndex: 2,
      note: "Words ending in '-is' from Greek/Latin often form plurals with '-es': crisis → crises.",
    },
  ],
};
