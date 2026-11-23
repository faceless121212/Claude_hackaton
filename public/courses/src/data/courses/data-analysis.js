export default {
  id: 'data-analysis',
  title: 'Exploring Data',
  category: 'data',
  tagline: 'Read charts like a detective',
  description: 'Learn to summarize data, read charts critically, and avoid the classic traps people fall into when numbers tell a story.',
  icon: '📊',
  color: '#10b981',
  difficulty: 'Beginner',
  isNew: false,
  levels: [
    {
      id: 'l1',
      title: 'Averages & Spread',
      summary: 'Summarize a whole dataset with just a few well-chosen numbers.',
      lessons: [
        {
          id: 'l1-1',
          title: 'Mean, Median, Mode',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'Three kinds of "typical"', body: 'The **mean** adds everything up and divides by how many values there are. The **median** is the middle value once the data is sorted. The **mode** is the most common value.\n\nThey often agree, but not always, and the differences are revealing.' },
            { type: 'choice', prompt: 'What is the mean of 2, 4, 9?', options: ['4', '5', '9'], answer: 1, explain: 'Add them up and divide by 3: (2 + 4 + 9) ÷ 3 = 15 ÷ 3 = 5.' },
            { type: 'choice', prompt: 'Five people earn (in thousands) 30, 32, 35, 38, and 500. Which number better describes a typical salary?', options: ['The median (35)', 'The mean (127)'], answer: 0, explain: 'One huge salary drags the mean up to 127, more than four of the five people earn. The median ignores that outlier.' },
            { type: 'input', prompt: 'What is the median of 7, 1, 5, 3, 9?', answer: 5, explain: 'Sort first: 1, 3, 5, 7, 9. The middle value is 5.' }
          ]
        },
        {
          id: 'l1-2',
          title: 'How Spread Out?',
          minutes: 4,
          xp: 10,
          steps: [
            { type: 'info', title: 'Averages hide things', body: 'Two datasets can share the same average and still look completely different. **Spread** tells you how far apart the values are.\n\nThe simplest measure is the **range**: `largest value − smallest value`.' },
            { type: 'choice', prompt: 'Class A scored 70, 70, 70. Class B scored 40, 70, 100. Which statement is true?', options: ['Same mean, same spread', 'Different mean, same spread', 'Same mean, but B is more spread out'], answer: 2, explain: 'Both classes average 70, but the range of A is 0 while the range of B is 60.' },
            { type: 'input', prompt: 'What is the range of 12, 5, 20, 8?', answer: 15, explain: 'The largest value is 20 and the smallest is 5, so the range is 20 − 5 = 15.' },
            { type: 'choice', prompt: 'You add one extreme outlier to a large dataset. Which measure changes the most?', options: ['The range', 'The median', 'The mode'], answer: 0, explain: 'The range depends only on the two most extreme values, so a single outlier changes it directly. The median and mode barely move.' }
          ]
        }
      ]
    },
    {
      id: 'l2',
      title: 'Reading Charts',
      summary: 'Pick the right chart for the job and spot charts that mislead.',
      lessons: [
        {
          id: 'l2-1',
          title: 'Bars and Lines',
          minutes: 4,
          xp: 10,
          steps: [
            { type: 'info', title: 'Every chart has a job', body: '**Bar charts** compare separate categories. **Line charts** show how something changes over time. **Pie charts** show parts of a whole.\n\nBefore reading any chart, check the **axes**: what is being measured, and in what units?' },
            { type: 'choice', prompt: 'You want to show how a city\'s temperature changed across the 12 months of a year. Which chart fits best?', options: ['Pie chart', 'Line chart', 'A single number'], answer: 1, explain: 'A line chart is built for showing change over time, so rises and dips are easy to see.' },
            { type: 'input', prompt: 'A bar chart shows ice creams sold: Mon `10`, Tue `15`, Wed `5`, Thu `20`. How many more were sold on the best day than on the worst day?', answer: 15, explain: 'The tallest bar is Thursday (20) and the shortest is Wednesday (5): 20 − 5 = 15.' },
            { type: 'choice', prompt: 'What is a pie chart best at?', options: ['Showing parts of a whole', 'Showing change over time', 'Comparing 50 categories'], answer: 0, explain: 'Pie slices show each share of a total. With many categories or changes over time, they quickly become unreadable.' }
          ]
        },
        {
          id: 'l2-2',
          title: 'Misleading Charts',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'Charts can lie', body: 'A chart can show true numbers and still give a false impression.\n\nThe most common trick is a **truncated axis**: starting the vertical axis above zero makes tiny differences look enormous.' },
            { type: 'choice', prompt: 'A bar chart\'s vertical axis starts at 98. Brand A scores 99 and Brand B scores 100, so B\'s bar looks twice as tall. How much higher is B\'s score really?', options: ['About 100%', 'About 50%', 'About 1%'], answer: 2, explain: '100 is only about 1% more than 99. The cut-off axis hides most of each bar and exaggerates the gap.' },
            { type: 'choice', prompt: 'A headline says "Sales doubled!" above a line chart showing just two days. What is the smartest question to ask?', options: ['What happens over a longer period?', 'What font did they use?', 'Nothing, two points are plenty'], answer: 0, explain: 'Two cherry-picked days can show almost anything. A longer time range reveals whether it is a trend or a blip.' },
            { type: 'choice', prompt: 'A budget doubles, so a chart draws a money bag twice as tall AND twice as wide. How much bigger does the picture look?', options: ['2 times', '4 times', '8 times'], answer: 1, explain: 'Doubling both height and width multiplies the area by 2 × 2 = 4, so a doubling looks like a quadrupling.' }
          ]
        }
      ]
    },
    {
      id: 'l3',
      title: 'Correlation vs Causation',
      summary: 'Learn why two things moving together does not mean one causes the other.',
      lessons: [
        {
          id: 'l3-1',
          title: 'Moving Together',
          minutes: 4,
          xp: 10,
          steps: [
            { type: 'info', title: 'What is correlation?', body: 'Two things are **correlated** when they tend to change together.\n\nIn a **positive** correlation both go up together. In a **negative** correlation, one goes up as the other goes down.' },
            { type: 'choice', prompt: 'As hours spent studying go up, test scores tend to go up. What kind of relationship is this?', options: ['Positive correlation', 'Negative correlation', 'No correlation'], answer: 0, explain: 'Both quantities rise together, which is a positive correlation.' },
            { type: 'choice', prompt: 'As a car gets older, its resale price tends to drop. What kind of relationship is this?', options: ['Positive correlation', 'No correlation', 'Negative correlation'], answer: 2, explain: 'One goes up (age) while the other goes down (price), which is a negative correlation.' },
            { type: 'choice', prompt: 'What relationship would you expect between an adult\'s shoe size and their favorite number?', options: ['Positive correlation', 'No correlation', 'Negative correlation'], answer: 1, explain: 'Nothing links the two, so knowing one tells you nothing about the other.' }
          ]
        },
        {
          id: 'l3-2',
          title: 'Does A Cause B?',
          minutes: 6,
          xp: 20,
          steps: [
            { type: 'info', title: 'Correlation is not causation', body: 'Just because two things move together does not mean one **causes** the other.\n\nOften a hidden third factor, called a **confounder**, is driving both. Always ask: what else could explain this?' },
            { type: 'choice', prompt: 'Ice cream sales and sunburns rise and fall together. What is the most likely explanation?', options: ['Ice cream causes sunburn', 'Sunburn makes people crave ice cream', 'Hot, sunny weather drives both'], answer: 2, explain: 'Sunny weather is the confounder: it sends people out for ice cream and also burns their skin.' },
            { type: 'choice', prompt: 'Among school children, kids with bigger feet tend to read better. What hidden factor explains this?', options: ['Age', 'Shoe brand', 'Luck'], answer: 0, explain: 'Older children have bigger feet and have also had more years of reading practice.' },
            { type: 'choice', prompt: 'What is the best way to test whether a new fertilizer actually causes plants to grow taller?', options: ['Survey gardeners who chose to use it', 'Randomly give it to half the plants and compare', 'Find one very tall plant that got it'], answer: 1, explain: 'Random assignment spreads other factors, like sunlight and soil, evenly across both groups, so the fertilizer is the only systematic difference.' }
          ]
        }
      ]
    }
  ]
}
