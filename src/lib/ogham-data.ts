// src/lib/ogham-data.ts

// Ogham letters data (Aicme A, B, C, D, and Forfeda)
// This data is now centralized here to be used by both frontend and backend.
export const oghamLetters = [
    // Aicme Beithe (Birch Group)
    { letter: "Beith", tree: "Birch", symbol: "ᚁ", meaning: "Birch, Beginnings, New starts, Purification, Renewal" },
    { letter: "Luis", tree: "Rowan", symbol: "ᚂ", meaning: "Rowan, Protection, Insight, Vision, Control" },
    { letter: "Fearn", tree: "Alder", symbol: "ᚃ", meaning: "Alder, Shield, Foundation, Strength, Release" },
    { letter: "Saille", tree: "Willow", symbol: "ᚄ", meaning: "Willow, Intuition, The Unconscious, Flexibility, The Moon" },
    { letter: "Nuin", tree: "Ash", symbol: "ᚅ", meaning: "Ash, Connection, The World Tree, Links, Weaving" },
    // Aicme hÚatha (Hawthorn Group)
    { letter: "Huathe", tree: "Hawthorn", symbol: "ᚆ", meaning: "Hawthorn, Consequence, Cleansing, Trial, Restraint" },
    { letter: "Dair", tree: "Oak", symbol: "ᚇ", meaning: "Oak, Strength, Endurance, Sovereignty, Protection" },
    { letter: "Tinne", tree: "Holly", symbol: "ᚈ", meaning: "Holly, Challenge, Action, Defence, The Warrior" },
    { letter: "Coll", tree: "Hazel", symbol: "ᚉ", meaning: "Hazel, Wisdom, Knowledge, Divination, Inspiration" },
    { letter: "Quert", tree: "Apple", symbol: "ᚊ", meaning: "Apple, Choice, Healing, Beauty, Love" },
    // Aicme Muine (Vine Group)
    { letter: "Muin", tree: "Vine", symbol: "ᚋ", meaning: "Vine, Harvest, Introspection, Prophecy, The Inward Journey" },
    { letter: "Gort", tree: "Ivy", symbol: "ᚌ", meaning: "Ivy, Growth, Tenacity, Development, The Wild Self" },
    { letter: "Ngetal", tree: "Reed", symbol: "ᚍ", meaning: "Reed, Direct Action, Purpose, Health, Order" },
    { letter: "Straif", tree: "Blackthorn", symbol: "ᚎ", meaning: "Blackthorn, Strife, The Inevitable, Fate, Overcoming obstacles" },
    { letter: "Ruis", tree: "Elder", symbol: "ᚏ", meaning: "Elder, Endings and Beginnings, Transition, The Crone, Maturity" },
    // Aicme Ailme (Pine Group)
    { letter: "Ailm", tree: "Pine", symbol: "ᚐ", meaning: "Pine/Fir, Perspective, Foresight, The Long View, Objectivity" },
    { letter: "Onn", tree: "Gorse", symbol: "ᚑ", meaning: "Gorse, Gathering, Sustained effort, Long-term goals, The Sun" },
    { letter: "Ur", tree: "Heather", symbol: "ᚒ", meaning: "Heather, Passion, Healing, The Earth, Sensuality" },
    { letter: "Eadhadh", tree: "Aspen", symbol: "ᚓ", meaning: "Aspen, Endurance, Overcoming, Courage, Resilience" },
    { letter: "Idho", tree: "Yew", symbol: "ᚔ", meaning: "Yew, Death and Rebirth, Ancestors, The Past, Immortality" },
    // Forfeda (The 'Extra' Letters)
    { letter: "Eabhadh", tree: "Aspen", symbol: "ᚕ", meaning: "Groove/Aspen, Adaptability, Twin aspects, Duality" },
    { letter: "Or", tree: "Spindle", symbol: "ᚖ", meaning: "Spindle/Gold, Inheritance, Legacy, The Hearth, Community" },
    { letter: "Uilleann", tree: "Honeysuckle", symbol: "ᚗ", meaning: "Honeysuckle/Elbow, Connection, Seeking, The Soul's desire" },
    { letter: "Ifin", tree: "Pine", symbol: "ᚘ", meaning: "Pine, Sweetness, The 'in-between' places, Unexpected gifts" },
    { letter: "Aamhancholl", tree: "Witch Hazel", symbol: "ᚙ", meaning: "Witch Hazel, Duality, Protection, Hidden knowledge" },
];

export type OghamLetterData = (typeof oghamLetters)[0];
