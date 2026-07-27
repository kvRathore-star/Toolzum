const fs = require('fs');

const CALC_INSTRUCTIONS = {
  "age-calculator": [
    ["1. Enter Birth Date", "Select your date of birth using the date picker."],
    ["2. Choose Reference Date", "Use today's date or pick a custom date to calculate age on."],
    ["3. View Full Age", "See your exact age in years, months, days, hours, minutes, and seconds."],
  ],
  "eta-calculator": [
    ["1. Enter Start Time", "Input the departure or start time."],
    ["2. Enter Distance and Speed", "Input the distance to travel and average speed."],
    ["3. Calculate ETA", "View the estimated arrival time based on your inputs."],
  ],
  "study-time-calculator": [
    ["1. Enter Exam Date", "Set your exam or deadline date."],
    ["2. Enter Study Hours Needed", "Estimate total study hours required for the subject."],
    ["3. Plan Schedule", "Get a recommended daily study schedule leading up to the exam."],
  ],
  "test-score-calculator": [
    ["1. Enter Total Questions", "Input the total number of questions on the test."],
    ["2. Enter Correct Answers", "Input the number of questions you answered correctly."],
    ["3. View Score", "See your percentage score and letter grade."],
  ],
  "words-per-page-calculator": [
    ["1. Enter Document Details", "Input total word count, font size, and line spacing."],
    ["2. Adjust Page Size", "Select page size (A4, Letter, Legal) and margins."],
    ["3. View Estimate", "See estimated pages and adjust formatting to meet page targets."],
  ],
  "screen-size-converter": [
    ["1. Enter Diagonal Size", "Input the screen diagonal size in inches."],
    ["2. Select Aspect Ratio", "Choose the aspect ratio (16:9, 4:3, 21:9, etc.)."],
    ["3. View Dimensions", "Get screen width and height in inches, centimeters, and pixels."],
  ],
  "semver-calculator": [
    ["1. Enter Version", "Input a semantic version (e.g., 1.2.3)."],
    ["2. Choose Operation", "Select bump major, minor, or patch version."],
    ["3. View Result", "See the new version after the bump with detailed diff."],
  ],
  "standard-deviation-calculator": [
    ["1. Enter Numbers", "Input your dataset as comma-separated or space-separated numbers."],
    ["2. Calculate", "The tool computes mean, variance, and standard deviation."],
    ["3. Review Stats", "View population and sample standard deviation with step-by-step breakdown."],
  ],
  "business-days-calculator": [
    ["1. Enter Start Date", "Select the starting date for the calculation."],
    ["2. Enter End Date", "Select the ending date."],
    ["3. View Count", "See total business days excluding weekends and optional holidays."],
  ],
  "day-of-week-calculator": [
    ["1. Enter Date", "Select any date to find out which day of the week it falls on."],
    ["2. View Result", "See the day name and additional calendar information."],
    ["3. Explore", "Check what day other notable dates fall on."],
  ],
  "day-of-year-calculator": [
    ["1. Enter Date", "Select a date to find its position in the year."],
    ["2. View Day Number", "See the day number (1-366) and days remaining in the year."],
    ["3. Reverse Lookup", "Input a day number to find the corresponding date."],
  ],
  "exponent-calculator": [
    ["1. Enter Base", "Input the base number."],
    ["2. Enter Exponent", "Input the power to raise the base to."],
    ["3. Calculate", "View the result with step-by-step calculation."],
  ],
  "final-grade-calculator": [
    ["1. Enter Current Grade", "Input your current grade in the class."],
    ["2. Enter Desired Grade", "Input the grade you want for the final outcome."],
    ["3. Enter Exam Weight", "Input the weight of the final exam. See required score."],
  ],
  "gpa-calculator": [
    ["1. Enter Courses", "Add your courses with credit hours and letter grades."],
    ["2. Add All Courses", "Continue adding all courses for the semester."],
    ["3. Calculate GPA", "View your semester GPA and cumulative GPA."],
  ],
  "grade-calculator": [
    ["1. Enter Assignments", "Add assignment names, scores received, and max possible scores."],
    ["2. Enter Weights", "Set the weight of each assignment category."],
    ["3. Calculate Grade", "View your current grade and what you need on remaining work."],
  ],
  "college-gpa-calculator": [
    ["1. Add Semesters", "Enter each completed semester with course grades and credits."],
    ["2. Add Courses Per Semester", "Add all courses with letter grades and credit hours."],
    ["3. Calculate", "View your overall GPA across all semesters."],
  ],
  "leap-year-calculator": [
    ["1. Enter Year", "Input any year to check if it is a leap year."],
    ["2. Check Result", "See whether the year is a leap year with the divisibility rule explanation."],
    ["3. Browse Nearby Years", "View nearby leap years for reference."],
  ],
  "probability-calculator": [
    ["1. Enter Event Details", "Input the number of favorable outcomes and total possible outcomes."],
    ["2. Calculate", "View probability as fraction, decimal, and percentage."],
    ["3. Review Steps", "See step-by-step probability calculation."],
  ],
  "proportion-calculator": [
    ["1. Enter Three Values", "Input three known values of a proportion (a/b = c/d)."],
    ["2. Calculate", "The tool solves for the missing value."],
    ["3. View Result", "See the completed proportion with step-by-step solution."],
  ],
  "ratio-calculator": [
    ["1. Enter Values", "Input two numbers to find their simplified ratio."],
    ["2. Simplify", "The tool reduces the ratio to its simplest form."],
    ["3. View Equivalent Ratios", "See equivalent ratios and the ratio in different formats."],
  ],
  "aspect-ratio-calculator": [
    ["1. Enter Width and Height", "Input the width and height dimensions."],
    ["2. Choose Common Ratio", "Or select from common aspect ratios (16:9, 4:3, etc.)."],
    ["3. View Result", "See the simplified aspect ratio and missing dimension if applicable."],
  ],
  "circle-calculator": [
    ["1. Enter One Value", "Input the radius, diameter, circumference, or area of a circle."],
    ["2. Calculate", "The tool computes all other circle properties automatically."],
    ["3. View All", "See radius, diameter, circumference, and area displayed together."],
  ],
  "dpi-calculator": [
    ["1. Enter Screen Dimensions", "Input screen width and height in pixels."],
    ["2. Enter Physical Size", "Input screen diagonal or width/height in inches."],
    ["3. Calculate DPI", "View dots per inch and pixel pitch."],
  ],
  "fraction-calculator": [
    ["1. Enter Fractions", "Input two fractions with numerators and denominators."],
    ["2. Choose Operation", "Select add, subtract, multiply, or divide."],
    ["3. View Result", "See the result as a simplified fraction and decimal."],
  ],
  "mean-median-mode-calculator": [
    ["1. Enter Numbers", "Input your dataset as comma or space-separated values."],
    ["2. Calculate", "The tool computes mean, median, mode, and range."],
    ["3. Review Stats", "View all measures of central tendency with sorted data."],
  ],
  "ppi-calculator": [
    ["1. Enter Resolution", "Input screen width and height in pixels."],
    ["2. Enter Diagonal", "Input the screen diagonal size in inches."],
    ["3. View PPI", "See pixels per inch, dot pitch, and total pixel count."],
  ],
  "pythagorean-theorem-calculator": [
    ["1. Enter Two Sides", "Input any two sides of a right triangle (a, b, or c)."],
    ["2. Calculate", "The tool computes the missing side length."],
    ["3. View Triangle Info", "See all sides, area, perimeter, and angles."],
  ],
  "quadratic-equation-solver": [
    ["1. Enter Coefficients", "Input the a, b, and c coefficients of ax+bx+c=0."],
    ["2. Solve", "The tool computes the roots using the quadratic formula."],
    ["3. View Solutions", "See real or complex roots with step-by-step solution."],
  ],
  "rectangle-area-calculator": [
    ["1. Enter Length and Width", "Input the length and width of the rectangle."],
    ["2. Calculate", "The tool computes area, perimeter, and diagonal."],
    ["3. View All Properties", "See area, perimeter, and diagonal length."],
  ],
  "square-root-calculator": [
    ["1. Enter Number", "Input a positive number to find its square root."],
    ["2. Calculate", "View the principal square root and negative square root."],
    ["3. See Steps", "Review the step-by-step calculation and nearest perfect squares."],
  ],
  "scientific-calculator": [
    ["1. Enter Expression", "Type or click buttons to build a mathematical expression."],
    ["2. Use Functions", "Access trigonometric, logarithmic, and exponential functions."],
    ["3. Calculate", "Press equals to evaluate the expression with detailed steps."],
  ],
  "fluid-typography-calculator": [
    ["1. Enter Min and Max Sizes", "Input the minimum and maximum font sizes."],
    ["2. Enter Viewport Range", "Input the minimum and maximum viewport widths."],
    ["3. Generate CSS", "Copy the generated clamp() CSS rule for fluid typography."],
  ],
  "work-hours-calculator": [
    ["1. Enter Clock In/Out Times", "Input your start and end times for each work day."],
    ["2. Add Breaks", "Enter unpaid break durations if applicable."],
    ["3. Calculate Hours", "View total hours worked, overtime, and regular hours."],
  ],
  "hours-minutes-calculator": [
    ["1. Enter Time Values", "Input hours and minutes to add or subtract."],
    ["2. Choose Operation", "Select add or subtract between time values."],
    ["3. View Result", "See the total time in hours:minutes format."],
  ],
  "time-addition-calculator": [
    ["1. Enter Starting Time", "Input the base time you want to add to."],
    ["2. Enter Duration", "Input hours and minutes to add."],
    ["3. View Result", "See the new time after adding the duration."],
  ],
  "time-until-calculator": [
    ["1. Enter Target Date", "Select the future date and time to count down to."],
    ["2. View Countdown", "See the exact time remaining in days, hours, minutes, and seconds."],
    ["3. Auto-Refresh", "The countdown updates in real time."],
  ],
  "meeting-time-planner": [
    ["1. Enter Your Timezone", "Select your timezone from the list."],
    ["2. Add Participants", "Add timezones of all meeting participants."],
    ["3. Find Overlap", "View overlapping business hours across all timezones."],
  ],
  "triangle-area-calculator": [
    ["1. Enter Triangle Dimensions", "Input base and height, or three side lengths."],
    ["2. Choose Method", "Select base-height or Heron's formula method."],
    ["3. Calculate", "View area with step-by-step calculation."],
  ],
  "gas-mileage-calculator": [
    ["1. Enter Distance", "Input total distance traveled."],
    ["2. Enter Fuel Used", "Input fuel consumed in gallons or liters."],
    ["3. Calculate Mileage", "View miles per gallon or liters per 100km and trip cost."],
  ],
  "percentage-difference-calculator": [
    ["1. Enter Two Numbers", "Input the two values you want to compare."],
    ["2. Calculate", "The tool computes the percentage difference."],
    ["3. View Result", "See the difference as both a number and percentage."],
  ],
  "fraction-to-decimal-calculator": [
    ["1. Enter Numerator and Denominator", "Input the fraction you want to convert."],
    ["2. Convert", "See the decimal equivalent and simplified fraction."],
    ["3. View Steps", "Review the division step-by-step."],
  ],
  "decimal-to-fraction-calculator": [
    ["1. Enter Decimal", "Input the decimal number to convert."],
    ["2. Convert", "The tool finds the exact fraction representation."],
    ["3. View Result", "See the simplified fraction and step-by-step conversion."],
  ],
  "rule-of-three-calculator": [
    ["1. Enter Three Values", "Input three known values for a direct proportion."],
    ["2. Calculate", "The tool computes the missing fourth value."],
    ["3. View Solution", "See the completed proportion with explanation."],
  ],
  "combination-calculator": [
    ["1. Enter n and r", "Input the total items (n) and items to choose (r)."],
    ["2. Calculate", "The tool computes C(n,r) combinations."],
    ["3. View Result", "See the number of ways to choose r items from n items."],
  ],
  "permutation-calculator": [
    ["1. Enter n and r", "Input the total items (n) and items to arrange (r)."],
    ["2. Calculate", "The tool computes P(n,r) permutations."],
    ["3. View Result", "See the number of ways to arrange r items from n items."],
  ],
  "factorial-calculator": [
    ["1. Enter Number", "Input a non-negative integer n."],
    ["2. Calculate", "The tool computes n! (n factorial)."],
    ["3. View Result", "See the factorial value with step-by-step multiplication."],
  ],
  "prime-number-checker": [
    ["1. Enter Number", "Input any positive integer to check."],
    ["2. Check", "The tool determines if the number is prime."],
    ["3. View Factors", "See all factors and the prime factorization."],
  ],
  "prime-factorization-calculator": [
    ["1. Enter Number", "Input a positive integer to factorize."],
    ["2. Calculate", "The tool breaks the number into prime factors."],
    ["3. View Result", "See the prime factorization with exponents."],
  ],
  "greatest-common-factor-calculator": [
    ["1. Enter Two Numbers", "Input the two numbers to find the GCF of."],
    ["2. Calculate", "The tool computes the greatest common factor."],
    ["3. View Steps", "See the step-by-step solution using prime factorization."],
  ],
  "least-common-multiple-calculator": [
    ["1. Enter Two Numbers", "Input the two numbers to find the LCM of."],
    ["2. Calculate", "The tool computes the least common multiple."],
    ["3. View Steps", "See the step-by-step solution."],
  ],
  "modulo-calculator": [
    ["1. Enter Dividend and Divisor", "Input the dividend and divisor."],
    ["2. Calculate", "The tool computes dividend mod divisor."],
    ["3. View Result", "See the remainder and step-by-step division."],
  ],
  "logarithm-calculator": [
    ["1. Enter Value and Base", "Input the number and log base."],
    ["2. Calculate", "The tool computes the logarithm."],
    ["3. View Result", "See the log value with step-by-step calculation."],
  ],
  "trigonometry-calculator": [
    ["1. Enter Angle", "Input the angle in degrees or radians."],
    ["2. Select Function", "Choose sin, cos, tan, csc, sec, or cot."],
    ["3. Calculate", "View the trigonometric value with step-by-step work."],
  ],
  "degree-radian-converter": [
    ["1. Enter Value", "Input the angle in degrees or radians."],
    ["2. Convert", "The tool converts to the other unit automatically."],
    ["3. View Result", "See the converted value with the conversion formula."],
  ],
  "scientific-notation-converter": [
    ["1. Enter Number", "Input a number in decimal or scientific notation."],
    ["2. Convert", "The tool converts between both formats."],
    ["3. View Result", "See the number in both formats with step-by-step conversion."],
  ],
  "significant-figures-calculator": [
    ["1. Enter Number", "Input a number to count its significant figures."],
    ["2. Analyze", "The tool identifies each digit's significance."],
    ["3. View Count", "See the significant figure count and rules applied."],
  ],
  "rounding-calculator": [
    ["1. Enter Number", "Input the number to round."],
    ["2. Select Precision", "Choose decimal places or significant figures."],
    ["3. View Result", "See the rounded number with step-by-step rounding."],
  ],
  "math-equation-solver": [
    ["1. Enter Equation", "Type or paste a mathematical equation."],
    ["2. Solve", "The tool solves for the unknown variable."],
    ["3. View Solution", "See the step-by-step solution."],
  ],
  "algebra-calculator": [
    ["1. Enter Expression", "Type an algebraic expression or equation."],
    ["2. Choose Operation", "Select simplify, factor, or solve."],
    ["3. View Result", "See the simplified expression or solution."],
  ],
  "geometry-calculator": [
    ["1. Select Shape", "Choose a geometric shape from the list."],
    ["2. Enter Dimensions", "Input the required dimensions for the shape."],
    ["3. Calculate", "View area, perimeter, volume, and other properties."],
  ],
  "coordinate-calculator": [
    ["1. Enter Coordinates", "Input the coordinates of two points (x,y)."],
    ["2. Calculate", "The tool computes distance and midpoint."],
    ["3. View Result", "See the distance between points and midpoint coordinates."],
  ],
  "slope-calculator": [
    ["1. Enter Two Points", "Input the coordinates of two points on a line."],
    ["2. Calculate", "The tool computes slope, equation, and intercepts."],
    ["3. View Result", "See slope, y-intercept, and line equation."],
  ],
  "midpoint-calculator": [
    ["1. Enter Two Points", "Input the coordinates of two points."],
    ["2. Calculate", "The tool computes the midpoint coordinates."],
    ["3. View Result", "See the midpoint with step-by-step calculation."],
  ],
  "distance-calculator": [
    ["1. Enter Two Points", "Input the coordinates of two points (x,y) on a plane."],
    ["2. Calculate", "The tool computes the Euclidean distance."],
    ["3. View Result", "See the distance with step-by-step calculation."],
  ],
  "date-difference-calculator": [
    ["1. Enter Start Date", "Select the starting date."],
    ["2. Enter End Date", "Select the ending date."],
    ["3. View Difference", "See the difference in days, months, years, and total days."],
  ],
  "date-addition-calculator": [
    ["1. Enter Start Date", "Select the starting date."],
    ["2. Add Duration", "Enter days, months, or years to add."],
    ["3. View Result", "See the resulting date after adding the duration."],
  ],
  "week-number-calculator": [
    ["1. Enter Date", "Select any date to find its ISO week number."],
    ["2. Enter Week Number", "Or input a week number and year to find the date range."],
    ["3. View Result", "See the week number, year, and start/end dates of the week."],
  ],
  "time-since-calculator": [
    ["1. Enter Past Date", "Select a past date and time."],
    ["2. Calculate", "The tool computes the elapsed time since that moment."],
    ["3. View Duration", "See the time elapsed in years, months, days, hours, minutes, and seconds."],
  ],
  "daylight-saving-time-checker": [
    ["1. Select Year", "Choose the year to check."],
    ["2. Select Timezone", "Choose the US timezone (Eastern, Central, Mountain, Pacific)."],
    ["3. View Dates", "See DST start and end dates for the selected year and timezone."],
  ],
};

const CALC_FAQS = {
  "age-calculator": [
    ["What is the exact age calculation?", "The calculator computes age by subtracting the birth date from the reference date, accounting for leap years and month lengths."],
    ["Can I calculate age as of a past date?", "Yes. Change the reference date from today to any past or future date."],
    ["Is this accurate for leap year babies?", "Yes. February 29 birthdays are handled correctly with February 28 or March 1 used in non-leap years."],
  ],
  "eta-calculator": [
    ["How is ETA calculated?", "ETA = Start Time + (Distance / Speed). The calculation accounts for hours and minutes."],
    ["Can I account for stops?", "This calculator computes driving time only. Add rest stops and breaks separately."],
    ["Does this account for traffic?", "No. The calculator assumes constant speed. Actual arrival time may vary due to traffic and road conditions."],
  ],
  "study-time-calculator": [
    ["How many hours should I study per day?", "The calculator distributes total study hours evenly across available days. Adjust based on your personal capacity."],
    ["Does this account for breaks?", "The schedule shows study time only. Include short breaks between sessions for better retention."],
    ["Can I customize the schedule?", "Yes. Adjust the total hours or days to create a personalized study plan."],
  ],
  "test-score-calculator": [
    ["How is the grade determined?", "Percentage = (Correct Answers / Total Questions) x 100. The letter grade follows the standard 90-80-70-60 scale."],
    ["Can I use different grading scales?", "The calculator uses the standard scale. For custom grading, use the Grade Calculator tool."],
    ["Does this account for partial credit?", "No. Each question is either correct or incorrect. For partial credit grading, calculate weighted scores separately."],
  ],
  "words-per-page-calculator": [
    ["What factors affect words per page?", "Font size, font family, line spacing, margins, and page size all affect how many words fit on a page."],
    ["Is this accurate for all fonts?", "The calculator uses average character widths. Different fonts may produce slightly different results."],
    ["Can I use this for book formatting?", "Yes. This is commonly used for estimating manuscript page counts for publishing."],
  ],
  "screen-size-converter": [
    ["How is screen width and height calculated?", "Using the diagonal size and aspect ratio, the tool applies the Pythagorean theorem to find width and height."],
    ["What is the difference between physical and logical resolution?", "Physical resolution is the actual pixel count. PPI can be calculated from physical size and resolution."],
    ["Can I calculate for any aspect ratio?", "Yes. Choose from common ratios or enter a custom aspect ratio."],
  ],
  "semver-calculator": [
    ["What is semantic versioning?", "Semantic versioning uses MAJOR.MINOR.PATCH format where breaking changes increment MAJOR, features increment MINOR, and fixes increment PATCH."],
    ["What does each version bump mean?", "Patch: backwards-compatible bug fixes. Minor: backwards-compatible features. Major: breaking changes."],
    ["Can I compare two versions?", "Yes. The calculator shows the difference between current and new versions."],
  ],
  "standard-deviation-calculator": [
    ["What is standard deviation?", "Standard deviation measures the spread of data points from the mean. A low SD indicates data clustered close to the mean."],
    ["What is the difference between population and sample?", "Population SD uses N as denominator. Sample SD uses N-1 (Bessel's correction) to account for sampling bias."],
    ["What is a good standard deviation?", "It depends on the data scale. SD should be interpreted relative to the mean using the coefficient of variation."],
  ],
  "business-days-calculator": [
    ["What counts as a business day?", "Monday through Friday, excluding public holidays. Weekends (Saturday and Sunday) are not counted."],
    ["Can I add custom holidays?", "Yes. You can specify dates to exclude as holidays."],
    ["Does this include the start and end dates?", "The calculator counts business days between the dates. Toggle inclusive option to include the end date."],
  ],
  "day-of-week-calculator": [
    ["How is the day of week determined?", "Using Zeller's congruence algorithm which accounts for the Gregorian calendar system."],
    ["Is this accurate for historical dates?", "Yes, for dates after 1582 (Gregorian calendar adoption). For earlier dates, the Julian calendar may differ."],
    ["What about dates before 1752?", "Different countries adopted the Gregorian calendar at different times. Results for very old dates may vary by region."],
  ],
  "day-of-year-calculator": [
    ["How is day of year calculated?", "The day number is the count of days from January 1 (day 1) to the selected date, including leap years."],
    ["What is the maximum day number?", "Day 366 in leap years, day 365 in non-leap years."],
    ["Can I convert a day number to a date?", "Yes. Input a day number (1-366) and year to find the corresponding date."],
  ],
  "exponent-calculator": [
    ["What is an exponent?", "An exponent indicates how many times the base is multiplied by itself. For example, 2 = 2 x 2 x 2 = 8."],
    ["How are negative exponents handled?", "A negative exponent means 1 divided by the base raised to the positive exponent: 2 = 1/2 = 1/8."],
    ["What about fractional exponents?", "Fractional exponents represent roots. For example, 4 = 2 (square root of 4)."],
  ],
  "final-grade-calculator": [
    ["How is the required final exam score calculated?", "Required Score = (Desired Grade - Current Grade x (1 - Exam Weight)) / Exam Weight."],
    ["What if I need more than 100%?", "If the calculated score exceeds 100%, your desired grade is not achievable with the current weights."],
    ["Can I calculate for multiple scenarios?", "Yes. Adjust inputs to see how different exam scores affect your final grade."],
  ],
  "gpa-calculator": [
    ["How is GPA calculated?", "GPA = Total Grade Points / Total Credit Hours. Each letter grade corresponds to a point value (A=4.0, B=3.0, etc.)."],
    ["What if my school uses a different scale?", "The calculator uses the standard 4.0 scale. For weighted GPA or different scales, adjust grade points accordingly."],
    ["Can I track cumulative GPA?", "Yes. Add all semesters to see both semester and cumulative GPA."],
  ],
  "grade-calculator": [
    ["How is the weighted grade calculated?", "Weighted Grade = Sum of (Score x Weight) / Sum of Weights. Each category contributes proportionally."],
    ["What is the difference between weighted and unweighted?", "Weighted grades assign different importance to different categories. Unweighted treats all assignments equally."],
    ["Can I predict what I need on future assignments?", "Yes. Add future assignments with unknown scores to see what you need for a target grade."],
  ],
  "college-gpa-calculator": [
    ["How is cumulative GPA calculated?", "Total grade points across all semesters divided by total credit hours across all semesters."],
    ["Can I include in-progress courses?", "Yes. Add current semester courses to project your GPA with expected grades."],
    ["Does this account for repeated courses?", "The calculator treats each course instance separately. For grade replacement policies, adjust manually."],
  ],
  "leap-year-calculator": [
    ["What are the leap year rules?", "A year is a leap year if: divisible by 4, but not by 100, unless also divisible by 400."],
    ["Why do we have leap years?", "Leap years adjust the calendar because the Earth's orbit takes approximately 365.2425 days."],
    ["What happens if born on February 29?", "Leaplings typically celebrate on February 28 or March 1 in non-leap years."],
  ],
  "probability-calculator": [
    ["How is probability calculated?", "Probability = Favorable Outcomes / Total Possible Outcomes. Results are shown as fraction, decimal, and percentage."],
    ["What is the range of probability?", "Probability ranges from 0 (impossible) to 1 (certain). It is always between 0% and 100%."],
    ["Can I calculate compound probability?", "This calculator handles single events. For multiple events, multiply individual probabilities."],
  ],
  "proportion-calculator": [
    ["How is the missing value found?", "Using cross-multiplication: if a/b = c/d, then a x d = b x c. Solve for the missing value."],
    ["What is a proportion?", "A proportion states that two ratios are equal. Written as a:b = c:d or a/b = c/d."],
    ["Can this handle percentage problems?", "Yes. Proportions are commonly used for percentage, scale, and ratio problems."],
  ],
  "ratio-calculator": [
    ["How is a ratio simplified?", "Divide both numbers by their greatest common factor (GCF)."],
    ["What are equivalent ratios?", "Equivalent ratios are ratios that represent the same relationship. Multiply or divide both terms by the same number."],
    ["Can I convert a ratio to a percentage?", "Yes. A ratio a:b represents a/(a+b) x 100% for the first part and b/(a+b) x 100% for the second."],
  ],
  "aspect-ratio-calculator": [
    ["How is aspect ratio calculated?", "Divide width by height and simplify to the smallest whole numbers. 1920x1080 simplifies to 16:9."],
    ["What are common aspect ratios?", "16:9 (HD video), 4:3 (traditional TV), 21:9 (ultrawide), 3:2 (photography), 1:1 (social media)."],
    ["Can I find missing dimensions?", "Yes. Input one dimension and the aspect ratio to find the matching dimension."],
  ],
  "circle-calculator": [
    ["What formulas are used?", "Diameter = 2r, Circumference = 2pr, Area = pr. Given any one value, all others can be derived."],
    ["Can I input the area to find other values?", "Yes. Enter any single known value to compute all other circle properties."],
    ["Is p (pi) used in calculations?", "Yes. The calculator uses p to high precision for accurate results."],
  ],
  "dpi-calculator": [
    ["What is DPI?", "DPI (Dots Per Inch) measures pixel density. Higher DPI means sharper display."],
    ["How is DPI calculated?", "DPI = Diagonal Pixels / Diagonal Inches. Diagonal pixels = sqrt(width + height)."],
    ["What is a good DPI?", "72 DPI for web, 300 DPI for print. Screen DPI varies: ~200 for standard monitors, ~300+ for Retina displays."],
  ],
  "fraction-calculator": [
    ["How are fractions simplified?", "Divide numerator and denominator by their greatest common factor (GCF)."],
    ["Can I convert the result to decimal?", "Yes. The calculator shows both simplified fraction and decimal equivalent."],
    ["What if denominators are different?", "Fractions with different denominators are converted to a common denominator before addition or subtraction."],
  ],
  "mean-median-mode-calculator": [
    ["What is the difference between mean and median?", "Mean is the average (sum divided by count). Median is the middle value when data is sorted."],
    ["Which measure is better for skewed data?", "Median is better for skewed distributions as it is not affected by outliers like the mean."],
    ["What if there are multiple modes?", "The calculator shows all modes. If no number repeats, there is no mode."],
  ],
  "ppi-calculator": [
    ["What is PPI?", "PPI (Pixels Per Inch) measures pixel density on a screen. Higher PPI means sharper image quality."],
    ["How is PPI different from DPI?", "PPI refers to screen pixels. DPI refers to printer dots. They are often used interchangeably but have different meanings."],
    ["What PPI should I design for?", "Design at 72 PPI for web graphics, 300 PPI for print. Screen resolution determines actual PPI display."],
  ],
  "pythagorean-theorem-calculator": [
    ["What is the Pythagorean theorem?", "a + b = c, where a and b are the legs of a right triangle and c is the hypotenuse."],
    ["Can I calculate any two sides?", "Yes. Enter any two of a, b, or c and the calculator finds the missing side."],
    ["What if I enter sides that can't form a right triangle?", "The calculator validates that the inputs can form a valid right triangle before computing."],
  ],
  "quadratic-equation-solver": [
    ["What is the quadratic formula?", "x = (-b +/- sqrt(b - 4ac)) / 2a. The discriminant (b - 4ac) determines the nature of roots."],
    ["What does the discriminant tell me?", "Discriminant > 0: two real roots. Discriminant = 0: one real root. Discriminant < 0: two complex roots."],
    ["Can it solve equations with complex roots?", "Yes. When the discriminant is negative, the calculator shows complex roots with the imaginary unit i."],
  ],
  "rectangle-area-calculator": [
    ["How is rectangle area calculated?", "Area = Length x Width. Perimeter = 2 x (Length + Width). Diagonal = sqrt(Length + Width)."],
    ["Can I calculate if I only know area and one side?", "Yes. Enter area and either length or width to find the missing dimension."],
    ["What units should I use?", "Any consistent units. Area will be in square units, perimeter in linear units."],
  ],
  "square-root-calculator": [
    ["What is a square root?", "The square root of a number n is the value that when multiplied by itself equals n."],
    ["Can I calculate the square root of negative numbers?", "This calculator handles positive numbers. For negative numbers, the result is an imaginary number."],
    ["How is the square root calculated?", "The calculator uses Newton's method (Heron's method) for iterative approximation."],
  ],
  "scientific-calculator": [
    ["What functions are available?", "Trigonometric (sin, cos, tan), logarithmic (log, ln), exponential (exp), power, factorial, and constants (p, e)."],
    ["Are results given in degrees or radians?", "Toggle between degrees and radians for trigonometric functions."],
    ["Can I review the calculation steps?", "Yes. The calculator shows step-by-step evaluation for complex expressions."],
  ],
  "fluid-typography-calculator": [
    ["What is fluid typography?", "Fluid typography uses the clamp() CSS function to make font sizes scale smoothly between viewport sizes."],
    ["How does clamp() work?", "clamp(MIN, PREFERRED, MAX) sets a font size that scales between min and max based on viewport width."],
    ["Can I use this with any CSS property?", "Yes. The clamp() function works with any CSS property that accepts length values."],
  ],
  "work-hours-calculator": [
    ["How is overtime calculated?", "Hours beyond 40 per week or 8 per day (configurable) are calculated as overtime at the specified rate."],
    ["Can I track multiple days?", "Yes. Add multiple days to calculate total weekly hours."],
    ["Does this account for unpaid breaks?", "Yes. Enter break durations and they are subtracted from total hours."],
  ],
  "hours-minutes-calculator": [
    ["How are hours and minutes added?", "Add hours to hours and minutes to minutes separately, then carry over extra minutes to hours."],
    ["Can I subtract time?", "Yes. Select subtract to find the difference between two time values."],
    ["What is the maximum result?", "There is no limit. The calculator handles large time values."],
  ],
  "time-addition-calculator": [
    ["Can I add to both AM and PM times?", "Yes. The calculator handles 12-hour and 24-hour formats correctly, crossing AM/PM boundaries."],
    ["What if the result goes past midnight?", "The calculator crosses midnight correctly and shows the next day's time if applicable."],
    ["Can I add hours and minutes separately?", "Yes. Enter hours and minutes as separate inputs for flexibility."],
  ],
  "time-until-calculator": [
    ["Does it count down in real time?", "Yes. The countdown updates every second for accurate time tracking."],
    ["Can I set alerts?", "The calculator displays the remaining time. Browser notifications are not supported."],
    ["Does it handle timezone differences?", "Yes. The calculator uses your local timezone for accurate countdown."],
  ],
  "meeting-time-planner": [
    ["How many timezones can I compare?", "Add as many timezones as needed to find the best meeting time for all participants."],
    ["Does it account for DST?", "Yes. The planner uses current DST rules for each timezone."],
    ["Can I save recurring meeting times?", "The planner shows available slots. Save the best time manually for recurring meetings."],
  ],
  "triangle-area-calculator": [
    ["How is triangle area calculated?", "Area = 0.5 x base x height. Using Heron's formula: Area = sqrt(s(s-a)(s-b)(s-c)) where s is semi-perimeter."],
    ["What measurements do I need?", "For base-height method: base and height. For Heron's formula: all three side lengths."],
    ["Can I calculate for right triangles?", "Yes. The Pythagorean Theorem Calculator is better suited for right triangles specifically."],
  ],
  "gas-mileage-calculator": [
    ["How is fuel economy calculated?", "MPG = Miles / Gallons. L/100km = (Liters / km) x 100."],
    ["Can I calculate trip cost?", "Yes. Enter fuel price per unit to see total trip fuel cost."],
    ["Does this account for city vs highway driving?", "This calculator uses a single combined value. For separate city/highway, calculate each separately."],
  ],
  "percentage-difference-calculator": [
    ["How is percentage difference calculated?", "|V1 - V2| / ((V1 + V2) / 2) x 100. This gives a symmetric percentage difference."],
    ["What is the difference between percentage difference and change?", "Percentage difference compares two values symmetrically. Percentage change measures increase/decrease from a reference."],
    ["When should I use this instead of percentage change?", "Use percentage difference when neither value is the reference (both are equally important)."],
  ],
  "fraction-to-decimal-calculator": [
    ["How do I convert a fraction to decimal?", "Divide the numerator by the denominator. The result is the decimal equivalent."],
    ["What if the decimal repeats?", "The calculator shows enough decimal places to identify repeating patterns."],
    ["Can I convert improper fractions?", "Yes. The calculator handles proper fractions, improper fractions, and mixed numbers."],
  ],
  "decimal-to-fraction-calculator": [
    ["How do I convert a decimal to a fraction?", "Write the decimal over 1, multiply numerator and denominator by 10 for each decimal place, then simplify."],
    ["What if the decimal repeats?", "The calculator handles terminating decimals. Repeating decimals require a different conversion method."],
    ["How accurate is the conversion?", "The conversion is exact for terminating decimals. Results are shown as simplified fractions."],
  ],
  "rule-of-three-calculator": [
    ["What is the rule of three?", "The rule of three solves proportions: if a/b = c/d, then d = bc/a. Used for direct proportion problems."],
    ["Can this solve inverse proportions?", "This calculator handles direct proportions. For inverse proportions, the relationship is rearranged."],
    ["What are common applications?", "Percentage calculations, scaling recipes, currency conversion, and unit conversion."],
  ],
  "combination-calculator": [
    ["What is a combination?", "A combination is a selection of items where order does not matter. C(n,r) = n! / (r! x (n-r)!)."],
    ["How is this different from permutation?", "In combinations, order does not matter (ABC = ACB). In permutations, order matters (ABC != ACB)."],
    ["Can I calculate combinations with repetition?", "This calculator handles combinations without repetition. Standard combinations formula."],
  ],
  "permutation-calculator": [
    ["What is a permutation?", "A permutation is an arrangement of items where order matters. P(n,r) = n! / (n-r)!"],
    ["How is this different from combination?", "In permutations, ABC and ACB are different. In combinations, they are the same selection."],
    ["Can I calculate permutations with repetition?", "This calculator handles permutations without repetition. Standard permutation formula."],
  ],
  "factorial-calculator": [
    ["What is a factorial?", "n! = n x (n-1) x (n-2) x ... x 1. For example, 5! = 5 x 4 x 3 x 2 x 1 = 120."],
    ["What is 0!?", "0! = 1 by definition. This is a mathematical convention used in combinatorics."],
    ["What is the largest factorial supported?", "Factorials grow extremely fast. Very large numbers are displayed in scientific notation."],
  ],
  "prime-number-checker": [
    ["What is a prime number?", "A prime number is a positive integer greater than 1 that is only divisible by 1 and itself."],
    ["How do you check if a number is prime?", "The tool uses trial division up to the square root of the number for efficient checking."],
    ["What is the smallest prime?", "2 is the smallest prime number and the only even prime."],
  ],
  "prime-factorization-calculator": [
    ["What is prime factorization?", "Breaking a number into its prime factors. For example, 12 = 2 x 2 x 3."],
    ["How is the factorization done?", "Divide the number by the smallest prime repeatedly, then move to the next prime."],
    ["Is every number factorable?", "Yes. Every integer greater than 1 has a unique prime factorization (Fundamental Theorem of Arithmetic)."],
  ],
  "greatest-common-factor-calculator": [
    ["What is the GCF?", "The GCF is the largest number that divides evenly into two or more numbers."],
    ["How is GCF calculated?", "Using prime factorization or the Euclidean algorithm. The Euclidean algorithm is more efficient for large numbers."],
    ["What is the GCF if numbers are co-prime?", "If numbers have no common factors, the GCF is 1."],
  ],
  "least-common-multiple-calculator": [
    ["What is the LCM?", "The LCM is the smallest positive number that is divisible by both numbers."],
    ["How is LCM calculated?", "LCM(a,b) = |a x b| / GCF(a,b). The product of the numbers divided by their greatest common factor."],
    ["Why is LCM useful?", "LCM is used for finding common denominators in fractions and solving periodic event problems."],
  ],
  "modulo-calculator": [
    ["What is the modulo operation?", "a mod b = a - b x floor(a/b). It returns the remainder after division."],
    ["How is modulo useful?", "Modulo is used in programming for cyclic operations, even/odd checking, and hash functions."],
    ["What if the divisor is zero?", "Division by zero is undefined. The divisor must be a non-zero number."],
  ],
  "logarithm-calculator": [
    ["What is a logarithm?", "log(x) = y means b^y = x. The logarithm is the inverse of exponentiation."],
    ["What are common bases?", "Base 10 (common log), base e (natural log ln), and base 2 (binary log) are the most common."],
    ["Can I use any base?", "Yes. The calculator supports any positive base except 1."],
  ],
  "trigonometry-calculator": [
    ["What trigonometric functions are supported?", "sin, cos, tan, csc, sec, and cot. Toggle between degrees and radians."],
    ["How are values calculated?", "Using standard mathematical series and CORDIC algorithms for high precision."],
    ["Can I find inverse trig values?", "This calculator computes direct trig functions. Use the scientific calculator for inverse functions."],
  ],
  "degree-radian-converter": [
    ["What is the conversion formula?", "Radians = Degrees x p/180. Degrees = Radians x 180/p."],
    ["What are common conversions?", "0 degrees = 0 rad, 30 degrees = p/6, 45 degrees = p/4, 60 degrees = p/3, 90 degrees = p/2, 180 degrees = p."],
    ["When should I use radians vs degrees?", "Degrees are common in geometry and daily use. Radians are standard in calculus and physics."],
  ],
  "scientific-notation-converter": [
    ["What is scientific notation?", "A way to write numbers as a x 10^b, where 1 <= a < 10. For example, 1234 = 1.234 x 10^3."],
    ["What is E notation?", "E notation writes 1.234E3 instead of 1.234 x 10^3. Common in calculators and programming."],
    ["How do I convert large numbers?", "Move the decimal point left until one digit remains, count the moves as the positive exponent."],
  ],
  "significant-figures-calculator": [
    ["Which digits are significant?", "Non-zero digits are always significant. Zeros between digits are significant. Leading zeros are not. Trailing zeros after decimal are significant."],
    ["How many significant figures should I use?", "Use the precision of your least precise measurement. Scientific work typically uses 3-4 significant figures."],
    ["What about exact numbers?", "Exact numbers (defined constants, counted values) have infinite significant figures."],
  ],
  "rounding-calculator": [
    ["What rounding methods are available?", "Standard rounding (round half up), round up (ceil), round down (floor), and round half even (banker's rounding)."],
    ["What is banker's rounding?", "Round half even rounds to the nearest even number when the digit is exactly 5. Reduces statistical bias."],
    ["How many decimal places should I use?", "For most purposes, 2-4 decimal places. Financial calculations typically use 2. Scientific work varies."],
  ],
  "math-equation-solver": [
    ["What types of equations can it solve?", "Linear equations, quadratic equations, and simple algebraic equations with one variable."],
    ["How is the solution shown?", "Step-by-step work is displayed showing each algebraic manipulation."],
    ["Can it solve systems of equations?", "This calculator handles single equations. For systems, solve one equation at a time."],
  ],
  "algebra-calculator": [
    ["What operations are supported?", "Simplify expressions, factor polynomials, solve equations, and expand expressions."],
    ["Can it handle exponents?", "Yes. The calculator supports exponents, variables, and basic algebraic operations."],
    ["Is the solution step-by-step?", "Yes. Each algebraic manipulation is shown step by step."],
  ],
  "geometry-calculator": [
    ["What shapes are supported?", "Square, rectangle, triangle, circle, parallelogram, trapezoid, cube, sphere, cylinder, cone, and rectangular prism."],
    ["Can I calculate area and volume?", "Yes. The calculator computes area, perimeter, volume, and surface area depending on the shape."],
    ["What units should I use?", "Use any consistent units. Results are in square units for area and cubic units for volume."],
  ],
  "coordinate-calculator": [
    ["How is distance calculated?", "Distance = sqrt((x2-x1) + (y2-y1)). The Euclidean distance formula."],
    ["How is midpoint calculated?", "Midpoint = ((x1+x2)/2, (y1+y2)/2). The average of the two points' coordinates."],
    ["Can I use 3D coordinates?", "This calculator handles 2D coordinates. For 3D, use the Distance Calculator with z-coordinates."],
  ],
  "slope-calculator": [
    ["How is slope calculated?", "Slope m = (y2-y1) / (x2-x1). It measures the steepness and direction of a line."],
    ["What does the slope tell me?", "Positive slope: line goes up. Negative slope: line goes down. Zero slope: horizontal line. Undefined: vertical line."],
    ["How do I find the line equation?", "y = mx + b. Using the slope and one point, calculate the y-intercept b."],
  ],
  "midpoint-calculator": [
    ["How is the midpoint calculated?", "Midpoint = ((x1+x2)/2, (y1+y2)/2). The point exactly halfway between two coordinates."],
    ["Can I use decimal coordinates?", "Yes. The calculator handles both integer and decimal coordinates."],
    ["What is the midpoint used for?", "Finding center points, dividing line segments equally, and geometric constructions."],
  ],
  "distance-calculator": [
    ["How is distance calculated?", "Using the Euclidean distance formula: sqrt((x2-x1) + (y2-y1))."],
    ["Can I use 3D coordinates?", "This calculator handles 2D. For 3D, the formula extends to sqrt((x2-x1) + (y2-y1) + (z2-z1))."],
    ["What units is the result in?", "The units match the input coordinates. If coordinates are in meters, the distance is in meters."],
  ],
  "date-difference-calculator": [
    ["How is the date difference calculated?", "The difference is calculated as total days, months, and years between two dates."],
    ["Does it include the end date?", "The calculator shows both inclusive and exclusive options for the day count."],
    ["Does it account for leap years?", "Yes. Leap years are automatically accounted for in the calculation."],
  ],
  "date-addition-calculator": [
    ["How does date addition work?", "Add a duration of days, months, or years to a starting date to get the resulting date."],
    ["What happens if the result date is invalid?", "For example, adding 1 month to January 31 gives February 28 (or 29 in leap years)."],
    ["Can I add multiple units at once?", "Yes. Add days, months, and years simultaneously."],
  ],
  "week-number-calculator": [
    ["What is ISO week number?", "ISO 8601 defines week numbers where Week 1 is the week containing the first Thursday of the year."],
    ["When does the first week start?", "Week 1 of a year starts on the Monday of the week containing the first Thursday."],
    ["Can I find the date range of a week?", "Yes. Input a week number and year to see the Monday-Sunday date range."],
  ],
  "time-since-calculator": [
    ["How is time since calculated?", "Subtract the past date from the current date to find elapsed years, months, days, hours, minutes, and seconds."],
    ["Does it update in real time?", "Yes. The elapsed time updates every second."],
    ["Can I use a custom reference date?", "Yes. Select any past date and time as the starting point."],
  ],
  "daylight-saving-time-checker": [
    ["When does DST start in the US?", "DST starts on the second Sunday of March (spring forward) and ends on the first Sunday of November (fall back)."],
    ["Does this work for other countries?", "This checker uses US DST rules. Different countries have different DST schedules."],
    ["Why do we observe DST?", "DST extends daylight in the evening during summer months, reducing energy consumption."],
  ],
};

const FILES = [
  'src/registry/tools-chunk-0.ts',
  'src/registry/tools-chunk-2.ts',
  'src/registry/tools-chunk-3.ts',
  'src/registry/tools-chunk-4.ts',
];

let modifiedCount = 0;
let skippedCount = 0;

for (const fpath of FILES) {
  let src = fs.readFileSync(fpath, 'utf8');

  for (const [slug, insts] of Object.entries(CALC_INSTRUCTIONS)) {
    const slugRegex = new RegExp(`slug:\\s*["']${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
    const slugMatch = src.match(slugRegex);
    if (!slugMatch) continue;

    const pos = slugMatch.index;

    // Find the full tool object by tracking brace balance
    let toolStart = src.lastIndexOf('{', pos);
    let braceCount = 0;
    let toolEnd = toolStart;
    for (let k = toolStart; k < src.length; k++) {
      if (src[k] === '{') braceCount++;
      if (src[k] === '}') braceCount--;
      if (braceCount === 0 && k > toolStart) {
        toolEnd = k + 1;
        break;
      }
    }

    const fullTool = src.substring(toolStart, toolEnd);

    // Skip if already has instructions
    if (fullTool.includes('instructions:')) {
      skippedCount++;
      continue;
    }

    // Insert before the tool's closing `}`, cleaning up trailing whitespace from the prefix
    const prefix = src.substring(0, toolEnd - 1).replace(/\s+$/, '');
    // Ensure trailing comma before inserting new properties
    const needsComma = !prefix.endsWith(',');
    const prefixFixed = prefix + (needsComma ? ',' : '');

    // Build insert text with correct indentation (6 spaces for array items, 4 for properties)
    let insertText = '\n    instructions: [\n';
    for (const [title, desc] of insts) {
      insertText += `      { title: "${title.replace(/"/g, "'")}", desc: "${desc.replace(/"/g, "'")}" },\n`;
    }
    insertText += '    ],\n    faqs: [\n';
    const faqs = CALC_FAQS[slug] || [];
    for (const [q, a] of faqs) {
      insertText += `      { question: "${q.replace(/"/g, "'")}", answer: "${a.replace(/"/g, "'")}" },\n`;
    }
    // trailing 2 spaces matches the indent used for the closing `  },`
    insertText += '    ],\n  ';

    src = prefixFixed + insertText + src.substring(toolEnd - 1);
    modifiedCount++;
  }

  fs.writeFileSync(fpath, src);
}

console.log(`Modified: ${modifiedCount} Calculator tools`);
console.log(`Skipped (already had instructions): ${skippedCount} tools`);
