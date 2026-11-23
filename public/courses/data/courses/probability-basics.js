export default {
  id: 'probability-basics',
  title: 'Probability Basics',
  category: 'math',
  tagline: 'Make sense of chance, dice, and risky bets',
  description: 'Learn to measure uncertainty with coins, dice, and games. You will go from counting outcomes to deciding whether a bet is worth taking.',
  icon: '<img class="ico" src="/img/c-probability-basics.webp" alt="">',
  color: '#ef4444',
  difficulty: 'Beginner',
  isNew: false,
  levels: [
    {
      id: 'l1',
      title: 'Chance & Outcomes',
      summary: 'Turn "how likely is it?" into a number by counting outcomes.',
      lessons: [
        {
          id: 'l1-1',
          title: 'What Are the Odds?',
          minutes: 4,
          xp: 10,
          steps: [
            { type: 'info', title: 'Probability is a fraction', body: 'When every outcome is equally likely, **probability** is simply:\n\n`favorable outcomes ÷ total outcomes`\n\nIt always lands between `0` (impossible) and `1` (certain).' },
            { type: 'choice', prompt: 'You roll a fair six-sided die. What is the probability of rolling a 4?', options: ['1/4', '1/6', '4/6'], answer: 1, explain: 'There is 1 favorable outcome (the 4) out of 6 equally likely faces.' },
            { type: 'choice', prompt: 'Same die. What is the probability of rolling an even number?', options: ['1/2', '1/3', '2/3'], answer: 0, explain: 'Three faces are even (2, 4, 6) out of 6, and 3/6 = 1/2.' },
            { type: 'input', prompt: 'A bag holds 3 red marbles and 7 blue marbles. You pull one out without looking. What is the percent chance it is red? (Type just the number.)', answer: 30, explain: 'There are 3 red out of 10 marbles total: 3/10 = 30%.' }
          ]
        },
        {
          id: 'l1-2',
          title: 'Counting Outcomes',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'List the sample space', body: 'The **sample space** is the full list of things that can happen. For two coin flips it is `HH, HT, TH, TT`.\n\nNotice `HT` and `TH` are **different** outcomes. Forgetting that is the most common mistake in probability.' },
            { type: 'choice', prompt: 'You flip two fair coins. What is the probability of getting exactly one head?', options: ['1/4', '1/3', '1/2'], answer: 2, explain: 'Two of the four outcomes (HT and TH) have exactly one head: 2/4 = 1/2.' },
            { type: 'choice', prompt: 'You roll two dice, one red and one blue. How many equally likely outcomes are there?', options: ['12', '36', '11'], answer: 1, explain: 'Each of the 6 red results can pair with each of the 6 blue results: 6 × 6 = 36.' },
            { type: 'input', prompt: 'Of those 36 outcomes, how many give a total of 7?', answer: 6, explain: 'The pairs are 1+6, 2+5, 3+4, 4+3, 5+2, 6+1. That makes 7 the most likely total, with probability 6/36.' }
          ]
        }
      ]
    },
    {
      id: 'l2',
      title: 'Combining Events',
      summary: 'Find the chance of "this AND that" or "this OR that".',
      lessons: [
        {
          id: 'l2-1',
          title: 'And: Multiply',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'Independent events', body: 'Two events are **independent** when one has no effect on the other, like two separate coin flips.\n\nFor independent events, **multiply**: `P(A and B) = P(A) × P(B)`.' },
            { type: 'choice', prompt: 'You flip a fair coin twice. What is the probability of two heads?', options: ['1/4', '1/2', '1/3'], answer: 0, explain: 'Each flip is heads with probability 1/2, so 1/2 × 1/2 = 1/4.' },
            { type: 'choice', prompt: 'You roll a die and flip a coin. What is the probability of a 6 AND heads?', options: ['1/8', '1/6', '1/12'], answer: 2, explain: 'Multiply the two chances: 1/6 × 1/2 = 1/12.' },
            { type: 'choice', prompt: 'A fair coin has just landed heads 5 times in a row. What is the probability the next flip is heads?', options: ['Less than 1/2', 'Exactly 1/2', 'More than 1/2'], answer: 1, explain: 'The coin has no memory. Each flip is independent, so the chance is still 1/2. Thinking otherwise is the gambler\'s fallacy.' }
          ]
        },
        {
          id: 'l2-2',
          title: 'Or: Add (Carefully)',
          minutes: 6,
          xp: 20,
          steps: [
            { type: 'info', title: 'Add, but do not double count', body: 'If two events **cannot both happen**, add them: `P(A or B) = P(A) + P(B)`.\n\nIf they **overlap**, count the shared outcomes only once. And a handy shortcut: `P(not A) = 1 − P(A)`.' },
            { type: 'choice', prompt: 'You roll one die. What is the probability of rolling a 1 or a 2?', options: ['1/6', '1/3', '1/2'], answer: 1, explain: 'These cannot both happen, so add: 1/6 + 1/6 = 2/6 = 1/3.' },
            { type: 'choice', prompt: 'You roll one die. What is the probability the result is even OR greater than 4?', options: ['5/6', '1/2', '2/3'], answer: 2, explain: 'Even gives 2, 4, 6 and greater than 4 gives 5, 6. Counting 6 only once leaves 2, 4, 5, 6: that is 4/6 = 2/3.' },
            { type: 'input', prompt: 'You flip 3 coins, giving 8 equally likely outcomes. How many of them contain at least one head?', answer: 7, explain: 'Only one outcome (TTT) has no heads, so 8 − 1 = 7. The chance of at least one head is 7/8.' }
          ]
        }
      ]
    },
    {
      id: 'l3',
      title: 'Expected Value',
      summary: 'Work out what a game of chance is worth on average.',
      lessons: [
        {
          id: 'l3-1',
          title: 'The Long-Run Average',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'What happens on average?', body: '**Expected value** is the average result you would get if you repeated something many, many times.\n\nTo find it, multiply each outcome by its probability and add them all up.' },
            { type: 'choice', prompt: 'A game pays $10 if a coin lands heads and $0 if it lands tails. What is the expected payout?', options: ['$0', '$10', '$5'], answer: 2, explain: 'Half the time you get $10 and half the time $0: 1/2 × 10 + 1/2 × 0 = $5.' },
            { type: 'choice', prompt: 'What is the expected value of one roll of a fair die?', options: ['3', '3.5', '4'], answer: 1, explain: 'Average the six faces: (1 + 2 + 3 + 4 + 5 + 6) ÷ 6 = 21 ÷ 6 = 3.5.' },
            { type: 'choice', prompt: 'You can never actually roll a 3.5. Is that a problem?', options: ['No, expected value is a long-run average', 'Yes, it should be the most likely roll'], answer: 0, explain: 'Expected value describes the average over many rolls. It does not have to be a result you can actually get.' }
          ]
        },
        {
          id: 'l3-2',
          title: 'Is It a Fair Game?',
          minutes: 6,
          xp: 20,
          steps: [
            { type: 'info', title: 'Compare the price to the payout', body: 'A game is **fair** when the cost to play equals the expected payout.\n\nIf the cost is higher, you lose money in the long run, even if you win sometimes. This is how casinos and lotteries make money.' },
            { type: 'choice', prompt: 'You pay $2 to roll a die. You win $6 if it shows a 6, otherwise nothing. The expected payout is 1/6 × $6 = $1. Is this a good deal?', options: ['Yes, you gain $1 per play on average', 'No, you lose $1 per play on average', 'It is exactly fair'], answer: 1, explain: 'You pay $2 for something worth $1 on average, so you lose $1 per play in the long run.' },
            { type: 'choice', prompt: 'A raffle sells 100 tickets and has a single $50 prize. What is the expected winnings of one ticket?', options: ['$0.50', '$1', '$50'], answer: 0, explain: 'Each ticket wins with probability 1/100: 1/100 × $50 = $0.50.' },
            { type: 'input', prompt: 'A spinner has 4 equal sections paying $0, $0, $4, and $8. What is the fair price to play, in dollars?', answer: 3, explain: 'Average the four equally likely payouts: (0 + 0 + 4 + 8) ÷ 4 = 3. At $3 per spin the game is fair.' }
          ]
        }
      ]
    }
  ]
}
