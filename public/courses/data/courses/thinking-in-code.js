export default {
  id: 'thinking-in-code',
  title: 'Thinking in Code',
  category: 'cs',
  tagline: 'Learn to think like a programmer, one puzzle at a time',
  description: 'Build real programming intuition by tracing tiny programs in your head. No setup, no jargon, just variables, decisions, loops and functions.',
  icon: '💻',
  color: '#3b82f6',
  difficulty: 'Beginner',
  isNew: false,
  levels: [
    {
      id: 'l1',
      title: 'Variables & Steps',
      summary: 'See how programs remember values and run one line at a time.',
      lessons: [
        {
          id: 'l1-1',
          title: 'Boxes With Names',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'A variable is a labeled box',
              body: 'A **variable** is a named box that holds one value. Writing `score = 5` means: put `5` in the box called `score`.\n\nPutting in a new value **replaces** the old one. The box only remembers the latest thing you stored.'
            },
            {
              type: 'choice',
              prompt: 'A program runs `x = 3` and then `x = 7`.\n\nWhat is in `x` now?',
              options: ['3', '7', '10'],
              answer: 1,
              explain: 'The second line replaces the old value. A box holds only its most recent value, so `x` is `7`.'
            },
            {
              type: 'choice',
              prompt: 'Three lines run in order: `a = 4`, then `b = a`, then `a = 9`.\n\nWhat is in `b`?',
              options: ['4', '9', '13'],
              answer: 0,
              explain: '`b = a` copies the value that `a` held at that moment, which was `4`. Changing `a` later does not reach back and change `b`.'
            },
            {
              type: 'input',
              prompt: 'A program runs `n = 10` and then `n = n + 5`.\n\nWhat number is in `n`?',
              answer: 15,
              explain: 'The right side is worked out first: `10 + 5` is `15`. Then that result is stored back into `n`.'
            }
          ]
        },
        {
          id: 'l1-2',
          title: 'One Step at a Time',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Order matters',
              body: 'A computer runs your lines **top to bottom, one at a time**. It never peeks ahead and never guesses what you meant.\n\nTo predict a program, play computer: track each box after every line.'
            },
            {
              type: 'choice',
              prompt: 'Trace it: `x = 2`, then `x = x * 3`, then `x = x + 1`.\n\nWhat is `x` at the end?',
              options: ['6', '9', '7', '8'],
              answer: 2,
              explain: '`x` starts at `2`, becomes `6` after multiplying by 3, then `7` after adding 1.'
            },
            {
              type: 'choice',
              prompt: 'You want to swap two boxes. Starting with `a = 1` and `b = 2`, you run `a = b` and then `b = a`.\n\nWhat do you end up with?',
              options: ['a is 2, b is 1', 'a is 2, b is 2', 'a is 1, b is 1'],
              answer: 1,
              explain: 'After `a = b`, both boxes hold `2` and the original `1` is gone. So `b = a` just stores `2` again.'
            },
            {
              type: 'choice',
              prompt: 'How can you fix the swap so no value gets lost?',
              options: ['Run `a = b` twice', 'It is impossible to swap two variables', 'Save `a` in a spare variable first'],
              answer: 2,
              explain: 'Use a third box: `temp = a`, then `a = b`, then `b = temp`. The spare box keeps the old value safe.'
            }
          ]
        }
      ]
    },
    {
      id: 'l2',
      title: 'Decisions & Loops',
      summary: 'Teach programs to choose a path and to repeat work.',
      lessons: [
        {
          id: 'l2-1',
          title: 'Forks in the Road',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'If this, then that',
              body: 'An **if** statement asks a yes/no question. If the answer is yes, the code inside runs. If not, it is skipped.\n\nAdd an **else** to say what happens when the answer is no. Exactly one of the two paths runs.'
            },
            {
              type: 'choice',
              prompt: 'With `temp = 12`, the program says: if `temp < 15` then `wear = coat`, else `wear = tshirt`.\n\nWhat is `wear`?',
              options: ['coat', 'tshirt', 'both'],
              answer: 0,
              explain: '`12 < 15` is true, so the first path runs and the else path is skipped.'
            },
            {
              type: 'choice',
              prompt: 'Start with `x = 10`. The same line runs twice in a row: if `x > 5` then `x = x - 5`.\n\nWhat is `x` at the end?',
              options: ['0', '10', '5'],
              answer: 2,
              explain: 'First time: `10 > 5` is true, so `x` becomes `5`. Second time: `5 > 5` is false, so nothing happens.'
            },
            {
              type: 'input',
              prompt: 'With `age = 18`, the program says: if `age >= 18` print `adult`, else print `minor`.\n\nWhich word is printed?',
              answer: 'adult',
              explain: '`>=` means greater than **or equal to**. Since `18 >= 18` is true, it prints `adult`.'
            }
          ]
        },
        {
          id: 'l2-2',
          title: 'Round and Round',
          minutes: 6,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Loops repeat work',
              body: 'A **loop** runs the same lines again and again. Some loops repeat a fixed number of times. A **while** loop repeats as long as its condition stays true.\n\nThe trick to tracing a loop: write down the variables after every pass.'
            },
            {
              type: 'choice',
              prompt: 'Start with `total = 0`. Repeat 4 times: `total = total + 3`.\n\nWhat is `total` afterwards?',
              options: ['7', '12', '3', '43'],
              answer: 1,
              explain: 'Each pass adds 3: 3, 6, 9, 12. Four passes of 3 is `4 * 3 = 12`.'
            },
            {
              type: 'input',
              prompt: 'Start with `x = 1`. Repeat 5 times: `x = x * 2`.\n\nWhat number is `x` afterwards?',
              answer: 32,
              explain: 'Doubling five times gives 2, 4, 8, 16, 32. Repeated doubling grows fast!'
            },
            {
              type: 'choice',
              prompt: 'Start with `n = 10`. While `n > 0`, run `n = n - 3`.\n\nHow many times does the loop body run?',
              options: ['5', '3', '4'],
              answer: 2,
              explain: '`n` goes 10, 7, 4, 1, then -2. The check passes for 10, 7, 4 and 1, so the body runs 4 times before `-2 > 0` fails.'
            }
          ]
        }
      ]
    },
    {
      id: 'l3',
      title: 'Functions',
      summary: 'Package steps into reusable recipes and combine them.',
      lessons: [
        {
          id: 'l3-1',
          title: 'Reusable Recipes',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Name it once, use it anywhere',
              body: 'A **function** is a named recipe. You hand it inputs, it follows its steps, and it **returns** a result.\n\nIf `double(n)` returns `n * 2`, then `double(5)` gives `10`. You can use that result anywhere a number fits.'
            },
            {
              type: 'choice',
              prompt: '`double(n)` returns `n * 2`.\n\nWhat is `double(double(3))`?',
              options: ['6', '9', '12'],
              answer: 2,
              explain: 'Work from the inside out: `double(3)` is `6`, and `double(6)` is `12`.'
            },
            {
              type: 'choice',
              prompt: '`add(a, b)` returns `a + b`.\n\nWhat is `add(2, add(3, 4))`?',
              options: ['9', '7', '24'],
              answer: 0,
              explain: 'The inner call runs first: `add(3, 4)` is `7`. Then `add(2, 7)` is `9`.'
            },
            {
              type: 'input',
              prompt: '`square(n)` returns `n * n`.\n\nWhat number is `square(4) + 1`?',
              answer: 17,
              explain: '`square(4)` is `16`, and adding 1 gives `17`.'
            }
          ]
        },
        {
          id: 'l3-2',
          title: 'Breaking Problems Down',
          minutes: 6,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Small pieces, big results',
              body: 'Programmers solve big problems by splitting them into **small functions** that each do one job, then snapping them together.\n\nWhen functions are chained, the **order** you apply them in can change the answer.'
            },
            {
              type: 'choice',
              prompt: '`isEven(n)` returns `true` when `n` divides evenly by 2.\n\nFor how many of the numbers 1, 2, 3, 4, 5, 6 does it return `true`?',
              options: ['2', '3', '6'],
              answer: 1,
              explain: 'It is true for 2, 4 and 6. That is 3 numbers.'
            },
            {
              type: 'choice',
              prompt: 'Your program calculates sales tax in 20 different places. Why put that calculation in one function?',
              options: ['If the tax rule changes, you fix it in one place', 'Functions make every program run faster', 'The computer cannot do math outside a function'],
              answer: 0,
              explain: 'Write it once, reuse it everywhere. One fix updates all 20 places, and there is no risk of missing one.'
            },
            {
              type: 'choice',
              prompt: '`f(x)` returns `x + 1` and `g(x)` returns `x * 2`.\n\nWhat is `g(f(3))`?',
              options: ['7', '6', '8'],
              answer: 2,
              explain: 'Inside first: `f(3)` is `4`, then `g(4)` is `8`. Flip the order and `f(g(3))` gives `7` instead, so order matters.'
            }
          ]
        }
      ]
    }
  ]
}
