export default {
  id: 'algorithms-basics',
  title: 'Algorithm Fundamentals',
  category: 'cs',
  tagline: 'Search, sort and reason about speed',
  description: 'Discover the classic ideas behind fast software by counting steps yourself. Explore searching, sorting, and the intuition behind big-O.',
  icon: '⚙️',
  color: '#6366f1',
  difficulty: 'Intermediate',
  isNew: false,
  levels: [
    {
      id: 'l1',
      title: 'Searching',
      summary: 'Find an item in a list, first the slow way and then the clever way.',
      lessons: [
        {
          id: 'l1-1',
          title: 'Check Every Item',
          minutes: 4,
          xp: 10,
          steps: [
            {
              type: 'info',
              title: 'Linear search',
              body: 'The simplest way to find something: start at the front and check items **one by one** until you find it. This is **linear search**.\n\nIt works on any list, sorted or not. The question is how many checks it costs.'
            },
            {
              type: 'choice',
              prompt: 'You search `[4, 8, 15, 16, 23, 42]` from left to right for `16`.\n\nHow many items do you check, including `16` itself?',
              options: ['3', '4', '6'],
              answer: 1,
              explain: 'You check 4, 8, 15, and then 16. That is 4 checks.'
            },
            {
              type: 'input',
              prompt: 'An unsorted list has 100 items and your target is the very last one.\n\nHow many checks does linear search make?',
              answer: 100,
              explain: 'In the worst case linear search looks at every item, so 100 items means 100 checks.'
            },
            {
              type: 'choice',
              prompt: 'The item you want is **not** in a list of `n` items. How many checks does linear search need before it can say so?',
              options: ['n', 'About half of n', '1'],
              answer: 0,
              explain: 'You cannot be sure it is missing until you have looked at all `n` items.'
            }
          ]
        },
        {
          id: 'l1-2',
          title: 'Halve the Problem',
          minutes: 6,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Binary search',
              body: 'If a list is **sorted**, you can do much better. Check the **middle** item: if your target is smaller, throw away the right half. If larger, throw away the left half.\n\nEvery check cuts the problem in half. This is **binary search**.'
            },
            {
              type: 'choice',
              prompt: 'I am thinking of a number from 1 to 100. After each guess I say higher or lower.\n\nWhich first guess guarantees you eliminate the most numbers?',
              options: ['1', '50', '99', '100'],
              answer: 1,
              explain: 'Guessing the middle rules out about half the numbers no matter what the answer is. Guessing 1 might rule out only one number.'
            },
            {
              type: 'input',
              prompt: 'A sorted list has 16 items. Each check halves what is left.\n\nHow many halvings does it take to go from 16 items down to 1?',
              answer: 4,
              explain: '16, 8, 4, 2, 1. That is 4 halvings, because 2 multiplied by itself 4 times is 16.'
            },
            {
              type: 'choice',
              prompt: 'A sorted list has 1,000,000 items. Roughly how many checks does binary search need in the worst case?',
              options: ['About 500,000', 'About 1,000', 'About 20'],
              answer: 2,
              explain: 'Halving a million about 20 times gets you down to 1, since 2 to the power 20 is just over a million. Linear search could need all 1,000,000.'
            }
          ]
        }
      ]
    },
    {
      id: 'l2',
      title: 'Sorting',
      summary: 'Put a list in order and see why some methods beat others.',
      lessons: [
        {
          id: 'l2-1',
          title: 'Swap the Neighbors',
          minutes: 6,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Bubble sort',
              body: '**Bubble sort** walks through the list comparing each pair of **neighbors**. If a pair is out of order, swap them.\n\nOne walk through the list is called a **pass**. Repeat passes until nothing needs swapping.'
            },
            {
              type: 'choice',
              prompt: 'Do one left-to-right pass of bubble sort on `[3, 1, 4, 2]`.\n\nWhat does the list look like afterwards?',
              options: ['[1, 3, 2, 4]', '[1, 2, 3, 4]', '[1, 3, 4, 2]'],
              answer: 0,
              explain: 'Compare 3 and 1: swap. Compare 3 and 4: fine. Compare 4 and 2: swap. Result: `[1, 3, 2, 4]`.'
            },
            {
              type: 'input',
              prompt: 'How many neighbor comparisons are in one full pass over a list of 5 items?',
              answer: 4,
              explain: 'There are 4 neighboring pairs in 5 items: positions 1-2, 2-3, 3-4 and 4-5.'
            },
            {
              type: 'choice',
              prompt: 'After one full pass of bubble sort, what is **guaranteed**?',
              options: ['The smallest item is first', 'The largest item is last', 'The whole list is sorted'],
              answer: 1,
              explain: 'The largest item wins every comparison it meets, so it gets carried all the way to the end, like a bubble rising.'
            }
          ]
        },
        {
          id: 'l2-2',
          title: 'Divide and Merge',
          minutes: 7,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Merge sort',
              body: '**Merge sort** uses divide and conquer: split the list in half, sort each half, then **merge** the two sorted halves.\n\nMerging is the clever part. Two sorted lists can be zipped into one sorted list very cheaply.'
            },
            {
              type: 'choice',
              prompt: 'You merge the sorted lists `[1, 5, 9]` and `[2, 6]` into one sorted list.\n\nWhat are the first three items out?',
              options: ['1, 5, 9', '1, 2, 5', '2, 6, 1'],
              answer: 1,
              explain: 'Always take the smaller front item: 1 (vs 2), then 2 (vs 5), then 5 (vs 6).'
            },
            {
              type: 'choice',
              prompt: 'While merging two sorted lists, which items do you need to compare to pick the next output?',
              options: ['Every possible pair of items', 'Only the last item of each list', 'Only the front item of each list'],
              answer: 2,
              explain: 'Because both lists are sorted, the smallest remaining item must be at the front of one of them. One comparison per output item is enough.'
            },
            {
              type: 'input',
              prompt: 'Merge sort keeps splitting a list of 8 items in half until every piece has 1 item.\n\nHow many rounds of splitting is that?',
              answer: 3,
              explain: '8 becomes 4, then 2, then 1. Only 3 rounds, which is why merge sort stays fast on big lists.'
            }
          ]
        }
      ]
    },
    {
      id: 'l3',
      title: 'Thinking About Speed',
      summary: 'Build intuition for how an algorithm slows down as its input grows.',
      lessons: [
        {
          id: 'l3-1',
          title: 'Counting Steps',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'What big-O measures',
              body: 'We do not time algorithms with a stopwatch. We ask: **how does the number of steps grow as the input size `n` grows?**\n\nThat growth pattern is what **big-O** describes. One loop over the list is `O(n)`. A loop inside a loop is `O(n²)`.'
            },
            {
              type: 'choice',
              prompt: 'Linear search is `O(n)`. If the list becomes **twice** as long, what happens to the worst-case number of checks?',
              options: ['It stays the same', 'It roughly doubles', 'It becomes four times as many'],
              answer: 1,
              explain: 'Linear growth means steps scale directly with size. Twice the items, twice the checks.'
            },
            {
              type: 'input',
              prompt: 'A loop runs 10 times. Inside it, another loop runs 10 times.\n\nHow many times does the innermost line run in total?',
              answer: 100,
              explain: 'The inner loop does 10 runs for each of the 10 outer runs: `10 * 10 = 100`.'
            },
            {
              type: 'choice',
              prompt: 'An algorithm compares every item with every other item, so it is `O(n²)`. If the list becomes **twice** as long, the work becomes roughly...',
              options: ['4 times as much', '2 times as much', 'Just 1 step more'],
              answer: 0,
              explain: 'Doubling `n` gives `(2n)² = 4n²`. Quadratic algorithms get slow quickly as inputs grow.'
            }
          ]
        },
        {
          id: 'l3-2',
          title: 'Growth Races',
          minutes: 6,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Slow growers win',
              body: 'From slowest-growing to fastest-growing: `O(1)` (constant), `O(log n)` (halving), `O(n)` (linear), `O(n²)` (quadratic).\n\nFor small inputs almost anything works. For **large** inputs, the growth rate decides everything.'
            },
            {
              type: 'choice',
              prompt: 'For `n = 1,000`, which of these step counts is the smallest?',
              options: ['n', 'n²', 'log₂ n'],
              answer: 2,
              explain: '`log₂ 1,000` is about 10, `n` is 1,000, and `n²` is 1,000,000. Logarithmic growth is tiny.'
            },
            {
              type: 'choice',
              prompt: 'Binary search is `O(log n)`. A sorted list grows from 1,000 to 2,000 items.\n\nHow many **extra** checks does the worst case need?',
              options: ['About 1 more', 'Twice as many', 'About 1,000 more'],
              answer: 0,
              explain: 'One extra halving handles a list twice as big. That is the magic of logarithmic growth.'
            },
            {
              type: 'choice',
              prompt: 'Algorithm A takes `100 * n` steps. Algorithm B takes `n * n` steps.\n\nWhich is faster when `n = 1,000`?',
              options: ['B', 'A', 'They tie'],
              answer: 1,
              explain: 'A takes 100,000 steps and B takes 1,000,000. They tie at `n = 100`, and beyond that the slower-growing A always wins.'
            }
          ]
        }
      ]
    }
  ]
}
