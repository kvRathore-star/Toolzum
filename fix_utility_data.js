const CONTENT = {
  // ===== RANDOM GENERATORS =====
  "random-number-generator": {
    instructions: [
      { title: "1. Set Range Boundaries", desc: "Enter a minimum and maximum value in the range fields. The generator will produce a random integer between these two bounds using a cryptographically secure random function." },
      { title: "2. Choose Quantity", desc: "Specify how many random numbers you need in a single batch — from 1 up to 100. Each number is independently generated so results never repeat in a predictable pattern." },
      { title: "3. Copy or Download Results", desc: "Once generated, click the copy button to copy all numbers to your clipboard as a comma-separated list, or download them as a plain text file." }
    ],
    faqs: [
      { question: "Can I generate floating-point numbers instead of integers?", answer: "No, this generator produces whole integers only. For decimal values, round the result yourself or use a calculator tool after generation." },
      { question: "Is the random number generation truly random?", answer: "This generator uses window.crypto.getRandomValues, a cryptographically secure pseudo-random number generator. It is suitable for lotteries, giveaways, and security-sensitive draws." },
      { question: "What happens if I set the minimum higher than the maximum?", answer: "The tool automatically swaps the values so the lower number becomes the minimum and the higher becomes the maximum. No error is thrown." }
    ]
  },

  "random-string-generator": {
    instructions: [
      { title: "1. Select Character Pool", desc: "Toggle character types on or off — uppercase letters, lowercase letters, digits, and special symbols. At least one type must be selected before generation." },
      { title: "2. Set String Length", desc: "Drag the slider or type a value between 1 and 256 characters. Longer strings are exponentially more unique and suitable for API keys or tokens." },
      { title: "3. Generate and Copy", desc: "Press the generate button to produce a random string from your chosen pool. Click the copy icon next to the output to copy it to your clipboard instantly." }
    ],
    faqs: [
      { question: "Can I exclude ambiguous characters like O, 0, I, and l?", answer: "Yes, toggle the ambiguous characters filter to exclude characters that look similar across different fonts. This is useful for human-readable codes." },
      { question: "Does this generator guarantee unique strings on every call?", answer: "No, uniqueness is probabilistic. Each character is chosen independently so collisions are possible, though astronomically unlikely at 256 characters with a full pool." },
      { question: "Can I generate multiple strings at once like a bulk operation?", answer: "No, this tool generates one string at a time. For bulk string generation, click generate repeatedly or use a dedicated bulk password generator." }
    ]
  },

  "random-color-generator": {
    instructions: [
      { title: "1. Pick a Color Format", desc: "Choose between HEX, RGB, HSL, or CMYK output formats. Each format displays the same underlying color in a different notation suited for different design contexts." },
      { title: "2. Lock Desired Channels", desc: "Click the lock icon next to any color channel (red, green, blue) to freeze its value. Locked channels stay constant while unlocked channels randomize on each generation." },
      { title: "3. Generate and Preview", desc: "Click generate to see a new random color displayed as a swatch. The hex code, RGB values, and a complementary color suggestion appear below the preview." }
    ],
    faqs: [
      { question: "Can I generate a palette of multiple random colors at once?", answer: "No, this tool generates one color at a time. For multiple coordinated colors, use the Color Palette Generator tool instead." },
      { question: "Does the generator avoid very dark or very light colors?", answer: "No, every color in the full 16.7-million-color spectrum is equally likely. Use the lock feature to constrain brightness by locking the luminance channel." },
      { question: "What is the color locking feature for?", answer: "Lock lets you fix one or more color channels while randomizing others. For example, lock red at 255 to generate random shades of red." }
    ]
  },

  "random-team-generator": {
    instructions: [
      { title: "1. Enter Participant Names", desc: "Type or paste a list of participant names — one per line or separated by commas. The tool parses each entry as an individual team member." },
      { title: "2. Choose Team Count or Size", desc: "Toggle between specifying the number of teams or the number of members per team. The tool automatically calculates the other value and alerts you if members must be left out." },
      { title: "3. Shuffle and Assign", desc: "Click generate to randomly shuffle all participants into balanced teams. Each team gets roughly equal members when the total is not evenly divisible." }
    ],
    faqs: [
      { question: "Can I assign a team name or captain automatically?", answer: "No, the tool only assigns members to numbered teams (Team 1, Team 2, etc.). You can rename teams manually after generation." },
      { question: "What happens if I have an odd number of participants?", answer: "Teams are balanced so the difference in size between any two teams is never more than one. The extra members are distributed starting from Team 1." },
      { question: "Can I save or share the generated teams?", answer: "Yes, click the copy button to copy the team breakdown to your clipboard as formatted text, or download it as a text file." }
    ]
  },

  "random-picker-generator": {
    instructions: [
      { title: "1. Build Your List", desc: "Add items one by one in the input field, pressing Enter or the add button after each. Each item becomes an entry in the pool for the random pick." },
      { title: "2. Set Pick Count", desc: "Choose how many items to pick — 1 for a single winner, or more for multiple selections. The tool can pick with or without replacement." },
      { title: "3. Run the Pick", desc: "Click the pick button to randomly select items. With replacement enabled, the same item can be picked multiple times. Without replacement, each item is removed from the pool after selection." }
    ],
    faqs: [
      { question: "What is the difference between picking with and without replacement?", answer: "With replacement means an item can be picked more than once in a single run. Without replacement means each item can only be picked once, like drawing names from a hat." },
      { question: "Can I import a list from a CSV or text file?", answer: "Yes, paste comma-separated or newline-separated values directly into the input area. The tool parses them into individual list items automatically." },
      { question: "Is there a limit on how many items I can add to the list?", answer: "You can add up to 10,000 items per list. Performance may slow slightly with very large lists but the pick algorithm remains fast." }
    ]
  },

  "random-decision-maker": {
    instructions: [
      { title: "1. Enter Your Options", desc: "Type each possible choice on a separate line. The tool needs at least two options to make a meaningful decision between them." },
      { title: "2. Add Weights (Optional)", desc: "Assign a weight percentage to each option to bias the decision. A 70% weight on one option means it is chosen 70% of the time." },
      { title: "3. Reveal the Decision", desc: "Click the decide button to see a dramatic animation that lands on one option. The result is displayed with a colored highlight." }
    ],
    faqs: [
      { question: "Can I re-pick if I don't like the result?", answer: "Yes, click decide again. Each decision is independent and random. The tool does not track history or prevent repeat results." },
      { question: "How do weighted options work mathematically?", answer: "The weights are normalized into probabilities. If option A has weight 50 and option B has weight 25, A has a 66.67% chance and B has a 33.33% chance of being selected." },
      { question: "Can I save my list of options for later?", answer: "No, the tool does not persist data. Your options are cleared when you close or refresh the page. Copy them to a text file to reuse later." }
    ]
  },

  "random-username-generator": {
    instructions: [
      { title: "1. Configure Name Structure", desc: "Choose a pattern — adjective-noun, random-name, or alphanumeric. Adjective-noun combines a dictionary word pair for memorable usernames." },
      { title: "2. Append a Suffix", desc: "Toggle whether to add a random number suffix (e.g., 42, 891) to the base name. This helps create unique usernames when the base word is common." },
      { title: "3. Generate and Preview", desc: "Click generate to produce a list of available usernames. Each entry shows a preview and a copy button for instant use." }
    ],
    faqs: [
      { question: "Are the generated usernames checked for availability on any platform?", answer: "No, the tool generates random name combinations locally. It does not check availability on any website or service." },
      { question: "Can I exclude offensive or inappropriate word combinations?", answer: "Yes, the profanity filter is enabled by default. It blocks known offensive word pairs from the adjective and noun dictionaries." },
      { question: "How many usernames can I generate at once?", answer: "Up to 50 usernames can be generated in a single batch. Each is unique within the batch but may collide with previously generated usernames." }
    ]
  },

  "random-date-generator": {
    instructions: [
      { title: "1. Set Date Range", desc: "Pick a start date and an end date using the date pickers. The generated random date will fall somewhere within this range inclusive of both boundaries." },
      { title: "2. Choose Output Format", desc: "Select from formats like YYYY-MM-DD, DD/MM/YYYY, Month DD, YYYY, or M/D/YYYY. The date value stays the same but the string representation changes." },
      { title: "3. Generate and Use", desc: "Click generate to produce a random date. Copy the formatted result to your clipboard or generate a new one if you need a different date." }
    ],
    faqs: [
      { question: "Does the generator include leap days?", answer: "Yes, February 29 can appear if the random date falls on a leap year within the specified range. The probability matches its natural frequency." },
      { question: "Can I generate a random time as well as a date?", answer: "No, this tool generates only dates. For random times, use the Random Time Generator tool which includes hours, minutes, and seconds." },
      { question: "What if I want only weekdays and no weekends?", answer: "The current version includes all days of the week. There is no filter to exclude weekends. You can regenerate if you land on an unwanted day." }
    ]
  },

  "random-time-generator": {
    instructions: [
      { title: "1. Set Time Boundaries", desc: "Choose a start time and end time using hour and minute selectors. The generated time will fall randomly between these two times." },
      { title: "2. Select Precision", desc: "Choose whether to generate times to the nearest hour, minute, or second. Finer precision gives more granular random times within the window." },
      { title: "3. Choose 12h or 24h Format", desc: "Toggle between 12-hour format with AM/PM and 24-hour military format. The generated time value is identical but displayed differently." }
    ],
    faqs: [
      { question: "Can I include or exclude specific time intervals like lunch breaks?", answer: "No, the tool only uses start and end boundaries. There is no interval exclusion. Adjust the boundaries to exclude unwanted ranges." },
      { question: "Does the time generator also output a date?", answer: "No, it generates only the time component. Pair it with Random Date Generator if you need both date and time." },
      { question: "Can I generate multiple random times at once?", answer: "Yes, set the quantity option to generate up to 50 random times in a single batch, all independently chosen within the range." }
    ]
  },

  "random-sentence-generator": {
    instructions: [
      { title: "1. Choose Sentence Structure", desc: "Pick from simple, compound, or complex sentence templates. Simple generates subject-verb-object patterns, while complex includes subordinate clauses." },
      { title: "2. Set Word Complexity", desc: "Adjust a slider from simple to complex vocabulary. Simple uses common English words; complex pulls from a larger dictionary including less common terms." },
      { title: "3. Generate Multiple Sentences", desc: "Set how many sentences to produce — from 1 to 20. Each sentence is independently constructed using the Markov-chain word selection algorithm." }
    ],
    faqs: [
      { question: "Can I generate a full paragraph instead of individual sentences?", answer: "Yes, select the paragraph mode which links 3-5 generated sentences together with transitional phrases for coherent flow." },
      { question: "Are the generated sentences grammatically correct?", answer: "The generator follows English grammar templates but occasionally produces semantically odd or nonsensical sentences, especially with complex vocabulary." },
      { question: "Can I use a custom word list as the source vocabulary?", answer: "No, the word list is fixed. You cannot import custom vocabulary. The generator uses a built-in dictionary of approximately 5,000 English words." }
    ]
  },

  "random-word-generator": {
    instructions: [
      { title: "1. Select Word Category", desc: "Filter by part of speech — noun, verb, adjective, adverb, or any. Narrowing the category produces words useful for specific writing exercises." },
      { title: "2. Set Minimum and Maximum Length", desc: "Define word length constraints using the range sliders. Short words (2-4 letters) are good for games, long words (8+) for vocabulary building." },
      { title: "3. Generate and Define", desc: "Click generate to see random words. Each word displays its part of speech and a short definition from the built-in dictionary." }
    ],
    faqs: [
      { question: "How large is the built-in word dictionary?", answer: "The dictionary contains over 10,000 English words with definitions, parts of speech, and syllable counts sourced from a curated lexicon." },
      { question: "Can I exclude words I have already seen?", answer: "No, the tool does not track history. Words can repeat across generations. Refresh the page to reset the session state." },
      { question: "Can the generator produce words for Scrabble or crossword puzzles?", answer: "Yes, filter by letter count and enable the tournament word list to generate only valid Scrabble words from the official dictionary." }
    ]
  },

  "sequence-generator": {
    instructions: [
      { title: "1. Set Start and End Values", desc: "Enter the starting number and ending number for your sequence. The generator counts from start to end inclusive using the specified step." },
      { title: "2. Configure Step Increment", desc: "Set the step value — 1 for consecutive integers, 2 for evens or odds, 10 for tens, or any custom step. Negative steps create descending sequences." },
      { title: "3. Choose Output Format", desc: "Select whether to output as a comma-separated list, newline-separated, or a fixed-width table. Copy the formatted sequence to your clipboard." }
    ],
    faqs: [
      { question: "Can I generate a sequence of dates instead of numbers?", answer: "No, this tool generates numeric sequences only. For date sequences, use the Random Date Generator or work with date-specific tools." },
      { question: "What happens if the start and step produce an infinite sequence?", answer: "The generator caps output at 10,000 elements. If start, step, and end would produce more, it stops at 10,000 entries." },
      { question: "Can I generate a Fibonacci or custom formula sequence?", answer: "No, only arithmetic sequences with constant step values are supported. Fibonacci and geometric sequences are not implemented." }
    ]
  },

  "nickname-generator": {
    instructions: [
      { title: "1. Enter a Base Name", desc: "Type the full name you want to derive nicknames from. The generator analyzes the name's syllables, consonants, and common nickname patterns." },
      { title: "2. Choose Nickname Style", desc: "Select from styles like diminutive (Bob from Robert), rhyming, edgy, or cutesy. Each style applies different truncation and suffix rules." },
      { title: "3. Browse Suggestions", desc: "View the generated nickname list ranked by similarity score. Each nickname includes a brief explanation of how it was derived from the base name." }
    ],
    faqs: [
      { question: "Can I generate nicknames for group or team names?", answer: "No, this tool generates personal nicknames from individual names. For team names, use the Random Team Generator instead." },
      { question: "Does the generator work with non-English names?", answer: "It works best with English and Western names. Non-English names may produce fewer or less culturally appropriate suggestions." },
      { question: "Can I save my favorite nicknames from the list?", answer: "Yes, click the star icon next to any nickname to add it to a favorites list that persists during your session." }
    ]
  },

  "ulid-generator": {
    instructions: [
      { title: "1. Choose Timestamp Mode", desc: "Select whether to use the current timestamp, a specific date, or a random timestamp. ULIDs encode time as the first 10 characters for sortability." },
      { title: "2. Set Generation Count", desc: "Specify how many ULIDs to generate — 1 for a single ID, or up to 100 for bulk. Each ULID is globally unique and time-sortable." },
      { title: "3. Copy as Array", desc: "Click the copy button to copy all generated ULIDs as a JavaScript array string, comma-separated list, or one per line for easy pasting into code." }
    ],
    faqs: [
      { question: "What makes ULIDs different from UUIDs?", answer: "ULIDs are 26-character, Crockford-base32 encoded identifiers that are lexicographically sortable by time. They are shorter than UUIDs and preserve time ordering." },
      { question: "Can ULIDs be used as database primary keys?", answer: "Yes, their time-sortable nature makes them excellent for B-tree indexed database keys. They avoid fragmentation issues that random UUIDs cause." },
      { question: "Are ULIDs cryptographically secure?", answer: "The random component uses a cryptographically secure PRNG. However, the timestamp component is predictable, so ULIDs should not be used for security tokens." }
    ]
  },

  // ===== TIMERS & CLOCKS =====
  "timer": {
    instructions: [
      { title: "1. Set Duration", desc: "Use the hour, minute, and second dropdowns to set the countdown duration. The maximum allowed is 99 hours, 59 minutes, and 59 seconds." },
      { title: "2. Start and Pause", desc: "Press the green start button to begin the countdown. Use the pause button to freeze the remaining time, then resume by pressing start again." },
      { title: "3. Reset and Restart", desc: "Press reset to return the timer to its original duration. A notification sound plays when the timer reaches zero and can be toggled on or off." }
    ],
    faqs: [
      { question: "Does the timer continue running if I navigate away from the tab?", answer: "Yes, the timer uses service workers to keep running in the background. However, browser throttling may reduce accuracy after several minutes of inactivity." },
      { question: "Can I set multiple timers at the same time?", answer: "No, this is a single timer. For multiple concurrent timers, use the Interval Timer tool which supports interval-based timing." },
      { question: "Is there a lap or split time feature?", answer: "No, the basic timer only counts down. Use the Stopwatch tool if you need lap and split tracking." }
    ]
  },

  "stopwatch": {
    instructions: [
      { title: "1. Start Timing", desc: "Press the start button to begin the stopwatch. The display shows elapsed time in hours, minutes, seconds, and hundredths of a second." },
      { title: "2. Record Laps", desc: "Press the lap button each time you want to record a split. Each lap entry shows the lap number, lap time, and cumulative elapsed time." },
      { title: "3. Stop and Review", desc: "Press stop to freeze the elapsed time. Review all recorded laps in the table below. You can export the lap data as a CSV file." }
    ],
    faqs: [
      { question: "What is the maximum time the stopwatch can measure?", answer: "The stopwatch can run for up to 99 hours, 59 minutes, and 59.99 seconds before rolling over. This is sufficient for most timing needs." },
      { question: "How accurate is the stopwatch timing?", answer: "Accuracy depends on the browser's requestAnimationFrame timing, typically within 10-20 milliseconds. For precision timing, use a dedicated hardware stopwatch." },
      { question: "Can I pause and resume without clearing laps?", answer: "Yes, pressing pause freezes the display but preserves all recorded laps. Press start to resume timing from where you paused." }
    ]
  },

  "countdown-tool": {
    instructions: [
      { title: "1. Set Target Date and Time", desc: "Enter the exact date and time you want to count down to. The tool automatically calculates the difference from the current moment." },
      { title: "2. Add an Event Label", desc: "Type a name for your event (e.g., Project Deadline, New Year). The label appears above the countdown display for easy identification." },
      { title: "3. View Breakdown", desc: "The countdown shows days, hours, minutes, and seconds remaining. Each unit updates in real-time. The display turns red when less than 24 hours remain." }
    ],
    faqs: [
      { question: "Does the countdown adjust for time zones?", answer: "It uses your device's local time zone. If you set a specific time zone, the tool converts it to your local time for the countdown calculation." },
      { question: "Can I save multiple countdown events?", answer: "Yes, created events are saved to local storage and displayed as a list. You can switch between active countdowns without losing any." },
      { question: "Does the tool work offline after the page loads?", answer: "Yes, once the page is loaded, the countdown runs entirely client-side and works without an internet connection." }
    ]
  },

  "interval-timer": {
    instructions: [
      { title: "1. Configure Work and Rest Periods", desc: "Set the duration for work intervals and rest intervals separately using the minute and second selectors for each phase." },
      { title: "2. Set Number of Rounds", desc: "Choose how many work-rest cycles to complete. A warm-up and cool-down period can also be added before and after the main intervals." },
      { title: "3. Start the Sequence", desc: "Press start to begin. The timer cycles through warm-up, work, rest, and cool-down phases automatically with audible alerts between transitions." }
    ],
    faqs: [
      { question: "Can I customize the alert sound for each phase transition?", answer: "Yes, select different alert sounds for work-to-rest and rest-to-work transitions from a dropdown of 6 built-in tones." },
      { question: "What happens if I pause mid-workout?", answer: "The current interval pauses and the elapsed time within that interval is preserved. Pressing start resumes from where you left off." },
      { question: "Can I set different work and rest durations per round?", answer: "No, all rounds use the same work and rest durations. For variable intervals, run separate sessions with different settings." }
    ]
  },

  "tabata-timer": {
    instructions: [
      { title: "1. Set Standard Tabata Parameters", desc: "Configure the 20-second work period and 10-second rest period (standard Tabata protocol). Both durations can be customized as needed." },
      { title: "2. Choose Number of Cycles", desc: "Set how many Tabata cycles to complete. The standard protocol is 8 cycles totaling 4 minutes, but you can go up to 20 cycles." },
      { title: "3. Prepare and Start", desc: "A 10-second countdown prepares you before the first interval begins. The timer alternates between work and rest with distinct audio cues and color changes." }
    ],
    faqs: [
      { question: "What is the standard Tabata protocol duration?", answer: "The original Tabata protocol is 20 seconds of intense work followed by 10 seconds of rest, repeated for 8 cycles totaling 4 minutes." },
      { question: "Can I customize the work and rest durations?", answer: "Yes, while the default is 20/10 for the standard Tabata protocol, you can set any work and rest durations from 1 to 999 seconds." },
      { question: "Does the timer show accumulated work time?", answer: "Yes, the display shows both the current interval countdown and the total accumulated work time across all completed cycles." }
    ]
  },

  "world-clock": {
    instructions: [
      { title: "1. Search and Add Cities", desc: "Type a city name in the search box and select from autocomplete suggestions. Added cities appear as individual clock cards displaying local time." },
      { title: "2. Compare Time Zones", desc: "View all added cities side by side. Each card shows the current time, date, UTC offset, and whether daylight saving time is active." },
      { title: "3. Reorder and Remove", desc: "Drag city cards to reorder them by priority. Click the remove button to delete a city. Your selections are saved to local storage for next visit." }
    ],
    faqs: [
      { question: "How many cities can I add to the world clock view?", answer: "You can add up to 20 cities simultaneously. The time zone database covers over 50,000 locations worldwide via the IANA time zone database." },
      { question: "Does the clock auto-update for daylight saving changes?", answer: "Yes, all displayed times auto-update when DST starts or ends in each city's time zone. The UTC offset shown reflects current DST status." },
      { question: "Can I share my world clock layout with someone else?", answer: "Yes, click the share button to generate a URL containing your city list. Anyone opening that URL sees the same city configuration." }
    ]
  },

  // ===== CONVERTERS =====
  "time-converter": {
    instructions: [
      { title: "1. Enter the Time Value", desc: "Type a numeric value into the input field. This is the amount of time you want to convert from one unit to another." },
      { title: "2. Select Source and Target Units", desc: "Choose the unit you are converting from (e.g., hours) and the unit you are converting to (e.g., minutes). Supported units include milliseconds, seconds, minutes, hours, days, weeks, months, and years." },
      { title: "3. View Converted Result", desc: "The converted value appears instantly as you type. Multiple target conversions are shown simultaneously so you can see the value expressed in all supported units at once." }
    ],
    faqs: [
      { question: "How does the converter handle months and years since they have variable lengths?", answer: "Months are assumed to be 30.44 days and years 365.25 days on average. For exact calendar months, use a date calculator instead." },
      { question: "Can I convert from nanoseconds or microseconds?", answer: "No, the smallest supported unit is milliseconds. For sub-millisecond precision, convert to seconds (e.g., microseconds ÷ 1,000,000)." },
      { question: "Does the converter support scientific notation input?", answer: "Yes, you can enter values in scientific notation like 1.5e3 for 1,500. The output will display in both standard and scientific formats." }
    ]
  },

  "speed-converter": {
    instructions: [
      { title: "1. Enter Speed Value", desc: "Input the numerical speed you want to convert. This can be any positive real number representing speed in the selected source unit." },
      { title: "2. Select Conversion Units", desc: "Choose from km/h, mph, knots, m/s, ft/s, and Mach. The Mach calculation uses the speed of sound at sea level (343 m/s or 1,125 ft/s)." },
      { title: "3. Compare Results", desc: "All converted values update in real-time as you type. A speed scale bar shows where your value falls relative to common benchmarks like walking, cycling, and car speed." }
    ],
    faqs: [
      { question: "What is the difference between knots and nautical miles per hour?", answer: "They are identical — one knot equals one nautical mile per hour. Knots are used in aviation and maritime contexts while mph is used on land." },
      { question: "Does the Mach conversion account for altitude and temperature?", answer: "No, Mach is calculated using the standard sea-level speed of sound (343 m/s). At higher altitudes the actual Mach number would differ." },
      { question: "Can I convert speed values in reverse order?", answer: "Yes, click the swap button between the unit selectors to reverse the conversion direction without re-entering values." }
    ]
  },

  "speed-converter-advanced": {
    instructions: [
      { title: "1. Enter Speed with Custom Precision", desc: "Input a speed value and set the decimal precision from 0 to 10 decimal places. This is useful for scientific and engineering calculations." },
      { title: "2. Add Altitude and Temperature", desc: "Optionally enter altitude in meters and temperature in Celsius for an adjusted Mach calculation. The speed of sound changes with both parameters." },
      { title: "3. View Full Conversion Table", desc: "Generate a conversion table showing your value in all speed units simultaneously. Download the table as CSV for use in reports or analysis." }
    ],
    faqs: [
      { question: "How does altitude affect the Mach conversion?", answer: "The speed of sound decreases with altitude due to lower air temperature. At 10,000 meters, Mach 1 is approximately 299 m/s versus 343 m/s at sea level." },
      { question: "Can I convert between km/h and m/s with this tool?", answer: "Yes, all standard speed units including km/h, m/s, mph, knots, ft/s, and Mach are supported in both Basic and Advanced modes." },
      { question: "What is the difference between this and the basic speed converter?", answer: "The advanced version adds altitude/temperature inputs for accurate Mach, adjustable decimal precision, and a downloadable conversion table." }
    ]
  },

  "length-converter": {
    instructions: [
      { title: "1. Enter Length Value", desc: "Type the numeric length you want to convert. The input accepts values from 0 to 1,000,000,000 in any supported unit." },
      { title: "2. Choose Units", desc: "Select from millimeters, centimeters, meters, kilometers, inches, feet, yards, miles, nautical miles, and astronomical units." },
      { title: "3. View Instant Results", desc: "All converted values update in milliseconds as you type or change units. The most common conversions are highlighted at the top of the results panel." }
    ],
    faqs: [
      { question: "Does the converter handle fractional inches like 1/16?", answer: "No, all inputs must be decimal numbers. For fractional inches (e.g., 3/8 inch), calculate the decimal equivalent (0.375) before converting." },
      { question: "Can I convert between metric and imperial in both directions?", answer: "Yes, every supported unit can be both a source and target. Convert miles to kilometers or millimeters to inches with equal ease." },
      { question: "Are light-years or parsecs supported?", answer: "No, astronomical distances are limited to astronomical units (AU). For interstellar distances, convert to AU and multiply by 63,241 to get light-years manually." }
    ]
  },

  "weight-converter": {
    instructions: [
      { title: "1. Enter Weight Value", desc: "Type the numerical weight you wish to convert. The tool supports values from 0 up to 1 billion units." },
      { title: "2. Select Units", desc: "Choose from milligrams, grams, kilograms, metric tons, ounces, pounds, stones, and troy ounces. Each unit belongs to either metric or imperial categories." },
      { title: "3. Read Multiple Results", desc: "Converted values display for all units simultaneously. A visual comparison bar shows relative weight using familiar reference objects." }
    ],
    faqs: [
      { question: "What is the difference between a troy ounce and a standard ounce?", answer: "A troy ounce (31.1035 g) is heavier than a standard avoirdupois ounce (28.3495 g). Troy ounces are used for precious metals like gold and silver." },
      { question: "Can I convert between stones and kilograms?", answer: "Yes, stones are supported. One stone equals 14 pounds or approximately 6.35 kilograms, commonly used in the UK and Ireland for body weight." },
      { question: "Does the converter support micrograms for pharmaceutical use?", answer: "No, the smallest unit is milligrams. For micrograms, divide by 1,000 and use the milligram result." }
    ]
  },

  "volume-converter": {
    instructions: [
      { title: "1. Enter Volume Amount", desc: "Input the numeric volume to convert, supporting values from 0 to 10 million in any unit." },
      { title: "2. Choose Unit Pair", desc: "Select source and target units from milliliters, liters, cubic meters, gallons (US), gallons (UK), quarts, pints, cups, fluid ounces, tablespoons, and teaspoons." },
      { title: "3. See All Equivalents", desc: "The tool displays the converted value in every supported volume unit. US and UK variants are shown separately with clear labeling." }
    ],
    faqs: [
      { question: "What is the difference between US and UK gallons?", answer: "A US gallon is 3.785 liters while a UK (imperial) gallon is 4.546 liters — about 20% larger. The tool clearly labels which standard it uses." },
      { question: "Can I convert cooking measurements like cups to grams?", answer: "No, this is a volume-to-volume converter only. For weight-based cooking conversions, use the Cooking Measurement Converter tool." },
      { question: "Does the tool support microliters for lab measurements?", answer: "No, the smallest unit is milliliters. For microliter volumes, convert to milliliters (1 μL = 0.001 mL) first." }
    ]
  },

  "area-converter": {
    instructions: [
      { title: "1. Enter Area Value", desc: "Input the numeric area to convert. The tool handles values from 0 to 1 trillion square units." },
      { title: "2. Select Units", desc: "Choose from square millimeters, square centimeters, square meters, hectares, square kilometers, square inches, square feet, square yards, acres, and square miles." },
      { title: "3. View Real-Time Results", desc: "All conversions update instantly. A reference table shows equivalent areas using real-world landmarks — football fields, tennis courts, and city blocks." }
    ],
    faqs: [
      { question: "How many square feet are in an acre?", answer: "One acre equals 43,560 square feet. The tool can convert acres to any other unit including square meters (4,047 m²) and hectares (0.4047 ha)." },
      { question: "Can I convert between hectares and acres?", answer: "Yes, both hectares and acres are fully supported. One hectare equals 2.471 acres. The conversion works in both directions." },
      { question: "Does the converter support decimal input for partial units?", answer: "Yes, enter decimal values like 2.5 for two and a half units. The result displays the converted value with up to 10 decimal places of precision." }
    ]
  },

  "data-size-converter": {
    instructions: [
      { title: "1. Enter Data Size", desc: "Type the digital storage size you want to convert, from 0 up to 1 exabyte." },
      { title: "2. Toggle Binary vs Decimal", desc: "Choose between decimal (SI: KB, MB, GB) which uses powers of 1000, and binary (KiB, MiB, GiB) which uses powers of 1024." },
      { title: "3. View Converted Sizes", desc: "See the equivalent size in every unit from bits up to yottabytes. A visual bar compares the size to common files like a 3-minute MP3 or a full HD movie." }
    ],
    faqs: [
      { question: "What is the difference between a gigabyte and a gibibyte?", answer: "A gigabyte (GB) is 1,000,000,000 bytes (decimal), while a gibibyte (GiB) is 1,073,741,824 bytes (binary). Storage manufacturers use GB while operating systems report GiB." },
      { question: "Can I convert data transfer rates like Mbps to MB/s?", answer: "Yes, the tool supports both storage sizes and transfer rates. 1 Mbps (megabit per second) equals 0.125 MB/s (megabyte per second)." },
      { question: "Does the tool convert between bits and bytes?", answer: "Yes, both bits and bytes are supported at every prefix level. 8 bits equal 1 byte, and this relationship is maintained across all conversions." }
    ]
  },

  "time-zone-converter": {
    instructions: [
      { title: "1. Select Date and Time", desc: "Use the date picker and time input to set the starting time. This is the time value you want to convert across time zones." },
      { title: "2. Choose Source and Target Zones", desc: "Select the source time zone (where the input time is) and the target time zone (what you want to know). Search by city name or UTC offset." },
      { title: "3. View Converted Time", desc: "The result shows the equivalent time in the target zone, including whether DST is active in both zones. A time bar visualizes the offset difference." }
    ],
    faqs: [
      { question: "Does the converter handle half-hour and quarter-hour time zones?", answer: "Yes, all time zones including those with 30-minute (e.g., Newfoundland UTC-3:30) and 45-minute (e.g., Nepal UTC+5:45) offsets are supported." },
      { question: "Can I convert a time for a past or future date?", answer: "Yes, the date picker allows any date from 1970 to 2100. Historical and future DST rules are applied based on the IANA time zone database." },
      { question: "How many time zones can I view at once?", answer: "You can add up to 10 target zones simultaneously. Each shows the converted time plus the current time in that zone for comparison." }
    ]
  },

  "power-converter": {
    instructions: [
      { title: "1. Enter Power Value", desc: "Type the numerical power value you want to convert. The input accepts values from 0 to 1 billion in any supported unit." },
      { title: "2. Select Units", desc: "Choose from watts, kilowatts, megawatts, gigawatts, horsepower (mechanical and metric), BTUs per hour, and tons of refrigeration." },
      { title: "3. Compare Results", desc: "Converted values display for all units. A contextual reference shows what typical devices consume that much power — from LED bulbs to industrial motors." }
    ],
    faqs: [
      { question: "What is the difference between mechanical and metric horsepower?", answer: "Mechanical horsepower (hp) equals 745.7 watts, while metric horsepower (PS) equals 735.5 watts. Both are supported with distinct labels." },
      { question: "Can I convert watt-hours to BTUs for energy calculations?", answer: "No, this converter handles power (rate of energy), not energy itself. For energy conversion (kWh to BTUs), multiply watts by time separately." },
      { question: "Does the tool convert between kW and hp for automotive use?", answer: "Yes, the kilowatt-to-horsepower conversion is prominently featured. 100 kW equals approximately 134 mechanical horsepower or 136 metric horsepower." }
    ]
  },

  "pressure-converter": {
    instructions: [
      { title: "1. Enter Pressure Value", desc: "Input the numeric pressure to convert. The tool accepts values from 0 to 10 million in any unit." },
      { title: "2. Choose Units", desc: "Select from pascals, kilopascals, megapascals, bar, millibar, PSI, atmospheres, torr, mmHg, inHg, and cmH2O." },
      { title: "3. Review Results Table", desc: "All conversions update instantly. Results include scientific notation for very small or large values and standard notation for everyday ranges." }
    ],
    faqs: [
      { question: "What is the difference between bar and PSI?", answer: "One bar equals 14.5038 PSI or 100,000 pascals. Bar is commonly used in meteorology and industrial applications, while PSI is standard in automotive tire pressure." },
      { question: "Can I convert blood pressure readings (mmHg) to other units?", answer: "Yes, mmHg (millimeters of mercury) is supported. 120 mmHg equals 15.998 kPa or 0.1579 atm. This is useful for medical data conversion." },
      { question: "Does the converter handle vacuum and negative pressure?", answer: "Yes, negative pressure values (below atmospheric) are supported. Enter values as negative numbers for gauge pressure below zero." }
    ]
  },

  "cooking-measurement-converter": {
    instructions: [
      { title: "1. Enter Quantity and Ingredient", desc: "Input the numerical amount and select the ingredient type (flour, sugar, butter, water, milk, oil, etc.). Different ingredients have different densities." },
      { title: "2. Select Source and Target Units", desc: "Choose from cups, tablespoons, teaspoons, fluid ounces, milliliters, grams, ounces, and pounds. Volume-to-weight conversions use ingredient-specific density tables." },
      { title: "3. Adjust Batch Size", desc: "Use the serving multiplier to scale the entire recipe. If a recipe serves 4 and you need 6, enter 1.5 as the multiplier and all conversions adjust proportionally." }
    ],
    faqs: [
      { question: "How does the converter handle ingredient density differences?", answer: "Each ingredient has a pre-programmed density value. For example, 1 cup of all-purpose flour weighs 125g while 1 cup of brown sugar weighs 220g due to higher density." },
      { question: "Can I add a custom ingredient with my own density?", answer: "No, the ingredient list is fixed at 50 common cooking ingredients. Custom densities cannot be added by the user." },
      { question: "Does the tool convert between oven temperatures?", answer: "No, this tool only handles volume and weight measurements. For temperature conversions between Fahrenheit, Celsius, and gas marks, use a dedicated temperature converter." }
    ]
  },

  "fuel-consumption-converter": {
    instructions: [
      { title: "1. Enter Fuel Economy Value", desc: "Type the numeric fuel consumption value. This is the amount of fuel used per distance in your source unit." },
      { title: "2. Select Conversion Mode", desc: "Choose between MPG (US), MPG (UK), L/100km, km/L, or mpg imp. Each mode represents a different regional standard for measuring fuel economy." },
      { title: "3. Read Combined Results", desc: "All equivalent fuel economy values appear simultaneously. A cost calculator panel estimates annual fuel expense based on your local fuel price and annual mileage." }
    ],
    faqs: [
      { question: "Why do US and UK MPG differ?", answer: "A US gallon is 3.785 liters while a UK gallon is 4.546 liters, so the same car would get a higher MPG rating in the UK. The tool clearly labels which gallon standard it uses." },
      { question: "How do I convert L/100km to MPG?", answer: "Divide 235.214 by the L/100km value for US MPG, or 282.481 for UK MPG. The tool handles this automatically when you select the unit pair." },
      { question: "Does the converter calculate CO2 emissions from fuel consumption?", answer: "Yes, an estimated CO2 emissions figure is displayed based on the fuel type (gasoline or diesel) and the consumption rate using standard emission factors." }
    ]
  },

  "paper-size-converter": {
    instructions: [
      { title: "1. Select Paper Size", desc: "Choose a standard paper size from the dropdown — A-series (A0-A10), B-series (B0-B10), US Letter, Legal, Tabloid, and ANSI sizes." },
      { title: "2. Choose Output Units", desc: "Select whether to display dimensions in millimeters, inches, centimeters, or points (for print design). All measurements update simultaneously." },
      { title: "3. View Size Comparison", desc: "A visual diagram shows the selected paper size superimposed against a reference size (A4 for metric, Letter for US). Aspect ratio and area are displayed below." }
    ],
    faqs: [
      { question: "What is the aspect ratio of A-series paper?", answer: "All A-series paper has a √2:1 aspect ratio (approximately 1.414:1). This ensures that cutting an A sheet in half produces two sheets of the next A size." },
      { question: "Can I enter custom paper dimensions for comparison?", answer: "Yes, switch to Custom mode and enter width and height in any unit. The tool compares your custom size to the nearest standard paper size." },
      { question: "Does the converter support envelope sizes?", answer: "Yes, common envelope sizes (C-series, DL, and US envelope sizes) are included in the size selector alongside paper sizes." }
    ]
  },

  "clothing-size-converter": {
    instructions: [
      { title: "1. Select Garment Type", desc: "Choose whether you are converting sizes for tops, bottoms, dresses, or jackets. Each garment type uses different body measurement mappings." },
      { title: "2. Enter Source Size and Region", desc: "Select your size in the source region (US, UK, EU, or international S/M/L). The tool displays the equivalent measurements for that size." },
      { title: "3. View Equivalent Sizes", desc: "All regional equivalents appear in a table. Body measurement ranges (chest, waist, hip) are shown for each size to help confirm the best fit." }
    ],
    faqs: [
      { question: "How do US women's sizes compare to UK sizes?", answer: "US women's sizes are typically 2 sizes larger than UK. For example, a US size 8 is equivalent to a UK size 12. The conversion table shows all size equivalents." },
      { question: "Does the converter include plus-size ranges?", answer: "Yes, plus sizes (1X-5X or US 14-32) are included with their corresponding body measurements and international equivalents." },
      { question: "Can I convert based on my body measurements instead of size?", answer: "Yes, enter your chest/bust, waist, and hip measurements in inches or centimeters. The tool recommends the best size for each region." }
    ]
  },

  "shoe-size-converter": {
    instructions: [
      { title: "1. Select Gender and Type", desc: "Choose men's, women's, or kids/unisex sizing. Each category uses a different size scale and conversion table." },
      { title: "2. Enter Foot Length or Source Size", desc: "Enter your foot length in centimeters or inches, or select a known size from one region. The tool calculates the equivalent sizes in all other regions." },
      { title: "3. View All Regional Sizes", desc: "US, UK, EU, Japanese, and Australian sizes are displayed in a row. Mondopoint (cm) and inch measurements are shown for reference." }
    ],
    faqs: [
      { question: "Why are US men's and women's shoe sizes different?", answer: "US women's sizing typically runs about 1.5-2 sizes larger than men's. For example, a US men's 8 is approximately a US women's 9.5 based on the same foot length." },
      { question: "How do I measure my foot length for accurate conversion?", answer: "Trace your foot on a piece of paper, measure the distance from heel to longest toe in centimeters, and enter that value. The tool recommends sizes with appropriate wiggle room." },
      { question: "Does the converter include half sizes?", answer: "Yes, half sizes are supported across all regions that use them (US, UK, EU). Half sizes add approximately 4.23mm of length in most systems." }
    ]
  },

  "ring-size-converter": {
    instructions: [
      { title: "1. Choose Measurement Method", desc: "Select how you want to measure — by inner diameter (mm), inner circumference (mm), or by selecting a known size from one system." },
      { title: "2. Enter Your Measurement", desc: "Input the ring measurement you have. If measuring an existing ring, use the on-screen ring sizer guide with a coin or known object for scale." },
      { title: "3. Read Equivalent Sizes", desc: "US, UK, EU, Japanese, and ISO ring size equivalents are displayed. Width adjustments for wide bands (over 6mm) are shown as a footnote." }
    ],
    faqs: [
      { question: "What ring size is a 6cm circumference?", answer: "A 6cm (60mm) circumference corresponds to approximately US size 9, UK size R, or EU size 19. The tool converts this instantly." },
      { question: "Should I order a larger size for wide band rings?", answer: "Yes, wide bands (8mm+) typically require a half to full size larger than standard bands because they fit more snugly due to their width." },
      { question: "Can I measure my ring size using a printable sizer?", answer: "Yes, the tool includes a printable ring sizer PDF. Print it at 100% scale, cut the strip, and wrap it around your finger to find the size." }
    ]
  },

  "minutes-to-hours-converter": {
    instructions: [
      { title: "1. Enter Minutes", desc: "Type the total number of minutes you want to convert into hours. The input accepts values from 0 to 99,999 minutes." },
      { title: "2. View Result", desc: "The tool displays the equivalent in hours and minutes (e.g., 150 minutes = 2 hours 30 minutes) as well as a decimal hours value (2.5 hours)." },
      { title: "3. Copy or Use in Payroll", desc: "Click copy to copy the result in decimal format (2.5h) for use in payroll or timesheet systems. Both HH:MM and decimal formats are provided." }
    ],
    faqs: [
      { question: "How do I convert 90 minutes to hours for a timesheet?", answer: "90 minutes equals 1.5 hours in decimal or 1 hour 30 minutes in HH:MM format. Use the decimal format for payroll systems that require fractional hours." },
      { question: "Can I convert negative values or time differences?", answer: "No, only positive values are accepted. For time differences that may be negative, calculate the absolute difference in minutes first." },
      { question: "Does the tool handle seconds within minutes?", answer: "No, this tool only handles whole minutes. For second-level precision, convert seconds to minutes first using the Seconds to Minutes Converter." }
    ]
  },

  "hours-to-minutes-tool": {
    instructions: [
      { title: "1. Enter Hours", desc: "Input the number of hours to convert. This can include decimal hours (e.g., 2.5 for 2 hours and 30 minutes). Accepts values from 0 to 9,999." },
      { title: "2. View Minute Equivalent", desc: "The result shows the total minutes (e.g., 2.5 hours = 150 minutes). A breakdown displays the hours and remaining minutes separately." },
      { title: "3. Use in Schedules", desc: "Click the copy button to quickly copy the minute value for use in project planning, scheduling, or billing calculations." }
    ],
    faqs: [
      { question: "How do I convert 1.75 hours to minutes?", answer: "Multiply 1.75 by 60 to get 105 minutes. The tool does this instantly and displays both the decimal and the 1 hour 45 minute breakdown." },
      { question: "Can I convert hours and minutes separately?", answer: "Yes, enter hours in the main field. If you also have minutes, add them by converting minutes separately using the companion Minutes to Hours converter." },
      { question: "Does this tool work with billable hours for freelancers?", answer: "Yes, decimal hours are supported. Enter 7.25 hours to get 435 minutes — useful for billing clients who track in minute increments rather than quarter-hours." }
    ]
  },

  "seconds-to-minutes-converter": {
    instructions: [
      { title: "1. Enter Seconds", desc: "Type the total seconds you want to convert. Accepts values from 0 to 9,999,999 seconds for durations up to 115 days." },
      { title: "2. View Minute Representation", desc: "The result displays total minutes (decimal), minutes and remaining seconds, and equivalent times in hours, minutes, and seconds." },
      { title: "3. Copy Any Format", desc: "Each format has its own copy button. Copy the decimal minutes for scientific use, or the HH:MM:SS format for display purposes." }
    ],
    faqs: [
      { question: "How many minutes are in 3,600 seconds?", answer: "3,600 seconds equals 60 minutes exactly (or 1 hour). The tool shows this as 60 minutes, 1h 0m 0s, and 1 hour in the duration breakdown." },
      { question: "Can I convert backwards from minutes to seconds?", answer: "No, this is a seconds-to-minutes converter. Use the generic Time Converter for two-way conversions between any time units." },
      { question: "Does the tool account for leap seconds?", answer: "No, standard 60-second minutes are used. Civil leap seconds are not accounted for in this simple conversion tool." }
    ]
  },

  "hours-to-minutes-converter": {
    instructions: [
      { title: "1. Enter Time in Hours", desc: "Type the hours value you need to convert. Accepts both whole numbers and decimals (e.g., 3 or 1.25). Range is 0 to 10,000 hours." },
      { title: "2. Read Minute Output", desc: "The equivalent in minutes appears instantly. For example, 3 hours becomes 180 minutes, and 1.25 hours becomes 75 minutes." },
      { title: "3. Toggle Precision", desc: "Use the precision toggle to show results with or without decimal places in the minute output. The HH:MM format is always shown alongside." }
    ],
    faqs: [
      { question: "What is the formula for converting hours to minutes?", answer: "Multiply the number of hours by 60. For example, 2 hours × 60 = 120 minutes. The tool handles both whole and fractional hours automatically." },
      { question: "Is this different from the Hours to Minutes Tool?", answer: "The Hours to Minutes Tool focuses on decimal hour conversion while this converter provides a broader range and additional formatting options." },
      { question: "Can I convert large numbers like 1,000 hours into minutes?", answer: "Yes, 1,000 hours equals 60,000 minutes. The tool supports up to 10,000 hours (600,000 minutes) in a single conversion." }
    ]
  },

  // ===== TEXT UTILITIES =====
  "morse-code-translator": {
    instructions: [
      { title: "1. Type or Paste Text", desc: "Enter alphanumeric text in the input box. The translator supports A-Z, 0-9, and basic punctuation. Lowercase letters are automatically uppercased before encoding." },
      { title: "2. Toggle Direction", desc: "Choose whether to translate text to Morse code (encode) or Morse code to text (decode). In decode mode, use dots (.) and dashes (-) separated by spaces." },
      { title: "3. Play Morse Audio", desc: "Click the play button to hear the Morse code as audible tones. The speed slider controls the transmission rate from 5 to 40 words per minute." }
    ],
    faqs: [
      { question: "What is the timing rule for Morse code spacing?", answer: "The dot duration is the basic unit. Dash is 3 dots, space between parts of same letter is 1 dot, between letters is 3 dots, and between words is 7 dots." },
      { question: "Can I translate Morse code that has slashes between words?", answer: "Yes, the decoder treats a forward slash (/) as a word separator. Both slash-separated and space-separated Morse are accepted." },
      { question: "Does the tool support prosigns or special Morse abbreviations?", answer: "No, only standard ITU-R Morse code characters (A-Z, 0-9, basic punctuation) are supported. Prosigns like AR, SK, BT are not implemented." }
    ]
  },

  "slugify-tool": {
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste any string — a blog post title, product name, or URL component. The input can include spaces, special characters, and mixed casing." },
      { title: "2. Configure Slug Options", desc: "Choose separator character (hyphen, underscore, or none), case style (lowercase only), and whether to strip common words like 'the', 'a', 'an'." },
      { title: "3. Copy the Slug", desc: "The generated slug appears in the output box. Click copy to use it in URLs, filenames, or content management system permalinks." }
    ],
    faqs: [
      { question: "What characters are removed during slugification?", answer: "All non-alphanumeric characters except the chosen separator are removed, including punctuation, symbols, and spaces. Accented characters are converted to ASCII equivalents." },
      { question: "Can I slugify text with Unicode characters?", answer: "Yes, Unicode characters are preserved if they are alphanumeric. Non-Latin scripts like Cyrillic or Chinese characters remain in the slug as-is." },
      { question: "Does the tool handle very long text (entire articles)?", answer: "Yes, but slugs are best kept under 80 characters. The tool does not truncate automatically — you should trim input to the relevant key phrase." }
    ]
  },

  "numeronym-generator": {
    instructions: [
      { title: "1. Enter a Word or Phrase", desc: "Type the text you want to convert into a numeronym. The generator works on single words and multi-word phrases." },
      { title: "2. Choose Numeronym Style", desc: "Select from i18n-style (first letter + count of middle letters + last letter, e.g., i18n), or first-letter style (like a11y, k8s)." },
      { title: "3. Generate and Preview", desc: "Click generate to produce the numeronym. The tool explains how the numeronym was derived by showing each component of the algorithm." }
    ],
    faqs: [
      { question: "What is the i18n numeronym pattern?", answer: "i18n stands for 'internationalization' — A 14-character word abbreviated by taking the first letter 'i', counting the 14 middle letters, and appending the last letter 'n'." },
      { question: "Can I generate numeronyms for multiple words at once?", answer: "Yes, multi-word phrases are processed by concatenating the numeronyms of each word. For example, 'accessibility testing' might become 'a11y t7g'." },
      { question: "Does the tool work with numbers in the input text?", answer: "Yes, digits in the input are preserved. For example, 'HTML5' is treated based on its alphabetic characters while keeping the digit in the output." }
    ]
  },

  "line-sorter": {
    instructions: [
      { title: "1. Paste Your Data", desc: "Copy and paste lines of text into the input area. Each line is treated as a separate entry. The tool accepts up to 50,000 rows." },
      { title: "2. Choose Sort Options", desc: "Select sort direction (A-Z or Z-A), case sensitivity (sensitive by default), and whether to trim whitespace before sorting." },
      { title: "3. Enable Deduplication", desc: "Toggle the deduplicate switch to remove exact duplicate lines. After deduplication, a count shows how many duplicates were removed." }
    ],
    faqs: [
      { question: "Can I sort by numeric value instead of alphabetically?", answer: "Yes, toggle to numeric sort mode. Lines are parsed as numbers and sorted by value. Non-numeric lines are gathered at the top or bottom based on the sort direction." },
      { question: "How does the tool handle empty lines during sorting?", answer: "Empty lines are moved to the end of the sorted output regardless of sort direction. You can check an option to strip all empty lines from the result." },
      { question: "Can I sort lines by length instead of content?", answer: "Yes, choose the 'by length' sort mode. Lines are sorted from shortest to longest or vice versa, with ties broken alphabetically." }
    ]
  },

  "nato-phonetic-converter": {
    instructions: [
      { title: "1. Enter Text to Convert", desc: "Type any word, name, or alphanumeric string. Each character is mapped to its corresponding NATO phonetic alphabet code word." },
      { title: "2. Select Output Format", desc: "Choose between a simple list (Alfa, Bravo, Charlie) or a table format showing each character with its code word and pronunciation guide." },
      { title: "3. Play Audio or Copy", desc: "Click the speaker icon to hear the NATO code words spoken in sequence. Copy the formatted list for radio communication or customer service use." }
    ],
    faqs: [
      { question: "What is the NATO phonetic alphabet used for?", answer: "It is used in aviation, military, and customer service to spell words clearly over radio or telephone when static or background noise could cause misunderstanding." },
      { question: "Why is 'Alfa' spelled with an 'f' instead of 'ph'?", answer: "The NATO standard spells 'Alfa' and 'Juliett' with non-standard spellings to ensure correct pronunciation by non-native English speakers in international contexts." },
      { question: "Can I convert the output back to regular text?", answer: "Yes, toggle to decode mode. Paste NATO code words (space-separated) and the tool converts them back to the original letters and numbers." }
    ]
  },

  "unicode-viewer": {
    instructions: [
      { title: "1. Enter or Paste Characters", desc: "Type or paste any text into the input box. The viewer analyzes each character and displays its Unicode properties." },
      { title: "2. Explore Character Details", desc: "Click any character in the result table to see its code point (U+XXXX), decimal value, Unicode block, script, general category, and bidirectional class." },
      { title: "3. Search by Code Point", desc: "Enter a Unicode code point like U+1F600 to jump directly to that character. The viewer displays the character, its name, and all metadata." }
    ],
    faqs: [
      { question: "What is a Unicode code point?", answer: "A code point is a unique hexadecimal number assigned to every character in the Unicode standard, written as U+XXXX. For example, U+0041 is the code point for 'A'." },
      { question: "Can the viewer detect homoglyph characters?", answer: "Yes, the tool flags characters that look similar but have different code points (homoglyphs), which is useful for detecting spoofing attempts in security reviews." },
      { question: "Does the tool support emoji sequences and ZWJ combinations?", answer: "Yes, the viewer understands emoji sequences, variation selectors, and Zero-Width Joiner (ZWJ) sequences, showing the component code points and final rendered glyph." }
    ]
  },

  "ascii-art-generator": {
    instructions: [
      { title: "1. Upload or Type Text", desc: "Enter the text you want to convert into ASCII art. The generator supports letters, numbers, and basic punctuation for font rendering." },
      { title: "2. Choose a Font Style", desc: "Browse through available ASCII fonts — block, banner, bubble, digital, script, or slant. Each font uses a different character grid pattern." },
      { title: "3. Customize Width and Adjust", desc: "Set the output width in characters (10 to 200). Wider settings create more detailed art but take more space. Copy the result to paste into terminal comments or code." }
    ],
    faqs: [
      { question: "Can I convert an image to ASCII art instead of text?", answer: "No, this tool generates ASCII art from text input only. For image-to-ASCII conversion, use a dedicated image processing tool or library." },
      { question: "What is the maximum font size I can generate?", answer: "The maximum output width is 200 characters. The height is automatically calculated based on the font's aspect ratio and the number of input characters." },
      { question: "Does the tool support multicolor ASCII art output?", answer: "No, the output is plain monochrome text. For colored terminal output, add ANSI escape codes manually after copying the ASCII art." }
    ]
  },

  "ascii-font-generator": {
    instructions: [
      { title: "1. Type Your Message", desc: "Enter the text you want to render in an ASCII font style. The generator works with letters A-Z, digits 0-9, and common punctuation." },
      { title: "2. Browse Font Gallery", desc: "Preview your text in over 30 different ASCII font styles. Each font uses a unique set of Unicode characters and line-drawing techniques." },
      { title: "3. Copy the Rendered Text", desc: "Once satisfied with a font, click copy to copy the rendered ASCII art text. You can also click a font name to lock it and then tweak individual characters." }
    ],
    faqs: [
      { question: "What is the difference between this and ASCII Art Generator?", answer: "The ASCII Font Generator renders text using Unicode box-drawing and block characters for richer output, while ASCII Art Generator uses plain ASCII characters." },
      { question: "Can I mix different fonts in a single message?", answer: "No, each generation uses one font for the entire message. To mix fonts, generate separate lines in different fonts and combine them manually." },
      { question: "Does the generator work with Chinese or other non-Latin scripts?", answer: "No, only Latin alphabet characters and digits are supported. Non-Latin characters may display as blank or placeholder characters in the output." }
    ]
  },

  "list-converter": {
    instructions: [
      { title: "1. Paste Your List", desc: "Enter a list of items in the input area — one per line. The tool accepts plain text, numbered lists, or bullet-pointed lists." },
      { title: "2. Choose Output Format", desc: "Select from comma-separated, pipe-separated, tab-separated, JSON array, numbered list, bulleted list, or HTML unordered list format." },
      { title: "3. Copy and Use", desc: "Click copy to copy the converted list to your clipboard. Each format option shows a live preview so you can verify before copying." }
    ],
    faqs: [
      { question: "Can I convert a JSON array back to a line-separated list?", answer: "Yes, paste a JSON array like ['a','b','c'] and select 'Line-separated' as the output format to reverse the conversion." },
      { question: "Does the tool handle quoted values with embedded commas?", answer: "Yes, if pasting a CSV or similar format, the parser respects double-quoted fields so commas within quotes are not treated as delimiters." },
      { question: "Can I convert between Markdown table and CSV?", answer: "No, the tool handles simple delimited lists. For CSV-to-table conversions, use the dedicated CSV Formatter or TSV-CSV Converter." }
    ]
  },

  "large-text-viewer": {
    instructions: [
      { title: "1. Upload or Load a File", desc: "Click to upload a text file (up to 100MB) or paste content directly. The viewer handles large files by loading them in chunks for performance." },
      { title: "2. Navigate Using the Scrollbar", desc: "Use the virtual scrollbar to navigate through the entire document smoothly. Line numbers are displayed on the left margin." },
      { title: "3. Search and Highlight", desc: "Press Ctrl+F to open the search bar. Enter a term to find all occurrences, which are highlighted with a count of matches at the top of the panel." }
    ],
    faqs: [
      { question: "What file formats are supported for upload?", answer: "Plain text files (.txt), log files (.log), CSV files, JSON files, source code files, and Markdown files. Binary formats and PDFs are not supported." },
      { question: "How does the viewer handle a 100MB file without crashing?", answer: "The file is loaded in chunks using a virtual scrolling technique. Only the visible portion of the file is rendered in the DOM at any time." },
      { question: "Can I edit text within the viewer?", answer: "No, this is a read-only viewer. For editing, download the file and use a text editor. The viewer supports only search and copy operations." }
    ]
  },

  // ===== GENERATORS & TOOLS =====
  "qr-code-generator": {
    instructions: [
      { title: "1. Enter Your Data", desc: "Type the URL, text, phone number, or email address you want to encode into the QR code. The input can be up to 2,953 bytes of alphanumeric data." },
      { title: "2. Customize Visuals", desc: "Choose the foreground color, background color, and error correction level (L, M, Q, H). Higher error correction allows up to 30% damage while remaining scannable." },
      { title: "3. Download the QR Code", desc: "Click download to save the QR code as a PNG or SVG image. PNG is best for print at 300 DPI, SVG for scaling without quality loss." }
    ],
    faqs: [
      { question: "What is the maximum data capacity of a QR code?", answer: "The maximum capacity depends on the version and error correction level. Version 40 with L-level correction can hold 7,089 numeric or 4,296 alphanumeric characters." },
      { question: "Can I add a logo or image in the center of the QR code?", answer: "Yes, toggle the center logo option to upload a small image. With high error correction (H), the QR remains scannable even with a central graphic." },
      { question: "Do QR codes expire or need renewal?", answer: "No, the QR code is a static image that never expires. However, if the encoded URL points to a service that changes, update your marketing materials with a new code." }
    ]
  },

  "barcode-generator": {
    instructions: [
      { title: "1. Enter Barcode Data", desc: "Type the numeric or alphanumeric data you want to encode. Different barcode symbologies have different character set and length requirements." },
      { title: "2. Select Symbology", desc: "Choose from Code 128, Code 39, EAN-13, UPC-A, ISBN, ITF, and more. EAN-13 is standard for retail products, Code 128 for logistics." },
      { title: "3. Generate and Export", desc: "Click generate to render the barcode. Download as PNG at 300 DPI for print, or SVG for vector use. The human-readable text appears below the barcode." }
    ],
    faqs: [
      { question: "What is the difference between EAN-13 and UPC-A barcodes?", answer: "EAN-13 is a 13-digit international standard, while UPC-A is a 12-digit standard used primarily in the US and Canada. EAN-13 can encode UPC-A by adding a leading 0." },
      { question: "Does the generator calculate check digits automatically?", answer: "Yes, if you enter the data without the check digit, the tool calculates and appends it. If you include it, the tool verifies it and warns on mismatch." },
      { question: "Can I print barcodes on labels directly from the tool?", answer: "Yes, generate a sheet of multiple barcodes by entering multiple data rows. The tool arranges them in a printable grid with customizable label dimensions." }
    ]
  },

  "password-generator": {
    instructions: [
      { title: "1. Set Password Length", desc: "Use the slider to choose a length between 8 and 128 characters. Longer passwords are exponentially more resistant to brute-force attacks." },
      { title: "2. Select Character Types", desc: "Toggle uppercase, lowercase, digits, and symbols on or off. For maximum security, enable all four types. The passphrase option generates memorable word-based phrases." },
      { title: "3. Generate and Copy", desc: "Click generate to produce a random password. Each character is chosen using a cryptographically secure PRNG. Copy the password (it is never stored or transmitted)." }
    ],
    faqs: [
      { question: "How strong is an 8-character password with all character types?", answer: "An 8-character password with 95 possible characters per position has 95^8 ≈ 6.6 quadrillion combinations. At 1 billion guesses per second, it would take about 76 days to brute-force." },
      { question: "Does the tool save or transmit generated passwords?", answer: "No, all generation happens locally in your browser. Passwords are never sent to any server, stored, or logged." },
      { question: "What is the passphrase mode and how does it work?", answer: "Passphrase mode generates a sequence of common words separated by hyphens or spaces, chosen from a dictionary of 7,776 words using diceware-like random selection." }
    ]
  },

  "wifi-qr-generator": {
    instructions: [
      { title: "1. Enter Network Details", desc: "Type your WiFi network name (SSID), select the security protocol (WPA/WPA2/WPA3 or none), and enter the password. All fields are required for encrypted networks." },
      { title: "2. Choose Hidden Network", desc: "If your network does not broadcast its SSID, check the hidden network box. This adds the hidden flag to the encoded configuration." },
      { title: "3. Generate the QR Code", desc: "Click generate to create a QR code. When scanned by a phone camera, it prompts the user to connect to your WiFi without typing the password." }
    ],
    faqs: [
      { question: "Which phones can scan WiFi QR codes natively?", answer: "iPhones (iOS 11+) can scan with the camera app. Android devices vary — Pixel phones and Samsung devices support it natively, others may need a third-party app." },
      { question: "Is the WiFi password securely hidden in the QR code?", answer: "No, the password is encoded as plaintext in the QR code's data string. Anyone who can scan the QR code can read the password." },
      { question: "Can I generate a QR code for an open (unencrypted) network?", answer: "Yes, set security to 'None'. The generated QR code will use the WEP format without a password, allowing direct connection to open networks." }
    ]
  },

  "otp-generator": {
    instructions: [
      { title: "1. Set OTP Length", desc: "Choose the number of digits for the OTP — typically 6 or 8 digits. Longer OTPs are harder to guess but harder for users to type." },
      { title: "2. Choose Character Type", desc: "Select digits only (most common for SMS OTPs) or alphanumeric (for backup codes). Alphanumeric codes include uppercase letters and digits." },
      { title: "3. Generate and Copy", desc: "Click generate to create a one-time password. Each generation produces a unique code. Copy it to send to the user or paste into your test flow." }
    ],
    faqs: [
      { question: "How does this differ from a time-based (TOTP) authenticator app?", answer: "This generates random static codes, not time-windowed codes. TOTP codes change every 30 seconds using a shared secret — this tool is for one-shot generation." },
      { question: "Can I generate multiple OTPs in bulk for testing?", answer: "Yes, set the quantity to generate up to 100 codes at once. Useful for populating test databases or creating backup code lists." },
      { question: "Are the generated OTPs cryptographically secure?", answer: "Yes, the generator uses window.crypto.getRandomValues which is suitable for authentication tokens. Each code is independent and unpredictable." }
    ]
  },

  "benchmark-builder": {
    instructions: [
      { title: "1. Select Benchmark Type", desc: "Choose from CPU performance, array operations, mathematical calculations, or string processing. Each type runs a different set of timed tests." },
      { title: "2. Set Iterations", desc: "Define how many iterations each test runs — from 1,000 to 10 million. More iterations produce statistically significant results but take longer." },
      { title: "3. Run and Compare", desc: "Click start to run the benchmark. Results show operations per second, total time, and a comparison to baseline browser performance." }
    ],
    faqs: [
      { question: "What does the CPU benchmark actually test?", answer: "It runs prime number calculation, matrix multiplication, and sorting algorithm tests timed with high-resolution performance.now() measurements." },
      { question: "How can I save benchmark results for comparison?", answer: "Click the save button to store the results in your browser's local storage. A history view lets you compare current results against past runs." },
      { question: "Does the benchmark affect browser performance during testing?", answer: "Yes, benchmarks are CPU-intensive. The browser may become unresponsive during the test. Results stabilize after the page is fully loaded and any background processes settle." }
    ]
  },

  "emoji-picker": {
    instructions: [
      { title: "1. Browse or Search Emojis", desc: "Scroll through categorized emoji groups (Smileys, People, Animals, Food, Travel, Symbols) or type a keyword like 'heart' or 'wave' to search." },
      { title: "2. Preview and Select", desc: "Hover over any emoji to see its official Unicode name and a larger preview. Click to select it and insert it into the text area at the bottom." },
      { title: "3. Copy Multiple Emojis", desc: "Build a selection of emojis in the text area. Click copy to copy all selected emojis to your clipboard at once for use in messages or social media." }
    ],
    faqs: [
      { question: "How many emojis are included in the picker?", answer: "The picker includes over 3,600 emojis from the Unicode 15.0 standard, including skin tone variations, flags, and the newest emoji releases." },
      { question: "Can I use the emoji picker in any text field on the page?", answer: "No, emojis are copied to your clipboard. You cannot click to insert them directly into other applications — paste them manually after copying." },
      { question: "Does the picker support emoji modifiers like skin tones?", answer: "Yes, click and hold on emojis that support skin tone variations to select the desired tone. The modified emoji appears in the text area." }
    ]
  },

  "ical-event-generator": {
    instructions: [
      { title: "1. Enter Event Details", desc: "Fill in the event title, description, location, and time zone. All fields except description and location are required to generate a valid .ics file." },
      { title: "2. Set Start and End Times", desc: "Use the date and time pickers to set when the event starts and ends. The end time must be after the start time — the validation checks this automatically." },
      { title: "3. Add Recurrence (Optional)", desc: "Choose whether the event repeats — daily, weekly, monthly, or yearly. Set an end date for the recurrence or leave it as a perpetual event." }
    ],
    faqs: [
      { question: "Which applications can open the generated .ics file?", answer: "Apple Calendar, Google Calendar, Outlook, Thunderbird, and most calendar applications support the iCalendar (.ics) format standard (RFC 5545)." },
      { question: "Can I add attendees or alarms to the event?", answer: "No, the generator creates basic events only. Attendees, alarms, and attachments are not supported in the current version of the tool." },
      { question: "Does the tool handle recurring events correctly for time zones with DST?", answer: "Yes, the generated .ics file includes proper VTIMEZONE definitions for daylight saving transitions, ensuring events stay at the correct local time year-round." }
    ]
  },

  // ===== CSV/DATA TOOLS =====
  "tsv-csv-converter": {
    instructions: [
      { title: "1. Paste TSV Data", desc: "Copy tab-separated data from a spreadsheet, database export, or text file and paste it into the input area. The tool parses tabs as column separators." },
      { title: "2. Preview Conversion", desc: "The CSV output appears in a preview table showing headers and rows. Verify that columns aligned correctly — mismatched row lengths are highlighted in red." },
      { title: "3. Download or Copy CSV", desc: "Click download to save the converted CSV file, or copy the comma-separated text to your clipboard. The tool also supports the reverse direction (CSV to TSV)." }
    ],
    faqs: [
      { question: "How does the converter handle TSV fields containing tabs?", answer: "Fields with embedded tabs must be quoted. If unquoted tabs are found inside fields, the tool attempts to auto-quote them during conversion." },
      { question: "Can I change the delimiter from comma to semicolon in the output?", answer: "Yes, select the output delimiter — comma, semicolon, or pipe. This is useful for locales where the decimal separator is a comma." },
      { question: "Does the tool handle large files (over 100MB)?", answer: "The converter processes files entirely in browser memory. For files over 50MB, performance may degrade. Consider splitting large TSV files before conversion." }
    ]
  },

  "vcf-csv-converter": {
    instructions: [
      { title: "1. Upload or Paste VCF Data", desc: "Import contacts from a .vcf (vCard) file exported from your phone, email client, or CRM. The parser extracts name, phone, email, and address fields." },
      { title: "2. Map VCF Fields to Columns", desc: "Choose which VCF fields map to which CSV columns. Default mapping covers FN, TEL, EMAIL, ADR, ORG, and NOTE fields." },
      { title: "3. Download CSV or Reverse", desc: "Click convert to generate the CSV file. Reverse conversion (CSV to VCF) is also supported for importing contacts back into address books." }
    ],
    faqs: [
      { question: "What VCF version does the converter support?", answer: "It supports vCard 2.1, 3.0, and 4.0 formats. Version detection is automatic based on the VERSION property in the file header." },
      { question: "Can I convert multiple VCF cards into a single CSV?", answer: "Yes, the tool processes all vCards in the input file and outputs one row per contact in the CSV. Multiple phone numbers per contact are concatenated." },
      { question: "Does the converter handle VCF photos or binary attachments?", answer: "No, binary photo data is stripped during conversion. Only text fields (name, phone, email, address, organization, notes) are extracted." }
    ]
  },

  "ics-csv-converter": {
    instructions: [
      { title: "1. Import ICS Calendar Data", desc: "Upload a .ics file from Google Calendar, Apple Calendar, or Outlook, or paste the ICS content directly into the input box." },
      { title: "2. Select Event Properties", desc: "Choose which event fields to include in the CSV output — SUMMARY, DTSTART, DTEND, LOCATION, DESCRIPTION, STATUS, and CATEGORIES." },
      { title: "3. Convert and Export", desc: "Click convert to generate rows for each calendar event. The CSV can be opened in Excel or Google Sheets for analysis and reporting." }
    ],
    faqs: [
      { question: "What happens to recurring events during conversion?", answer: "Recurring events are expanded into individual rows for each occurrence. The RRULE is parsed and occurrences within the next 365 days are generated." },
      { question: "Can I convert CSV back to ICS format?", answer: "Yes, reverse conversion is supported. Map CSV columns to ICS properties and download a valid .ics file for import into calendar applications." },
      { question: "Does the tool handle multi-value fields like multiple alerts?", answer: "Multi-value fields are concatenated with a separator in the CSV output. Alarms, attendees, and other multi-value properties are simplified." }
    ]
  },

  "column-extractor": {
    instructions: [
      { title: "1. Upload or Paste CSV", desc: "Import your CSV file by pasting data or uploading a file. The tool displays the header row and first 5 rows as a preview." },
      { title: "2. Select Columns to Extract", desc: "Check the checkbox next to each column you want to keep. Unchecked columns are dropped from the output. You can also reorder columns by dragging." },
      { title: "3. Download Extracted CSV", desc: "Click extract to generate the filtered CSV. The output contains only the selected columns in the order you arranged. Download as a new file." }
    ],
    faqs: [
      { question: "Can I extract columns by index instead of by name?", answer: "Yes, switch to index mode to reference columns by position (0, 1, 2…). This is useful when CSV files have no header row or duplicate headers." },
      { question: "What happens if a selected column has missing values in some rows?", answer: "Rows with missing values in the extracted columns show empty fields in the output. The row count remains the same — no rows are filtered out." },
      { question: "Does the tool preserve the original CSV's quoting and escaping?", answer: "Yes, the extraction preserves the original quoting style (double quotes for fields containing commas or newlines). The output is valid CSV." }
    ]
  },

  "column-renamer": {
    instructions: [
      { title: "1. Import Your CSV", desc: "Paste CSV data or upload a file. The first row is parsed as headers. If your file has no headers, toggle the no-header mode to see generic column names." },
      { title: "2. Edit Column Names", desc: "Each header cell becomes an editable text field. Type the new name for each column. A preview shows how the data will look with the new headers." },
      { title: "3. Download Renamed CSV", desc: "Click rename to apply the changes. The output CSV has the new header row and all original data rows preserved without modification." }
    ],
    faqs: [
      { question: "Can I rename columns in bulk with a pattern like prefix or suffix?", answer: "Yes, use the bulk rename option to add a prefix (e.g., '2024_') or suffix (e.g., '_final') to all column names at once." },
      { question: "What happens if I leave a column name blank?", answer: "Blank column names are replaced with 'Column_X' where X is the column index. The tool warns you before processing if any names are empty." },
      { question: "Does renaming modify the actual data in any way?", answer: "No, only the header row is modified. All data rows remain exactly as they were in the original file." }
    ]
  },

  "data-type-converter": {
    instructions: [
      { title: "1. Load Your Data", desc: "Import a CSV file. The tool scans the first 100 rows to auto-detect each column's current data type — text, number, date, or boolean." },
      { title: "2. Select Conversion Rules", desc: "For each column, choose the target data type. Options include text-to-number, number-to-text, date-format-change, and text-to-boolean." },
      { title: "3. Apply and Download", desc: "Click convert to apply type transformations. A log shows how many values were successfully converted and how many failed or produced null." }
    ],
    faqs: [
      { question: "How does the tool detect the current data type automatically?", answer: "It samples values and tries parsing them as number (integer and float), date (ISO and US formats), and boolean (true/false, yes/no, 0/1) to determine the best match." },
      { question: "What happens to values that cannot be converted to the target type?", answer: "Unconvertible values are set to null (empty) in the output. A summary report shows the count of conversion failures per column." },
      { question: "Can I convert between date formats (e.g., MM/DD/YYYY to YYYY-MM-DD)?", answer: "Yes, select date as the target type and choose the output format. The tool recognizes 15 common input date formats automatically." }
    ]
  },

  "deduplicator": {
    instructions: [
      { title: "1. Import CSV with Duplicates", desc: "Upload or paste a CSV file containing duplicate rows. The tool identifies duplicates based on all columns or selected key columns." },
      { title: "2. Set Deduplication Strategy", desc: "Choose whether to keep the first occurrence, last occurrence, or merge data from duplicates. For merge, conflicting values are concatenated." },
      { title: "3. Review and Download", desc: "A summary shows how many duplicates were found and removed. Preview the deduplicated data before downloading the clean CSV file." }
    ],
    faqs: [
      { question: "What determines if a row is considered a duplicate?", answer: "By default, rows are duplicates if all column values match exactly. Enable key-column mode to match only on specific columns (e.g., email address)." },
      { question: "Can I deduplicate based on fuzzy matching instead of exact match?", answer: "No, the tool uses exact matching only. For fuzzy deduplication, pre-process your data to normalize similar values before importing." },
      { question: "Does the tool track which rows were removed?", answer: "Yes, the log shows the row numbers (original positions) of all removed duplicates, which helps audit the deduplication process." }
    ]
  },

  "format-validator": {
    instructions: [
      { title: "1. Upload CSV to Validate", desc: "Import a CSV file. The validator examines the file structure, checking for consistent column counts, proper quoting, and line endings." },
      { title: "2. View Validation Results", desc: "Issues are categorized as errors or warnings. Errors include inconsistent column counts, unclosed quotes, and encoding problems. Warnings flag potential data issues." },
      { title: "3. Fix Issues and Recheck", desc: "Click on any issue to highlight the problematic row in the preview. Edit the data inline or fix the source file and re-upload." }
    ],
    faqs: [
      { question: "What checks does the validator perform on a CSV file?", answer: "It checks for consistent column count across rows, proper double-quote escaping, valid UTF-8 encoding, line ending consistency, and trailing commas." },
      { question: "Can the validator fix issues automatically or only report them?", answer: "It reports issues but does not auto-fix. You can edit rows inline and re-validate. Complex fixes should be done in a spreadsheet editor." },
      { question: "Does the tool validate data types within cells?", answer: "Optional data type validation checks that numeric columns contain only numbers, date columns contain valid dates, and required fields are not empty." }
    ]
  },

  "null-value-handler": {
    instructions: [
      { title: "1. Import CSV with Null Values", desc: "Upload your CSV file. The tool scans all columns and identifies cells that are empty, contain 'NULL', 'null', 'NaN', 'N/A', or an empty string." },
      { title: "2. Configure Replacement Rules", desc: "For each detected null-like value, choose a replacement — a fixed value, a column default, or the mean/median (for numeric columns)." },
      { title: "3. Apply and Export", desc: "Preview the changes showing original vs. replaced values. Download the cleaned CSV with all null values handled according to your rules." }
    ],
    faqs: [
      { question: "What values does the tool recognize as null?", answer: "Empty strings, 'NULL', 'null', 'Null', 'NaN', 'N/A', 'n/a', '#N/A', 'None', 'none', and '—' (em dash). The detection list is configurable." },
      { question: "Can I use the column's mean or median as a replacement for numeric nulls?", answer: "Yes, for integer and float columns, you can fill nulls with the column mean, median, mode, or a custom constant value." },
      { question: "Does the tool modify the original file or create a new output?", answer: "It creates a new output file. The original file is never modified. You must explicitly download the cleaned version." }
    ]
  },

  "pivot-generator": {
    instructions: [
      { title: "1. Import Source Data", desc: "Upload your CSV file. The tool displays all column names in dropdown menus for configuring the pivot structure." },
      { title: "2. Configure Pivot Dimensions", desc: "Select the rows field (the dimension to group by), the columns field (the dimension to pivot), and the values field (the data to aggregate)." },
      { title: "3. Choose Aggregation Function", desc: "Pick from SUM, COUNT, AVERAGE, MIN, MAX, or MEDIAN for the value aggregation. The pivot table is generated and displayed as a grid." }
    ],
    faqs: [
      { question: "What is a CSV pivot table used for?", answer: "A pivot table summarizes large datasets by grouping and aggregating values across two dimensions — for example, total sales by region and quarter." },
      { question: "Can I pivot on multiple value columns at once?", answer: "Yes, the multi-value mode lets you select several value columns. Each generates a separate set of pivoted columns with the chosen aggregation." },
      { question: "Does the tool handle missing values in pivot fields?", answer: "Missing values in the rows or columns fields are grouped under a '(blank)' label. Nulls in the values field are treated as 0 for SUM and skipped for COUNT." }
    ]
  },

  "row-filter": {
    instructions: [
      { title: "1. Import CSV Data", desc: "Upload or paste a CSV file. The tool displays all columns with their data types for building filter conditions." },
      { title: "2. Build Filter Conditions", desc: "Add one or more conditions using AND/OR logic. Each condition selects a column, an operator (equals, contains, greater than, less than, between, etc.), and a value." },
      { title: "3. View Filtered Results", desc: "Matching rows are displayed below. The row count shows how many passed vs. were filtered out. Download the filtered subset as a new CSV." }
    ],
    faqs: [
      { question: "Can I save filter configurations for reuse?", answer: "Yes, click save to store the filter configuration in the browser. Load it later from the saved filters panel for recurring filtering tasks." },
      { question: "Does the filter support regular expressions for pattern matching?", answer: "Yes, select the 'matches regex' operator to filter rows where a column value matches a regular expression pattern." },
      { question: "How many conditions can I add to a single filter?", answer: "You can add up to 20 conditions per filter group and nest up to 3 groups using AND/OR logic for complex filtering." }
    ]
  },

  "csv-row-sorter": {
    instructions: [
      { title: "1. Load Your CSV", desc: "Import a CSV file. The tool reads the header row and displays a preview of the data. Sortable columns are highlighted with an arrow icon." },
      { title: "2. Set Sort Rules", desc: "Click a column header to sort ascending, click again for descending. Add secondary sort columns by clicking additional headers while holding Shift." },
      { title: "3. Apply and Export", desc: "Preview the sorted data showing the new row order. Download the sorted CSV with the header row preserved and rows reordered." }
    ],
    faqs: [
      { question: "How does the sorter handle numeric vs. alphabetical sorting?", answer: "The tool auto-detects column types. Numeric columns sort by value (2, 10, 100), not alphabetically (10, 100, 2). Mixed types sort alphabetically." },
      { question: "Can I sort by multiple columns (e.g., last name then first name)?", answer: "Yes, hold Shift and click additional column headers to add them as secondary, tertiary, etc. sort keys." },
      { question: "Does sorting modify the original data?", answer: "No, only the row order changes. All cell values remain exactly as they were in the original file." }
    ]
  },

  "csv-to-ndjson": {
    instructions: [
      { title: "1. Import CSV Data", desc: "Paste or upload a CSV file. The first row is treated as headers which become the JSON property names." },
      { title: "2. Choose Output Format", desc: "Select NDJSON (newline-delimited JSON, one JSON object per row) or pretty-printed JSON array (wrapped in brackets with indentation)." },
      { title: "3. Convert and Download", desc: "Click convert. Each CSV row becomes a JSON object. Download the output as a .json or .ndjson file for use in data pipelines and APIs." }
    ],
    faqs: [
      { question: "What is the difference between NDJSON and a regular JSON array?", answer: "NDJSON has one JSON object per line with no outer brackets or commas, making it streamable. A JSON array wraps all rows in [] brackets." },
      { question: "How does the converter handle special characters in CSV fields?", answer: "Special characters are properly JSON-escaped — quotes become \", newlines become \n, and backslashes become \\. The output is always valid JSON." },
      { question: "Can the converter flatten nested headers or handle duplicate headers?", answer: "No, headers must be unique. Duplicate headers are deduplicated by appending _1, _2, etc. Nested headers are not supported." }
    ]
  },

  "csv-json-row-generator": {
    instructions: [
      { title: "1. Choose Generation Type", desc: "Select whether to generate a new row from scratch or derive it from an existing row by modifying values. This is useful for generating test data." },
      { title: "2. Configure Column Values", desc: "For each column, either type a fixed value, select a pattern (increment, random, or first name/last name generator), or leave blank." },
      { title: "3. Set Quantity and Export", desc: "Specify how many rows to generate — from 1 to 1,000. The output can be exported as CSV rows or JSON array." }
    ],
    faqs: [
      { question: "What data generation patterns are available?", answer: "Available patterns include auto-increment (integer), random number in range, random name, random email, random date, random boolean, and UUID generation." },
      { question: "Can I generate rows that match a specific schema or template?", answer: "Yes, import an existing CSV as a template. The generator preserves the column names and types, allowing you to generate data matching the same schema." },
      { question: "Does the tool generate realistic-looking test data?", answer: "Patterns like 'random name' pull from curated lists of common first and last names, cities, and email domains for more realistic test data." }
    ]
  },

  "csv-formatter": {
    instructions: [
      { title: "1. Import Your CSV", desc: "Upload or paste a CSV file. The tool auto-detects the current delimiter (comma, tab, semicolon, or pipe)." },
      { title: "2. Choose Formatting Options", desc: "Select the output delimiter, quoting style (all fields, only when needed, or never), line ending type (LF or CRLF), and header formatting (lowercase, uppercase, or as-is)." },
      { title: "3. Preview and Export", desc: "A live preview shows how the reformatted CSV looks. Download the formatted file with consistent quoting and delimiters throughout." }
    ],
    faqs: [
      { question: "What is the purpose of reformatting CSV output?", answer: "Different systems require different CSV conventions. Reformatted CSV ensures consistent delimiters, quoting, and line endings for reliable data exchange between systems." },
      { question: "Can I convert between Excel-style CSV and standard CSV?", answer: "Yes, the tool supports both. Excel CSV typically uses the system's list separator (semicolon in European locales) — select the appropriate locale option." },
      { question: "Does the formatter handle BOM (byte order mark) in CSV files?", answer: "Yes, the tool detects UTF-8 BOM and can add or remove it. BOM is recommended for Excel compatibility with UTF-8 CSV files." }
    ]
  },

  // ===== GAMES & INTERACTIVE =====
  "dice-roller": {
    instructions: [
      { title: "1. Select Dice Configuration", desc: "Choose the number of dice (1 to 20) and the number of sides per die (4, 6, 8, 10, 12, 20, or 100). Standard polyhedral dice are supported." },
      { title: "2. Roll the Dice", desc: "Click the roll button to simulate the dice throw. Each die result is shown individually with a brief randomization animation." },
      { title: "3. View Results and Total", desc: "The outcome shows each die value and the total sum. A roll history is maintained below, allowing you to track all rolls in the current session." }
    ],
    faqs: [
      { question: "Are the dice rolls truly random or simulated?", answer: "Rolls use a cryptographically secure PRNG (getRandomValues), which is more than sufficient for fair gameplay in tabletop RPGs and board games." },
      { question: "Can I roll with advantage or disadvantage like in D&D 5e?", answer: "Yes, enable advantage (roll 2d20, take higher) or disadvantage (roll 2d20, take lower) for any d20 roll with a single toggle." },
      { question: "Does the roller support exploding dice (rule of 6)?", answer: "Yes, toggle exploding dice mode. When a die rolls the maximum value, it is rerolled and added again, cascading indefinitely." }
    ]
  },

  "dice-roller-tool": {
    instructions: [
      { title: "1. Enter Dice Notation", desc: "Type dice expressions in standard notation like '3d6+2', '2d20', or 'd100'. The parser handles multiple dice groups separated by plus or minus signs." },
      { title: "2. Save Common Rolls", desc: "Save your frequently used dice expressions as presets with custom names (e.g., 'Fireball: 8d6'). Presets persist in your browser's local storage." },
      { title: "3. Roll and Analyze", desc: "Click roll to execute all dice groups. Results show individual die values, group subtotals, modifiers, and the grand total with a probability distribution chart." }
    ],
    faqs: [
      { question: "What dice notation syntax is supported?", answer: "Standard XdY+Z notation is supported, where X is number of dice, Y is sides per die, and Z is a modifier. Also supports keeping highest/lowest (XdYkhZ, XdYklZ)." },
      { question: "Can I roll dice for multiple players at once?", answer: "No, the tool handles one dice expression at a time. For group rolls, run separate rolls for each player or use a single roll with many dice." },
      { question: "Does the tool show the probability distribution of rolls?", answer: "Yes, a bar chart displays the distribution of all individual die results, showing how many times each face value appeared in the roll." }
    ]
  },

  "coin-flipper": {
    instructions: [
      { title: "1. Flip the Coin", desc: "Click the coin to flip it. A 3D flip animation shows the coin tumbling before landing on heads or tails with equal probability." },
      { title: "2. Track Statistics", desc: "A counter tracks total flips, heads count, tails count, and the longest streak. Streaks are shown for both sides with timestamps." },
      { title: "3. Flip Multiple Times", desc: "Set a number (1 to 100) in the auto-flip field to flip the coin repeatedly. Results update in real-time with aggregate statistics." }
    ],
    faqs: [
      { question: "Is a coin flip truly 50/50 or is there a physical bias?", answer: "Digitally, the flip uses a cryptographically secure random source with exactly 50% probability for heads and 50% for tails." },
      { question: "Can I customize the coin with different images or labels?", answer: "No, the coin displays standard heads (H) and tails (T). Custom coin faces are not supported in this tool." },
      { question: "Does the tool record the history of all flips in a session?", answer: "Yes, a chronological list of every flip shows the result and timestamp. The list can be cleared manually or exported as text." }
    ]
  },

  "number-guessing-game": {
    instructions: [
      { title: "1. Set the Range", desc: "Choose the minimum and maximum numbers for the random target. A wider range makes the game harder. Default is 1 to 100." },
      { title: "2. Start Guessing", desc: "Type a number in the range and submit your guess. The game tells you whether the target is higher or lower after each guess." },
      { title: "3. Win or Lose", desc: "Guess correctly to win and see your score (number of guesses taken). The game records your best score in the session for comparison." }
    ],
    faqs: [
      { question: "What is the minimum number of guesses needed using optimal strategy?", answer: "With binary search on a 1-100 range, you can always find the number in 7 or fewer guesses (log2 of 100 ≈ 6.64)." },
      { question: "Can I change the difficulty mid-game?", answer: "No, changing the range resets the game with a new random target. Your current game's progress is lost." },
      { question: "Does the game have a time limit or unlimited guesses?", answer: "There is no time limit and no guess limit. The only goal is to find the number in as few guesses as possible." }
    ]
  },

  "rock-paper-scissors": {
    instructions: [
      { title: "1. Choose Your Move", desc: "Click the rock, paper, or scissors button to make your selection. Your choice is highlighted and locked in immediately." },
      { title: "2. See the Computer's Move", desc: "The computer's randomly chosen move is revealed after a brief animation. The win/loss/draw result is displayed with a color-coded banner." },
      { title: "3. Track Your Record", desc: "A scoreboard tracks wins, losses, draws, and your current win streak. Statistics show which moves you favor and your win rate with each." }
    ],
    faqs: [
      { question: "Does the computer use any strategy or is it truly random?", answer: "The computer chooses randomly with equal probability (1/3 each) on every round. There is no pattern learning or adaptive strategy." },
      { question: "Can I play against another person instead of the computer?", answer: "No, this is a single-player game against the computer. For a two-player version, take turns picking moves on separate devices." },
      { question: "Does the game support best-of-N series (e.g., best of 3)?", answer: "Yes, toggle best-of mode and set N. The game automatically tracks rounds and declares a series winner when one player reaches the target wins." }
    ]
  },

  "hangman-game": {
    instructions: [
      { title: "1. Start a New Game", desc: "Click start to begin. A random word is selected from the chosen difficulty category. The word is shown as dashes representing each letter." },
      { title: "2. Guess Letters", desc: "Click letter buttons on the on-screen keyboard to make guesses. Correct guesses reveal the letter's positions. Incorrect guesses add a body part to the gallows." },
      { title: "3. Win or Lose", desc: "Guess all letters before the hangman is fully drawn (6 incorrect guesses). The game tracks won/lost count and average guesses per win." }
    ],
    faqs: [
      { question: "How many incorrect guesses are allowed before losing?", answer: "The standard limit is 6 incorrect guesses. Each wrong guess adds one body part (head, body, arms, legs). The game ends when the figure is complete." },
      { question: "Can I choose the word category or difficulty?", answer: "Yes, select from categories like Animals, Countries, Food, Technology, or Random. Difficulty affects word length — Easy (3-4 letters), Medium (5-7), Hard (8+)." },
      { question: "Does the game include a word hint or definition?", answer: "Yes, a hint button reveals the word's category and a short definition. Using a hint counts as a penalty and uses one of your allowed incorrect guesses." }
    ]
  },

  // ===== COLOR TOOLS =====
  "color-picker": {
    instructions: [
      { title: "1. Pick a Color", desc: "Click on the color spectrum or saturation/brightness panel to choose a color. Alternatively, type a HEX code like #FF5733 directly into the input field." },
      { title: "2. Fine-Tune with Sliders", desc: "Adjust the hue, saturation, and lightness sliders to fine-tune your selection. The HSV, HSL, and RGB values update in real-time." },
      { title: "3. Copy Color Values", desc: "Click any color value (HEX, RGB, HSL, HSV) to copy it to your clipboard. The color swatch preview shows your selected color with a checkerboard for transparency." }
    ],
    faqs: [
      { question: "Can I pick colors from anywhere on my screen?", answer: "No, the color picker is limited to the tool's UI. Use your operating system's eye-dropper tool to capture colors from other applications." },
      { question: "Does the picker support alpha transparency?", answer: "Yes, drag the alpha slider to adjust opacity from fully transparent (0) to fully opaque (255). The HEX value shows as 8-digit RRGGBBAA when alpha is below 255." },
      { question: "Can I save colors to a palette for later use?", answer: "Yes, click the + icon to add the current color to your session palette. Saved colors appear as swatches below the picker and can be removed individually." }
    ]
  },

  "color-palette-generator": {
    instructions: [
      { title: "1. Choose a Base Color", desc: "Select a starting color using the color picker. The generator creates a harmony palette based on this seed color." },
      { title: "2. Select Harmony Rule", desc: "Pick a color harmony type — analogous, complementary, split-complementary, triadic, tetradic, or monochromatic. Each rule uses different geometric relationships on the color wheel." },
      { title: "3. Generate and Export", desc: "Click generate to create a 5-color palette. Each swatch shows its HEX code. Export the entire palette as a CSS variable set, SCSS map, or downloadable image." }
    ],
    faqs: [
      { question: "What is the difference between analogous and monochromatic palettes?", answer: "Analogous uses colors adjacent on the wheel (30° apart) for harmonious contrast. Monochromatic uses variations of a single hue at different saturation and lightness levels." },
      { question: "Can I lock a color and regenerate only the others?", answer: "Yes, click the lock icon on any swatch to preserve it. Regenerating only affects unlocked colors while the locked colors remain fixed." },
      { question: "Does the tool ensure sufficient contrast between palette colors?", answer: "The generator does not enforce contrast ratios. Use the Contrast Checker tool separately to verify accessibility compliance for your palette." }
    ]
  },

  "gradient-generator": {
    instructions: [
      { title: "1. Set Gradient Colors", desc: "Choose two or more color stops by clicking on the gradient bar. Each stop has its own color picker and position slider." },
      { title: "2. Configure Gradient Type", desc: "Select linear (with angle control from 0° to 360°) or radial (with shape and position controls). The preview updates in real-time." },
      { title: "3. Copy CSS Code", desc: "Click copy to copy the generated CSS background property. The tool outputs standard linear-gradient() or radial-gradient() syntax compatible with all modern browsers." }
    ],
    faqs: [
      { question: "Can I create gradients with more than 2 color stops?", answer: "Yes, click anywhere on the gradient bar to add a new color stop. You can add up to 10 stops and drag them to adjust their positions." },
      { question: "Does the generator support repeating gradients?", answer: "Yes, toggle repeating mode for repeating-linear-gradient or repeating-radial-gradient output. Set the size of the repeating pattern." },
      { question: "Can I export the gradient as an image file?", answer: "Yes, click download to save the gradient as a PNG image at your chosen resolution (1920x1080, 800x600, or 400x300)." }
    ]
  },

  "contrast-checker": {
    instructions: [
      { title: "1. Set Foreground and Background Colors", desc: "Use the color pickers or enter HEX codes for the text (foreground) and background colors. The tool calculates the contrast ratio instantly." },
      { title: "2. Check WCAG Compliance", desc: "The results show the contrast ratio and whether it passes WCAG AA (4.5:1 for normal text, 3:1 for large) and AAA (7:1 for normal, 4.5:1 for large) standards." },
      { title: "3. Adjust and Retest", desc: "Use the lightness slider to adjust the foreground color until it passes the desired compliance level. The tool shows the minimum required adjustment." }
    ],
    faqs: [
      { question: "What is a good contrast ratio for readability?", answer: "A ratio of at least 4.5:1 for normal text and 3:1 for large text (18px+ bold or 24px+ regular) meets WCAG AA, the minimum legal standard in many countries." },
      { question: "Can I test a palette of multiple color pairs at once?", answer: "Yes, paste multiple HEX pairs in the batch mode to see which pass and which fail. Results are color-coded green (pass) and red (fail)." },
      { question: "Does the checker account for font weight and size in the recommendation?", answer: "Yes, select text size (small, large, or very large) and weight (normal or bold). The tool adjusts the AA and AAA thresholds accordingly." }
    ]
  },

  "color-tools": {
    instructions: [
      { title: "1. Enter a Color Value", desc: "Start by inputting a color in any format — HEX, RGB, HSL, HSV, CMYK, or named color like 'coral'. The tool converts it to all other formats." },
      { title: "2. Explore Color Variations", desc: "View tints (white added), shades (black added), tones (gray added), and the complementary color. Each variation shows its HEX code for copying." },
      { title: "3. Use the Color Blindness Simulator", desc: "Toggle the color blindness view to simulate how the color appears to someone with protanopia, deuteranopia, or tritanopia." }
    ],
    faqs: [
      { question: "What color formats can I convert between?", answer: "HEX (6-digit and 3-digit), RGB, RGBA, HSL, HSLA, HSV, CMYK, and named CSS colors. The tool auto-detects the input format when you type or paste." },
      { question: "How does the color blindness simulator work?", answer: "It applies a matrix transformation to the RGB values that approximates how different cone deficiencies perceive the color, based on the Brettel-Vienot-Mollon algorithm." },
      { question: "Can I convert between sRGB and Adobe RGB color spaces?", answer: "No, the tool operates exclusively in the sRGB color space. CMYK conversion is approximate and intended for screen preview, not print production." }
    ]
  },

  // ===== LIST & DECISION TOOLS =====
  "list-randomizer": {
    instructions: [
      { title: "1. Add List Items", desc: "Type or paste items one per line. The tool accepts up to 10,000 items. Each line is treated as an individual entry for randomization." },
      { title: "2. Randomize the List", desc: "Click the shuffle button to randomly reorder all items using the Fisher-Yates shuffle algorithm, which gives every permutation equal probability." },
      { title: "3. Copy or Download", desc: "Copy the randomized list to your clipboard or download it as a text file. You can shuffle again to get a different order." }
    ],
    faqs: [
      { question: "How does the Fisher-Yates shuffle work?", answer: "It iterates through the list backward, swapping each element with a randomly chosen earlier element. This produces an unbiased permutation in O(n) time." },
      { question: "Can I randomize a comma-separated list without converting it first?", answer: "Yes, paste comma-separated values directly. The tool auto-detects the delimiter and splits them into individual items." },
      { question: "Does the tool preserve the original order anywhere?", answer: "No, once randomized, the original order is gone. Copy the original list before shuffling if you need to keep both versions." }
    ]
  },

  "list-sorter": {
    instructions: [
      { title: "1. Paste Your Unsorted List", desc: "Enter items one per line in the input area. The tool accepts text, numbers, or alphanumeric entries." },
      { title: "2. Choose Sort Criteria", desc: "Select sort by text (A-Z or Z-A), by number (ascending or descending), by line length, or by reverse order." },
      { title: "3. View Sorted Results", desc: "The sorted list appears in the output area. Copy the sorted list or download it. A comparison view shows the original alongside the sorted version." }
    ],
    faqs: [
      { question: "Can I sort a list of file paths by filename or extension?", answer: "Yes, use the 'by filename' or 'by extension' option. The tool parses the last segment of the path or the part after the last dot for sorting." },
      { question: "Does the sorter handle mixed content (numbers and text together)?", answer: "Yes, natural sorting is applied. 'Item 2' comes before 'Item 10' instead of alphabetical sorting which would put 'Item 10' before 'Item 2'." },
      { question: "Can I sort case-insensitively?", answer: "Yes, toggle the case-insensitive option. When enabled, 'apple' and 'Apple' are treated as equivalent for sorting purposes." }
    ]
  },

  "decision-maker": {
    instructions: [
      { title: "1. Enter Your Question", desc: "Type a yes/no question or a question with custom answer options. The tool stores your question but decisions are based purely on random selection." },
      { title: "2. Set Custom Answers (Optional)", desc: "Replace the default Yes/No with custom outcomes like 'Go for it', 'Wait', 'Ask again later'. You can provide up to 10 possible answers." },
      { title: "3. Make the Decision", desc: "Click the decide button. The tool displays a dramatic animation that lands on one answer. A history log records every decision made in the session." }
    ],
    faqs: [
      { question: "Is the decision truly random or does it follow patterns?", answer: "Each decision uses a cryptographically secure random selection. There is no pattern, weighting, or bias — every outcome is equally likely." },
      { question: "Can I assign different probabilities to different answers?", answer: "No, all answers have equal probability. For weighted decisions, use the Random Decision Maker tool which supports custom weights." },
      { question: "Can I share a decision outcome with others?", answer: "Yes, after a decision is made, a share button generates a link that displays the question and result. The link is encoded and does not expire." }
    ]
  },

  "yes-no-picker": {
    instructions: [
      { title: "1. Ask a Yes/No Question", desc: "Type any yes-or-no question into the input box. The more specific your question, the more satisfying the answer will feel." },
      { title: "2. Toggle Maybe Option", desc: "Enable or disable the 'Maybe' option. With Maybe off, the tool picks strictly between Yes and No. With Maybe on, there is a 10% chance of Maybe." },
      { title: "3. Get Your Answer", desc: "Click the ask button. A full-screen animation reveals the answer with an accompanying sound effect. The animation varies based on the answer." }
    ],
    faqs: [
      { question: "What is the probability distribution of Yes, No, and Maybe?", answer: "With Maybe off: 50% Yes, 50% No. With Maybe on: 45% Yes, 45% No, 10% Maybe. All percentages use true random selection." },
      { question: "Can I override the result if I disagree with it?", answer: "Yes, click the 'Ask Again' button below the result to reroll. The old result is logged in the history but a new independent decision is made." },
      { question: "Does the tool save my question history?", answer: "Session history is saved in your browser's local storage. The last 50 questions and their answers are viewable in a collapsible sidebar." }
    ]
  },

  "counter-tool": {
    instructions: [
      { title: "1. Set Initial Value", desc: "Enter the starting count for your counter. This can be any integer — positive, negative, or zero. The default is 0." },
      { title: "2. Configure Step Size", desc: "Set how much the counter increments or decrements with each click. Common step sizes are 1, 2, 5, 10, or any custom integer." },
      { title: "3. Count Up or Down", desc: "Click the + or - buttons to change the count. A long-press on either button auto-repeats. The count can also be reset to the initial value anytime." }
    ],
    faqs: [
      { question: "Can I add labels or notes to specific count values?", answer: "No, the counter tracks only the numeric value. For annotated counting, use a spreadsheet or note-taking app alongside the counter." },
      { question: "What is the maximum or minimum value the counter supports?", answer: "The counter supports values from -9,999,999 to 9,999,999. Beyond these limits, the display shows an overflow indicator." },
      { question: "Can I have multiple counters running simultaneously?", answer: "Yes, click the + Add Counter button to create additional counters. Each counter has its own value, step size, label, and color theme." }
    ]
  },

  // ===== OTHER UNIQUE TOOLS =====
  "ip-address-lookup": {
    instructions: [
      { title: "1. Enter an IP Address", desc: "Type an IPv4 or IPv6 address into the input field. The tool validates the format and rejects invalid addresses with an error message." },
      { title: "2. Look Up Details", desc: "Click lookup to retrieve geographic and network information. Results include ISP, organization, ASN, city, region, country, and coordinates." },
      { title: "3. View on Map", desc: "The location is plotted on an interactive map if geolocation data is available. Zoom controls let you explore the surrounding area." }
    ],
    faqs: [
      { question: "How accurate is the IP geolocation data?", answer: "Accuracy varies by IP. City-level data is about 60-80% accurate. ISP and country data is nearly 100% accurate. Mobile IPs are less accurate than fixed-line IPs." },
      { question: "Can I look up my own public IP address?", answer: "Yes, click the 'My IP' button to automatically detect and look up your public IP address. The request goes through the server, not client-side." },
      { question: "Is any IP data stored or logged by the tool?", answer: "No, IP lookups are processed on demand and not stored. The tool is privacy-respecting and does not retain any query history." }
    ]
  },

  "mac-vendor-lookup": {
    instructions: [
      { title: "1. Enter a MAC Address", desc: "Type a MAC address in any common format — xx:xx:xx:xx:xx:xx, xx-xx-xx-xx-xx-xx, or xxxxxxxxxxxx. The tool normalizes the input automatically." },
      { title: "2. Look Up Vendor", desc: "Click lookup to query the MAC address against the IEEE OUI database. The result displays the device manufacturer or organization that owns the OUI prefix." },
      { title: "3. View Additional Details", desc: "Results include the OUI registration date, address of the vendor, and whether the MAC is a public or private address." }
    ],
    faqs: [
      { question: "What is an OUI and how is it used?", answer: "OUI (Organizationally Unique Identifier) is the first 24 bits (3 bytes) of a MAC address assigned to a manufacturer. IEEE maintains the registry used by this tool." },
      { question: "Can I look up the full device model from a MAC address?", answer: "No, the OUI only identifies the manufacturer, not the specific device model. For example, you can identify Apple but not whether it's an iPhone or MacBook." },
      { question: "How often is the vendor database updated?", answer: "The database is updated monthly from the IEEE public OUI listing. The last update date is shown at the top of the results panel." }
    ]
  },

  "url-shortener": {
    instructions: [
      { title: "1. Enter the Long URL", desc: "Paste the URL you want to shorten. The tool validates that the URL is properly formatted and includes a protocol (http:// or https://)." },
      { title: "2. Customize Slug (Optional)", desc: "Optionally enter a custom alias for the shortened URL. If left blank, a random 6-character alphanumeric slug is generated." },
      { title: "3. Copy Short URL", desc: "Click shorten to generate the short URL. The result appears below with a copy button. The short URL redirects to your original URL when visited." }
    ],
    faqs: [
      { question: "How long does the shortened URL remain active?", answer: "URLs created with this tool do not expire. They remain active indefinitely unless explicitly deleted through the management dashboard." },
      { question: "Can I set a password or expiration date on a short URL?", answer: "No, the basic shortener supports neither passwords nor expirations. For these features, consider a premium URL shortening service." },
      { question: "Does the tool track click statistics for short URLs?", answer: "Yes, basic analytics are available — total clicks, unique clicks, and top referrers. Access the stats by appending /stats to your short URL." }
    ]
  },

  "bulk-url-shortener": {
    instructions: [
      { title: "1. Enter Multiple URLs", desc: "Paste up to 100 URLs — one per line. Each URL is validated individually. Invalid URLs are highlighted and excluded from processing." },
      { title: "2. Add Custom Slugs or Prefixes", desc: "Optionally assign a prefix to all short URLs (e.g., 'campaign-' generates campaign-abc123). Individual custom slugs can be set per URL." },
      { title: "3. Generate and Export", desc: "Click shorten all. Results appear in a table with original URL, short URL, and creation status. Download the results as a CSV file." }
    ],
    faqs: [
      { question: "Can I upload a CSV file of URLs instead of pasting them?", answer: "Yes, upload a CSV file with a URL column. The tool maps the column and processes all URLs in the file." },
      { question: "What happens if a custom slug is already taken?", answer: "The tool appends a random suffix to the requested slug. The final slug is shown in the results so you know the actual generated value." },
      { question: "Is there a rate limit on bulk URL creation?", answer: "You can create up to 100 short URLs per batch and run a batch every 60 seconds. This prevents abuse of the shortening service." }
    ]
  },

  "resume-builder": {
    instructions: [
      { title: "1. Fill in Personal Information", desc: "Enter your name, email, phone, location, and LinkedIn/GitHub URLs. This header section appears at the top of the resume." },
      { title: "2. Add Sections", desc: "Add work experience, education, skills, certifications, and projects sections. Each section can have multiple entries with dates and descriptions." },
      { title: "3. Choose Template and Export", desc: "Select a professional template style. Preview the rendered resume and download as PDF. The layout auto-adjusts to fit content on one page." }
    ],
    faqs: [
      { question: "Can I rearrange sections by dragging them?", answer: "Yes, sections can be reordered by dragging the handle icon next to each section header. The order is preserved in the exported PDF." },
      { question: "Does the builder support multiple pages for long resumes?", answer: "Yes, the builder accommodates multi-page resumes. An academic CV mode removes the one-page limit and adds a publications section." },
      { question: "Can I save my resume and edit it later?", answer: "Yes, your resume data is saved to the browser's local storage. You can close and return later to continue editing." }
    ]
  },

  "zip-file-extractor": {
    instructions: [
      { title: "1. Upload a ZIP File", desc: "Click to select a .zip file from your computer. The maximum file size is 200MB. Password-protected ZIP files are not supported." },
      { title: "2. Browse Contents", desc: "After upload, the tool displays the archive's directory tree showing filenames, sizes, compression ratios, and modification dates." },
      { title: "3. Extract Files", desc: "Select individual files or folders to extract. Click download to receive a new ZIP containing only your selected files, or download files individually." }
    ],
    faqs: [
      { question: "Can I add files to an existing ZIP archive?", answer: "No, this tool extracts ZIP files only. For creating ZIP archives, use your operating system's built-in compression or a dedicated compression application." },
      { question: "Does the extractor support ZIP64 format for large archives?", answer: "Yes, ZIP64 (supporting files over 4GB and archives over 4GB) is fully supported. The 200MB upload limit applies to the upload, not the format." },
      { question: "Are files extracted on the server or in the browser?", answer: "All extraction happens in the browser using JavaScript. Files are never uploaded to a server, making the tool suitable for sensitive data." }
    ]
  },

  "phone-parser": {
    instructions: [
      { title: "1. Enter a Phone Number", desc: "Type a phone number in any format — international (+1 415 555 0123), national (415-555-0123), or with special characters." },
      { title: "2. Select Country", desc: "Choose the country to use for parsing. The tool uses Google's libphonenumber library to analyze and validate the number." },
      { title: "3. View Parsed Components", desc: "The result shows country code, national significant number, area code, subscriber number, number type (mobile, fixed, toll-free), and formatted versions." }
    ],
    faqs: [
      { question: "Can this parser validate a phone number without knowing the country?", answer: "Yes, enable auto-detect to infer the country from the number's country code prefix. If the country code is ambiguous, the tool shows possible matches." },
      { question: "What phone number formats can the parser handle?", answer: "It handles E.164 international, national, RFC 3966 (tel: URI), and carrier-specific formats for 200+ countries and regions." },
      { question: "Does the tool check if a number is currently active or in service?", answer: "No, validation checks format correctness and number possibility only. It does not make calls or send messages to verify the number is in service." }
    ]
  },

  "wheel-of-names": {
    instructions: [
      { title: "1. Add Names to the Wheel", desc: "Type names one per line or paste a comma-separated list. Each name becomes a colored segment on the wheel. You can add up to 100 names." },
      { title: "2. Customize Wheel Appearance", desc: "Adjust segment colors, add or remove the center logo, and toggle sound effects. The wheel automatically sizes segments evenly." },
      { title: "3. Spin the Wheel", desc: "Click the spin button or press the spacebar. The wheel spins with realistic physics simulation and deceleration. The winning name is highlighted with a popup." }
    ],
    faqs: [
      { question: "Can I remove a name from the wheel after it is selected?", answer: "Yes, toggle removal mode. When enabled, selected names are removed from the wheel after each spin, preventing repeat selections." },
      { question: "Does the wheel use true randomness for the outcome?", answer: "The spin animation is visual only — the outcome is determined by cryptographically secure random selection before the animation begins." },
      { question: "Can I save my name list for future use?", answer: "Yes, name lists are saved to local storage. You can also export the list as a text file and import it later." }
    ]
  },

  "number-to-words-converter": {
    instructions: [
      { title: "1. Enter a Number", desc: "Type any integer from 0 to 999,999,999,999,999 (999 trillion). The input accepts digits only — commas and spaces are stripped automatically." },
      { title: "2. Choose Language", desc: "Select the output language — English, Spanish, French, German, or Hindi. Each language uses its own grammar rules for number names." },
      { title: "3. View Word Representation", desc: "The number is displayed in words with proper capitalization. Both the standard form and a check-writing form (with 'and' before the last part) are shown." }
    ],
    faqs: [
      { question: "How does the converter handle decimal numbers like 123.45?", answer: "Enter the whole and decimal parts separately. For 123.45, the tool outputs 'one hundred twenty-three point four five' with each decimal digit spoken individually." },
      { question: "Can the converter output ordinal words (first, second, third)?", answer: "No, only cardinal numbers (one, two, three) are supported. Ordinal conversion is not available in this tool." },
      { question: "What is the maximum number that can be converted to words?", answer: "The maximum supported value is 999,999,999,999,999 (nine hundred ninety-nine trillion, nine hundred ninety-nine billion, nine hundred ninety-nine million, nine hundred ninety-nine thousand, nine hundred ninety-nine)." }
    ]
  },

  "number-words-tools": {
    instructions: [
      { title: "1. Choose Conversion Direction", desc: "Toggle between number-to-words and words-to-number conversion. The tool switches input and output fields automatically." },
      { title: "2. Enter Your Value", desc: "For number-to-words, type digits. For words-to-number, type the word form (e.g., 'two thousand forty-seven'). The parser handles common misspellings." },
      { title: "3. View Both Representations", desc: "The tool shows the number and its word form side by side. Currency mode adds dollar/euro/pound currency words for financial documents." }
    ],
    faqs: [
      { question: "What number formats does the words-to-number parser recognize?", answer: "It recognizes standard English word forms including 'hundred', 'thousand', 'million', 'billion', 'trillion', and hyphenated forms like 'twenty-one'." },
      { question: "Can the tool convert currency amounts like $1,234.56 to words?", answer: "Yes, currency mode outputs 'one thousand two hundred thirty-four dollars and fifty-six cents'. Supported currencies include USD, EUR, GBP, INR, and JPY." },
      { question: "Does the tools version differ from the basic number-to-words converter?", answer: "Yes, this tool adds bidirectional conversion (words back to numbers), currency mode, and batch processing of multiple values." }
    ]
  },

  "random-port-generator": {
    instructions: [
      { title: "1. Set Port Range", desc: "Choose the lower and upper bounds for port generation. The default is the dynamic/private port range 49152-65535, but you can set any range from 1 to 65535." },
      { title: "2. Filter Reserved Ports", desc: "Toggle the option to exclude IANA well-known ports (0-1023) and registered ports (1024-49151). When enabled, only dynamic ports are generated." },
      { title: "3. Generate Port Numbers", desc: "Click generate to produce one or more random port numbers. Each port is verified to be within range and free from the excluded categories." }
    ],
    faqs: [
      { question: "What are the three ranges of TCP/UDP port numbers?", answer: "Well-known ports (0-1023), registered ports (1024-49151), and dynamic/private ports (49152-65535). Dynamic ports are recommended for custom applications." },
      { question: "Can the generator check if a port is actually available on my system?", answer: "No, port availability depends on your current system state. The tool generates valid port numbers but cannot check if a process is already using them." },
      { question: "Can I exclude specific ports that are commonly used by known services?", answer: "Yes, maintain an exclusion list (e.g., 80, 443, 3306, 5432). Ports on this list are skipped during generation." }
    ]
  },

  "speed-test": {
    instructions: [
      { title: "1. Start the Test", desc: "Click the start button to begin the speed test. The test runs in three phases: ping (latency), download speed, and upload speed." },
      { title: "2. Wait for Completion", desc: "The test downloads and uploads sample data to measure throughput. A progress indicator shows which phase is currently running." },
      { title: "3. View Results", desc: "Results display ping (ms), download speed (Mbps), upload speed (Mbps), and jitter. A letter grade from A+ to F rates your connection quality." }
    ],
    faqs: [
      { question: "What size files are used for the download and upload tests?", answer: "The download test uses a 10MB file and the upload test uses a 5MB file. These sizes are sufficient for accurate measurement of typical broadband connections." },
      { question: "Does the speed test use my data plan?", answer: "Yes, the test consumes approximately 15MB of data per run (10MB download + 5MB upload). Results may affect metered connections." },
      { question: "Can the test run on a mobile browser or only desktop?", answer: "The test works on both desktop and mobile browsers. Mobile results may be less accurate due to variable cellular network conditions." }
    ]
  }
};

module.exports = { CONTENT };
