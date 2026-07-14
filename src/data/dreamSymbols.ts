// Classical Islamic dream symbols compiled from Ibn Sirin's "Tafsir al-Ahlam al-Kabir"
// and Al-Nabulsi's "Ta'tir al-Anam fi Tabir al-Manam".
// Each interpretation is a concise summary of the classical scholarly view.

export interface DreamSymbol {
  slug: string;
  name: string;
  nameArabic: string;
  letter: string;
  summary: string;
  interpretation: string;
  scholars: {
    scholar: "Ibn Sirin" | "Al-Nabulsi";
    text: string;
  }[];
}

export const dreamSymbols: DreamSymbol[] = [
  {
    slug: "angel",
    name: "Angel",
    nameArabic: "ملك",
    letter: "A",
    summary: "Divine messengers signifying honor, glad tidings, and elevated rank.",
    interpretation:
      "Seeing angels in a dream generally denotes glad tidings, honor, and victory over enemies. If the angels greet the dreamer or offer something, it is a sign of increased faith and blessings.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Angels entering a place indicate the coming of security, mercy, or victory to its people." },
      { scholar: "Al-Nabulsi", text: "An angel giving the dreamer a gift signifies knowledge, guidance, or worldly provision without hardship." },
    ],
  },
  {
    slug: "blood",
    name: "Blood",
    nameArabic: "دم",
    letter: "B",
    summary: "Forbidden wealth, sin, or matters that must be purified.",
    interpretation:
      "Blood in a dream often points to unlawful earnings or a sin the dreamer should repent from. If it flows without pain, it may indicate release from a burden.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever sees blood come out of him without wound, is freed from a sin or a debt." },
      { scholar: "Al-Nabulsi", text: "Drinking blood in a dream signifies unlawful money or falling into a major sin." },
    ],
  },
  {
    slug: "book",
    name: "Book",
    nameArabic: "كتاب",
    letter: "B",
    summary: "Knowledge, a decree, or a covenant received.",
    interpretation:
      "A book in a dream represents knowledge, authority, or a message. Receiving an open book in the right hand is a sign of accepted deeds; receiving it in the left hand warns of neglect.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The book is the covenant of Allah. Reading it easily indicates guidance and knowledge." },
      { scholar: "Al-Nabulsi", text: "A sealed book denotes a hidden matter; an open book denotes clear news that will soon reach the dreamer." },
    ],
  },
  {
    slug: "cat",
    name: "Cat",
    nameArabic: "قط",
    letter: "C",
    summary: "A treacherous servant, thief, or someone close who deceives.",
    interpretation:
      "A cat generally represents a person of the household who is not sincere — a servant, or a companion who takes without permission.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The cat is a thieving servant. Killing it indicates overcoming a betrayer in one's own home." },
      { scholar: "Al-Nabulsi", text: "A tame cat is a wife who does not benefit her husband; a wild cat is a thief from among one's relatives." },
    ],
  },
  {
    slug: "camel",
    name: "Camel",
    nameArabic: "جمل",
    letter: "C",
    summary: "A powerful man, a long journey, or grief and hardship endured.",
    interpretation:
      "The camel signifies a man of authority, particularly one who is patient. Riding a docile camel indicates travel, marriage, or victory; being thrown from it warns of illness or loss of rank.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The Arabian camel is a noble Arab man; leading one denotes leadership over a group." },
      { scholar: "Al-Nabulsi", text: "A camel entering a town without owner indicates a calamity, plague, or a tyrannical ruler." },
    ],
  },
  {
    slug: "death",
    name: "Death",
    nameArabic: "موت",
    letter: "D",
    summary: "Reduction in religion, a long journey, or repentance from sin.",
    interpretation:
      "Seeing one's own death without burial often means a long journey, marriage, or a major life change. Death with washing and shrouding warns of decline in religious practice unless followed by repentance.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever sees himself dead and then buried, his affairs in religion have become corrupted, unless he wakes reciting Qur'an." },
      { scholar: "Al-Nabulsi", text: "Seeing a deceased person alive and joyful indicates their good state; seeing them sorrowful is a call for du'a and charity on their behalf." },
    ],
  },
  {
    slug: "door",
    name: "Door",
    nameArabic: "باب",
    letter: "D",
    summary: "A gateway of provision, a woman of the house, or a means to one's needs.",
    interpretation:
      "Doors represent the means by which sustenance and opportunities come. An open door indicates ease and welcome news; a locked door indicates a matter withheld.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The door of a house is its mistress; whoever repairs a door has reconciled with his wife." },
      { scholar: "Al-Nabulsi", text: "Many doors in a single house indicate many paths of provision opening for the dreamer." },
    ],
  },
  {
    slug: "eagle",
    name: "Eagle",
    nameArabic: "نسر",
    letter: "E",
    summary: "A powerful king, long life, or elevation in rank.",
    interpretation:
      "The eagle is among the noblest birds in dreams. Capturing one indicates authority; being carried by one indicates travel to a distant land under protection.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The eagle is a mighty king, feared and long-lived." },
      { scholar: "Al-Nabulsi", text: "An eagle descending upon a place indicates the arrival of a ruler or a decisive event for its people." },
    ],
  },
  {
    slug: "eye",
    name: "Eye",
    nameArabic: "عين",
    letter: "E",
    summary: "One's religion, insight, and the state of one's faith.",
    interpretation:
      "The eye represents the dreamer's religion and guidance. Improved eyesight indicates increased faith; blindness warns of misguidance or loss of a child.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The eye is the religion of a man; brightness in it is the light of Islam within him." },
      { scholar: "Al-Nabulsi", text: "Losing one eye indicates loss of half one's religion or wealth; losing both is a severe warning to return to Allah." },
    ],
  },
  {
    slug: "fire",
    name: "Fire",
    nameArabic: "نار",
    letter: "F",
    summary: "A ruler's punishment, strife, or purification depending on its state.",
    interpretation:
      "Fire that gives light and warmth without harm indicates guidance and blessing. Fire that burns homes or bodies warns of a tyrant, war, or a sin that must be extinguished by repentance.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever sees a fire in his house without smoke or harm, honor and authority have entered upon him." },
      { scholar: "Al-Nabulsi", text: "Fire falling from the sky upon a place indicates the punishment of Allah or the injustice of a ruler." },
    ],
  },
  {
    slug: "fish",
    name: "Fish",
    nameArabic: "سمك",
    letter: "F",
    summary: "Provision from a distant source, spoils, or a woman of noble character.",
    interpretation:
      "Fresh fish caught from clean water signifies lawful sustenance and good news. Rotten fish or fish from murky water warns of unlawful earnings or slander.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Large fish caught from the sea are spoils and lawful provision; small fish are worries." },
      { scholar: "Al-Nabulsi", text: "Eating cooked fish indicates travel in pursuit of provision that will be attained with ease." },
    ],
  },
  {
    slug: "gold",
    name: "Gold",
    nameArabic: "ذهب",
    letter: "G",
    summary: "For men, a warning of loss or fine; for women, adornment and joy.",
    interpretation:
      "Gold in a man's dream is generally disliked and indicates a loss, a fine, or grief, because it is forbidden for men to wear. For women it signifies beauty, a husband, or a righteous child.",
    scholars: [
      { scholar: "Ibn Sirin", text: "A man wearing gold in a dream will be afflicted with a matter he dislikes from a ruler." },
      { scholar: "Al-Nabulsi", text: "For a woman, gold jewelry indicates a husband or a son; melted gold warns of a quarrel with the tongue." },
    ],
  },
  {
    slug: "garden",
    name: "Garden",
    nameArabic: "بستان",
    letter: "G",
    summary: "A righteous wife, the Qur'an, or the rewards of good deeds.",
    interpretation:
      "A green, well-watered garden signifies a pious wife, guidance, or the fruits of one's worship. A withered garden warns of neglect in religion or family.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The garden is a woman; entering a fruitful garden is marrying a righteous woman." },
      { scholar: "Al-Nabulsi", text: "Eating from the fruits of a garden indicates receiving the reward of one's deeds in this life." },
    ],
  },
  {
    slug: "house",
    name: "House",
    nameArabic: "بيت",
    letter: "H",
    summary: "The dreamer's own self, family, or standing in the world.",
    interpretation:
      "A house represents the dreamer's condition. Building a new house indicates marriage, a new venture, or improved state. A collapsing house warns of a death in the family or loss of standing.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever sees his house wider than it was, good has come to him in his life and family." },
      { scholar: "Al-Nabulsi", text: "An unknown house is the grave, or the world itself; entering it easily indicates a peaceful ending." },
    ],
  },
  {
    slug: "horse",
    name: "Horse",
    nameArabic: "خيل",
    letter: "H",
    summary: "Honor, a noble companion, or fulfillment of hopes.",
    interpretation:
      "A well-bred horse indicates dignity, a supportive spouse, or victory. Falling from a horse warns of loss of rank or a broken commitment.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The horse is a man's honor and reputation; a swift horse indicates the attainment of a hoped-for matter." },
      { scholar: "Al-Nabulsi", text: "A white horse indicates a righteous wife; a black horse indicates authority and abundance." },
    ],
  },
  {
    slug: "iron",
    name: "Iron",
    nameArabic: "حديد",
    letter: "I",
    summary: "Strength, worldly provision attained by effort, and firmness.",
    interpretation:
      "Iron in a dream indicates strength and lasting benefit that comes through hardship. Working with iron shows earning a living through skill and endurance.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Iron in a dream is strength and provision; whoever finds iron finds power in his hand." },
      { scholar: "Al-Nabulsi", text: "A blacksmith in a dream is a ruler or a man of great influence over others' affairs." },
    ],
  },
  {
    slug: "jewel",
    name: "Jewel",
    nameArabic: "جوهرة",
    letter: "J",
    summary: "A righteous child, the Qur'an, or precious knowledge.",
    interpretation:
      "Pearls and jewels in a dream signify children of good character, memorized verses of the Qur'an, or knowledge of lasting benefit.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Pearls are the Qur'an and beautiful children; stringing them is memorizing surahs in order." },
      { scholar: "Al-Nabulsi", text: "A broken jewel warns of loss of a child or the forgetting of what one had memorized." },
    ],
  },
  {
    slug: "key",
    name: "Key",
    nameArabic: "مفتاح",
    letter: "K",
    summary: "Answered supplication, access to provision, and opened matters.",
    interpretation:
      "A key represents relief from a difficulty and the opening of a means of livelihood. Many keys indicate authority; a lost key warns of a matter that remains closed.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Keys are the answering of du'a, and the treasures of provision opened for the servant." },
      { scholar: "Al-Nabulsi", text: "Iron keys are strong authority; wooden keys are weak matters that will not last." },
    ],
  },
  {
    slug: "light",
    name: "Light",
    nameArabic: "نور",
    letter: "L",
    summary: "Guidance, knowledge, and the light of Islam in the heart.",
    interpretation:
      "Light in a dream is one of the strongest signs of guidance and truthful knowledge. Carrying a lamp indicates a scholar or a guide; extinguished light warns of confusion in matters of religion.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Light is guidance; whoever walks in light in his dream walks upon the Sunnah in his waking life." },
      { scholar: "Al-Nabulsi", text: "A light rising from the dreamer's chest indicates knowledge that will benefit many people." },
    ],
  },
  {
    slug: "milk",
    name: "Milk",
    nameArabic: "لبن",
    letter: "M",
    summary: "The pure natural disposition (fitrah), knowledge, and lawful provision.",
    interpretation:
      "Milk is among the most praised drinks in dreams, indicating the fitrah, sound knowledge, and pure sustenance. Drinking milk from an animal signifies lawful wealth acquired with ease.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Milk is the fitrah and knowledge; whoever drinks it deeply is granted understanding of religion." },
      { scholar: "Al-Nabulsi", text: "Sour milk indicates a hardship in provision; pure fresh milk is unblemished halal earnings." },
    ],
  },
  {
    slug: "moon",
    name: "Moon",
    nameArabic: "قمر",
    letter: "M",
    summary: "A minister, a scholar, or a beautiful and beloved person.",
    interpretation:
      "A full moon signifies a person of authority second only to the highest, such as a minister or a great scholar. The moon in one's lap is a righteous spouse or child.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The full moon is the vizier of the king; seeing it clearly in one's house is honor entering the family." },
      { scholar: "Al-Nabulsi", text: "An eclipsed moon warns of the death of a great person or affliction upon a scholar." },
    ],
  },
  {
    slug: "mountain",
    name: "Mountain",
    nameArabic: "جبل",
    letter: "M",
    summary: "A powerful man, a firm goal, or steadfastness in trials.",
    interpretation:
      "Ascending a mountain indicates attaining a difficult goal or reaching a person of high rank. Descending safely indicates release from a burden.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever climbs a mountain and reaches its summit attains what he seeks from a powerful man." },
      { scholar: "Al-Nabulsi", text: "A mountain that trembles indicates fear coming upon the leader of a people." },
    ],
  },
  {
    slug: "night",
    name: "Night",
    nameArabic: "ليل",
    letter: "N",
    summary: "Rest, concealment of matters, or the approach of a hidden difficulty.",
    interpretation:
      "Night with visible stars signifies calm and reflection; a dark, moonless night indicates confusion, worry, or a period in which truth is hidden.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Night is a covering; whoever sees himself walking through it easily, his affair will be resolved though currently hidden." },
      { scholar: "Al-Nabulsi", text: "A long night indicates prolonged worry; a short night followed by dawn indicates relief close at hand." },
    ],
  },
  {
    slug: "oil",
    name: "Oil",
    nameArabic: "زيت",
    letter: "O",
    summary: "Blessing (barakah), knowledge, and cure from ailment.",
    interpretation:
      "Olive oil in particular indicates barakah, healing, and beneficial knowledge. Anointing oneself with pure oil signifies remembrance of Allah and protection from harm.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Olive oil is barakah and healing; whoever anoints himself with it is safeguarded from the evil eye." },
      { scholar: "Al-Nabulsi", text: "Spilled oil warns of loss of a blessing that had been prepared for the dreamer." },
    ],
  },
  {
    slug: "prayer",
    name: "Prayer",
    nameArabic: "صلاة",
    letter: "P",
    summary: "Fulfillment of a promise, uprightness, and attainment of one's need.",
    interpretation:
      "Performing a prescribed prayer in its proper direction and time signifies the fulfillment of a trust or a promised matter. Praying without wudu warns of asking from other than Allah.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever prays a completed prayer facing the qiblah fulfills a covenant and attains what he hopes for." },
      { scholar: "Al-Nabulsi", text: "Praying while riding indicates travel with safety; praying in a strange direction warns of misguidance." },
    ],
  },
  {
    slug: "quran",
    name: "Qur'an",
    nameArabic: "قرآن",
    letter: "Q",
    summary: "Truth, wisdom, and the highest guidance.",
    interpretation:
      "Reciting Qur'an in a dream is among the greatest of visions, signifying honor, protection, and elevated station. Hearing Qur'an calms the heart and dispels fear.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Whoever recites the Qur'an in his dream, wisdom and dignity are given to him among people." },
      { scholar: "Al-Nabulsi", text: "Memorizing a surah in a dream indicates the attainment of a rank commensurate with that surah's virtue." },
    ],
  },
  {
    slug: "rain",
    name: "Rain",
    nameArabic: "مطر",
    letter: "R",
    summary: "Mercy, provision, and relief after difficulty.",
    interpretation:
      "Gentle rain indicates mercy from Allah, ease of provision, and the removal of grief. Violent, destructive rain warns of a trial afflicting a region.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Rain in its season is mercy and provision; out of season it warns of a trial upon a specific people." },
      { scholar: "Al-Nabulsi", text: "Drinking clean rainwater indicates lawful provision entering the dreamer's home with ease." },
    ],
  },
  {
    slug: "river",
    name: "River",
    nameArabic: "نهر",
    letter: "R",
    summary: "A great man, a source of provision, or the passage of one's affairs.",
    interpretation:
      "A clear-flowing river indicates a generous person or a stable source of lawful income. Crossing a river safely denotes overcoming a major difficulty.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The river is a great man from whom people take their needs; drinking from it is receiving from his goodness." },
      { scholar: "Al-Nabulsi", text: "A dry riverbed warns of the death of a generous benefactor or the ending of a livelihood." },
    ],
  },
  {
    slug: "snake",
    name: "Snake",
    nameArabic: "ثعبان",
    letter: "S",
    summary: "A hidden enemy, particularly among relatives or neighbors.",
    interpretation:
      "A snake represents an enemy proportionate to its size. Killing a snake indicates victory over that enemy; being bitten warns of harm from a person the dreamer trusts.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The snake is an enemy from the family or the neighbors; the larger the snake, the greater the enemy." },
      { scholar: "Al-Nabulsi", text: "A white snake is a weak enemy easily overcome; a black snake is a fierce and resourceful adversary." },
    ],
  },
  {
    slug: "star",
    name: "Star",
    nameArabic: "نجم",
    letter: "S",
    summary: "Scholars, notable people, or guiding companions.",
    interpretation:
      "Stars represent the notables of a community — scholars, leaders, or elders. A falling star warns of the death of such a person; a bright star rising indicates the emergence of a righteous leader.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Stars are the scholars and nobles of the people; catching a star is befriending or benefiting from one of them." },
      { scholar: "Al-Nabulsi", text: "Stars falling into one's lap indicates children who will become people of knowledge and honor." },
    ],
  },
  {
    slug: "sun",
    name: "Sun",
    nameArabic: "شمس",
    letter: "S",
    summary: "The greatest authority — a king, a father, or a spouse.",
    interpretation:
      "The sun represents the highest ruler or the person of greatest authority in the dreamer's life. Its rising indicates honor and expansion; its eclipse warns of harm to that authority.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The sun is the greatest king; its light entering the house is honor entering upon its people." },
      { scholar: "Al-Nabulsi", text: "The eclipse of the sun warns of a calamity befalling the ruler or the head of the family." },
    ],
  },
  {
    slug: "tree",
    name: "Tree",
    nameArabic: "شجرة",
    letter: "T",
    summary: "A man of standing, a lineage, or lasting deeds.",
    interpretation:
      "A firmly-rooted, fruit-bearing tree indicates a righteous man, a strong family line, or deeds whose reward endures. A tree uprooted warns of the loss of such a man.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Trees are men in their variety; the date palm is an Arab man of noble religion." },
      { scholar: "Al-Nabulsi", text: "Planting a tree indicates fathering a righteous child or founding a work whose benefit will last." },
    ],
  },
  {
    slug: "teeth",
    name: "Teeth",
    nameArabic: "أسنان",
    letter: "T",
    summary: "Family members, particularly by age and closeness.",
    interpretation:
      "Teeth represent the dreamer's relatives. Upper teeth are the men of the family and lower teeth the women. Losing a tooth without pain often means separation or the passing of a relative, though many classical scholars caution against literal interpretation without further context.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The upper teeth are the men of the family and the lower are the women; the front teeth are one's own children and parents." },
      { scholar: "Al-Nabulsi", text: "A tooth falling into the hand and being preserved indicates the birth of a child or the return of a relative from a journey." },
    ],
  },
  {
    slug: "umbrella",
    name: "Umbrella / Shade",
    nameArabic: "مظلة",
    letter: "U",
    summary: "Protection from a ruler, from difficulty, or from the heat of a trial.",
    interpretation:
      "Shade or an umbrella in a dream signifies the protection of a powerful person, or the safeguarding of one's affairs from harm and public exposure.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Shade is the shelter of a ruler; whoever finds shade on a hot day has found refuge with a powerful person." },
      { scholar: "Al-Nabulsi", text: "A torn umbrella warns that a protector will withdraw his help at a time of need." },
    ],
  },
  {
    slug: "veil",
    name: "Veil",
    nameArabic: "حجاب",
    letter: "V",
    summary: "Chastity, protection of honor, and concealment of one's affairs.",
    interpretation:
      "A veil signifies modesty, the guarding of one's honor, and the concealing of a private matter. A torn veil warns of exposure of what should have remained hidden.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The veil for a woman is her chastity and dignity; a new veil indicates a righteous husband." },
      { scholar: "Al-Nabulsi", text: "A veil covering a man's face indicates that Allah has covered a fault of his among people." },
    ],
  },
  {
    slug: "water",
    name: "Water",
    nameArabic: "ماء",
    letter: "W",
    summary: "Life, provision, and the state of one's religion.",
    interpretation:
      "Pure, clear water indicates lawful provision, life, and sound faith. Drinking it deeply signifies knowledge and long life. Muddy or salty water warns of unlawful earnings or affliction.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Clear water is lawful provision and the life of religion; drinking it satisfies both body and soul." },
      { scholar: "Al-Nabulsi", text: "Standing water indicates confinement or an unresolved matter; flowing water indicates movement in one's affairs." },
    ],
  },
  {
    slug: "wedding",
    name: "Wedding",
    nameArabic: "زواج",
    letter: "W",
    summary: "A new bond, provision, or (in some contexts) an ending of a matter.",
    interpretation:
      "For the unmarried, a wedding in a dream often signifies actual marriage or a new partnership. For a sick person, some classical scholars warned that a wedding to an unknown person may signify the approach of death — Allah knows best.",
    scholars: [
      { scholar: "Ibn Sirin", text: "Marrying a known and living woman is joy, provision, and honor coming to the dreamer." },
      { scholar: "Al-Nabulsi", text: "Marrying an unknown woman whose name is not known indicates the world entering into the dreamer's hand." },
    ],
  },
  {
    slug: "wolf",
    name: "Wolf",
    nameArabic: "ذئب",
    letter: "W",
    summary: "An unjust, thieving, and treacherous enemy.",
    interpretation:
      "A wolf signifies an oppressor or a thief who acts openly. Overcoming a wolf indicates prevailing over a strong and dishonest adversary.",
    scholars: [
      { scholar: "Ibn Sirin", text: "The wolf is a strong, unjust thief; whoever kills one in a dream defeats such an enemy in waking life." },
      { scholar: "Al-Nabulsi", text: "A wolf entering a home indicates a thief entering, or a false accusation reaching its people." },
    ],
  },
];

export const symbolsByLetter = dreamSymbols.reduce<Record<string, DreamSymbol[]>>((acc, s) => {
  (acc[s.letter] ??= []).push(s);
  return acc;
}, {});

export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
