export default {
  id: 'mathematical-thinking',
  title: 'Mathematical Thinking',
  category: 'math',
  tagline: 'Train your brain to spot patterns and solve puzzles',
  description: 'Build the core habits of a mathematician: finding rules, reasoning step by step, and counting cleverly. No formulas to memorize, just puzzles to crack.',
  icon: '<img class="ico" src="/img/c-mathematical-thinking.webp" alt="">',
  color: '#f59e0b',
  difficulty: 'Beginner',
  isNew: false,
  levels: [
    {
      id: 'l1',
      title: 'Patterns & Sequences',
      summary: 'Find the hidden rule behind a list of numbers and predict what comes next.',
      lessons: [
        {
          id: 'l1-1',
          title: 'Spot the Rule',
          minutes: 4,
          xp: 10,
          steps: [
            { type: 'info', title: 'Every sequence has a rule', body: 'A **sequence** is a list of numbers that follows a rule. Your job is to play detective and find it.\n\nA great first move: look at the **gap** between neighbors. In `2, 5, 8, 11` each number is 3 more than the last.' },
            { type: 'choice', prompt: 'What comes next?  3, 7, 11, 15, ?', options: ['17', '19', '21'], answer: 1, explain: 'Each number is 4 more than the one before, so 15 + 4 = 19.' },
            { type: 'choice', prompt: 'This one does not add, it multiplies. What comes next?  2, 6, 18, 54, ?', options: ['162', '108', '72', '216'], answer: 0, explain: 'Each number is 3 times the previous one, so 54 × 3 = 162.' },
            { type: 'input', prompt: 'What comes next?  1, 4, 9, 16, 25, ?', answer: 36, explain: 'These are the square numbers: 1×1, 2×2, 3×3, 4×4, 5×5. Next is 6×6 = 36.' }
          ]
        },
        {
          id: 'l1-2',
          title: 'Growing Patterns',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'When the gaps change too', body: 'Sometimes the gap between numbers is not constant, but the **gaps themselves** follow a pattern.\n\nIn `1, 3, 6, 10` the gaps are `2, 3, 4`. Spot the pattern in the gaps and you can keep going forever.' },
            { type: 'choice', prompt: 'What comes next?  1, 3, 6, 10, ?', options: ['13', '14', '15'], answer: 2, explain: 'The gaps are 2, 3, 4, so the next gap is 5. 10 + 5 = 15.' },
            { type: 'choice', prompt: 'Here each number is built from the two before it. What comes next?  1, 1, 2, 3, 5, 8, ?', options: ['10', '11', '12', '13'], answer: 3, explain: 'Add the last two numbers: 5 + 8 = 13. This is the famous Fibonacci sequence.' },
            { type: 'input', prompt: 'A block staircase with 1 step uses 1 block, 2 steps use 3 blocks, and 3 steps use 6 blocks. How many blocks does a 6-step staircase use?', answer: 21, explain: 'Each new step adds one more block than the last: 1 + 2 + 3 + 4 + 5 + 6 = 21.' }
          ]
        }
      ]
    },
    {
      id: 'l2',
      title: 'Logic Puzzles',
      summary: 'Reason step by step, rule out the impossible, and find what must be true.',
      lessons: [
        {
          id: 'l2-1',
          title: 'Truth and Lies',
          minutes: 6,
          xp: 20,
          steps: [
            { type: 'info', title: 'Try it and see what breaks', body: 'In a logic puzzle, you rarely see the answer right away. Instead, **assume** one possibility and follow it through.\n\nIf it leads to a **contradiction**, cross it off. Whatever survives must be the answer.' },
            { type: 'choice', prompt: 'One of three boxes holds a prize, and exactly ONE label is true.\n\nBox A: "The prize is here."\nBox B: "The prize is not here."\nBox C: "The prize is not in Box A."\n\nWhere is the prize?', options: ['Box A', 'Box B', 'Box C'], answer: 1, explain: 'If the prize is in B, labels A and B are false and only C is true. Putting it in A or C makes two labels true, which breaks the rule.' },
            { type: 'choice', prompt: 'Ann says: "Ben is lying."\nBen says: "Cat is lying."\nCat says: "Ann and Ben are both lying."\n\nWho is telling the truth?', options: ['Only Cat', 'Only Ann', 'Only Ben'], answer: 2, explain: 'If Cat were truthful, Ben would be lying, but Ann would be lying too, which makes Ben truthful: a contradiction. So Cat lies, Ben is right, and Ann is wrong about Ben.' },
            { type: 'choice', prompt: '"If it rains, the ground gets wet." You see that the ground is wet. Did it definitely rain?', options: ['No, something else could have made it wet', 'Yes, wet ground proves it rained'], answer: 0, explain: 'Rain guarantees wet ground, but not the other way around. A sprinkler could have done it.' }
          ]
        },
        {
          id: 'l2-2',
          title: 'Deduce It',
          minutes: 6,
          xp: 20,
          steps: [
            { type: 'info', title: 'Process of elimination', body: 'Good detectives use **elimination**: every clue removes some possibilities.\n\nStart with the clue that pins something down for certain, then see what the other clues force.' },
            { type: 'choice', prompt: 'Ava, Bo, and Cy each own one pet: a cat, a dog, or a fish. Ava is allergic to fur. Bo does not own the dog. Who owns the dog?', options: ['Ava', 'Bo', 'Cy'], answer: 2, explain: 'Ava must have the fish. Bo cannot have the dog, so Bo has the cat. That leaves the dog for Cy.' },
            { type: 'choice', prompt: 'In a race, Dee finished before Eli. Eli finished before Flo. Gus finished before Dee. Who came last?', options: ['Flo', 'Eli', 'Gus', 'Dee'], answer: 0, explain: 'Chain the clues together: Gus, Dee, Eli, Flo. Flo is last.' },
            { type: 'input', prompt: 'You have 9 coins that look identical, but one is slightly heavier. Using a balance scale, what is the smallest number of weighings that always finds it?', answer: 2, explain: 'Weigh 3 against 3: the heavy group tips, or it is in the 3 left out. Then weigh 1 against 1 from that group the same way.' }
          ]
        }
      ]
    },
    {
      id: 'l3',
      title: 'Clever Counting',
      summary: 'Count huge numbers of possibilities without listing them one by one.',
      lessons: [
        {
          id: 'l3-1',
          title: 'Count Without Counting',
          minutes: 5,
          xp: 15,
          steps: [
            { type: 'info', title: 'Multiply your choices', body: 'If you make one choice in `a` ways and then another in `b` ways, there are **a × b** combinations in total.\n\nThis is the **multiplication principle**. It lets you count without writing out every option.' },
            { type: 'choice', prompt: 'You have 3 shirts and 4 pairs of pants. How many different outfits can you make?', options: ['7', '12', '16'], answer: 1, explain: 'Each of the 3 shirts pairs with each of the 4 pants: 3 × 4 = 12.' },
            { type: 'choice', prompt: 'How many 2-letter codes can you make from the letters A, B, C if repeats like "AA" are allowed?', options: ['6', '8', '9'], answer: 2, explain: 'There are 3 choices for the first letter and 3 for the second: 3 × 3 = 9.' },
            { type: 'input', prompt: 'In how many different orders can 3 friends line up for a photo?', answer: 6, explain: 'There are 3 choices for the first spot, 2 for the second, and 1 for the last: 3 × 2 × 1 = 6.' }
          ]
        },
        {
          id: 'l3-2',
          title: 'Handshakes & Pairs',
          minutes: 6,
          xp: 20,
          steps: [
            { type: 'info', title: 'Watch out for double counting', body: 'When **order does not matter**, the multiplication principle counts each group more than once.\n\nThe fix: count as if order matters, then **divide** by the number of repeats. A handshake between Ann and Ben is the same as one between Ben and Ann.' },
            { type: 'choice', prompt: '5 people each shake hands with everyone else exactly once. How many handshakes happen?', options: ['10', '20', '25'], answer: 0, explain: 'Each of 5 people shakes 4 hands, giving 5 × 4 = 20, but that counts every handshake twice. 20 ÷ 2 = 10.' },
            { type: 'choice', prompt: 'A pizza shop has 6 toppings. How many ways can you pick 2 different toppings?', options: ['12', '30', '15', '36'], answer: 2, explain: 'There are 6 × 5 = 30 ordered picks, but mushroom-then-olive is the same pizza as olive-then-mushroom. 30 ÷ 2 = 15.' },
            { type: 'input', prompt: 'Pair up 1 + 100, 2 + 99, 3 + 98, and so on. Each pair sums to 101 and there are 50 pairs. What is 1 + 2 + 3 + ... + 100?', answer: 5050, explain: '50 pairs that each add to 101 give 50 × 101 = 5050. Clever pairing beats adding 100 numbers.' }
          ]
        }
      ]
    }
  ]
}
