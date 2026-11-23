export default {
  id: 'scientific-thinking',
  title: 'Scientific Thinking',
  category: 'science',
  tagline: 'Predict, test, and explain how the world works',
  description: 'Sharpen your intuition for forces and energy, then learn how scientists design fair tests and weigh evidence.',
  icon: '🔬',
  color: '#06b6d4',
  difficulty: 'Beginner',
  isNew: false,
  levels: [
    {
      id: 'l1',
      title: 'Forces & Motion',
      summary: 'Find out what pushes and pulls really do to moving things.',
      lessons: [
        {
          id: 'l1-1',
          title: 'Pushes and Pulls',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Forces change motion',
              body: 'A **force** is a push or a pull, measured in newtons (N). When forces on an object cancel out, they are **balanced** and its motion does not change.\n\nWhen one side wins, the leftover is the **net force**, and the object speeds up, slows down, or turns.'
            },
            {
              type: 'choice',
              prompt: 'In a tug-of-war, the left team pulls with 300 N and the right team pulls with 300 N.\n\nWhat happens to the rope?',
              options: ['It moves left', 'It stays put', 'It moves right'],
              answer: 1,
              explain: 'The pulls are equal and opposite, so they cancel. Balanced forces mean no change in motion.'
            },
            {
              type: 'input',
              prompt: 'Now the left team pulls with 500 N and the right team pulls with 350 N.\n\nWhat is the net force in newtons?',
              answer: 150,
              explain: 'Opposite forces subtract: `500 - 350 = 150` N, toward the left team.'
            },
            {
              type: 'choice',
              prompt: 'A hockey puck glides across perfectly frictionless ice with **no forces** acting along its path.\n\nWhat does it do?',
              options: ['It gradually slows down and stops', 'It speeds up', 'It keeps gliding at the same speed'],
              answer: 2,
              explain: 'Things do not need a force to keep moving. With no net force, a moving object keeps its speed and direction. On Earth, friction is what usually stops things.'
            }
          ]
        },
        {
          id: 'l1-2',
          title: 'Mass and Motion',
          minutes: 6,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Heavier means harder to speed up',
              body: '**Acceleration** is how quickly speed changes. The more **mass** an object has, the harder it is to accelerate.\n\nScientists sum this up as `F = m * a`: the same force gives a big mass a small acceleration.'
            },
            {
              type: 'choice',
              prompt: 'You give the same push to an empty shopping cart and a fully loaded one.\n\nWhich one speeds up faster?',
              options: ['The empty cart', 'The full cart', 'They speed up equally'],
              answer: 0,
              explain: 'Same force, less mass, more acceleration. The loaded cart resists the change in motion more.'
            },
            {
              type: 'input',
              prompt: 'A car travels 120 km in 2 hours.\n\nWhat is its average speed in km per hour?',
              answer: 60,
              explain: 'Speed is distance divided by time: `120 / 2 = 60` km per hour.'
            },
            {
              type: 'choice',
              prompt: 'You drop a bowling ball and a tennis ball from the same height at the same moment. Ignore air resistance.\n\nWhich lands first?',
              options: ['The bowling ball', 'The tennis ball', 'They land together'],
              answer: 2,
              explain: 'Gravity pulls harder on the bowling ball, but the bowling ball is also harder to accelerate. The two effects cancel exactly, so everything falls at the same rate.'
            }
          ]
        }
      ]
    },
    {
      id: 'l2',
      title: 'Energy',
      summary: 'Follow energy as it changes form but never disappears.',
      lessons: [
        {
          id: 'l2-1',
          title: 'Energy Changes Form',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Stored and moving energy',
              body: 'Energy is never created or destroyed. It only **changes form**.\n\nAn object up high has stored **potential energy**. As it falls, that turns into **kinetic energy**, the energy of motion.'
            },
            {
              type: 'choice',
              prompt: 'A roller coaster car sits at the top of the first hill, barely moving.\n\nIts energy is mostly...',
              options: ['Kinetic (motion)', 'Potential (stored)', 'It has no energy'],
              answer: 1,
              explain: 'It is high up but slow, so nearly all of its energy is stored as potential energy, ready to be released.'
            },
            {
              type: 'choice',
              prompt: 'The car rolls down the hill. Where is it moving **fastest**?',
              options: ['At the top', 'Halfway down', 'At the bottom'],
              answer: 2,
              explain: 'At the bottom, the most potential energy has been converted into kinetic energy, so the speed is greatest.'
            },
            {
              type: 'choice',
              prompt: 'The car starts from rest at the top of the first hill and coasts with no motor.\n\nCan it climb over a second hill that is **taller** than the first?',
              options: ['No, it does not have enough energy', 'Yes, if the track is smooth enough', 'Yes, if the car is heavier'],
              answer: 0,
              explain: 'The car can never have more energy than it started with, and reaching a greater height would require more. That is why the first hill of a coaster is the tallest.'
            }
          ]
        },
        {
          id: 'l2-2',
          title: 'Where Does Energy Go?',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Nothing is lost, only spread out',
              body: 'When something slows down, its energy has not vanished. **Friction** turns motion into **heat**, and collisions make heat and sound.\n\nThe total stays the same. It just ends up in forms that are harder to use.'
            },
            {
              type: 'choice',
              prompt: 'You rub your hands together quickly. The energy of motion mostly turns into...',
              options: ['Light', 'Heat', 'Nothing, it disappears'],
              answer: 1,
              explain: 'Friction converts kinetic energy into heat, which is why your hands warm up.'
            },
            {
              type: 'choice',
              prompt: 'A dropped ball bounces a little lower each time. Why?',
              options: ['Gravity gets stronger with each bounce', 'The ball gets heavier', 'Some energy becomes heat and sound on every bounce'],
              answer: 2,
              explain: 'Each impact turns a bit of the ball\'s energy into heat and sound, leaving less to carry it back up.'
            },
            {
              type: 'input',
              prompt: 'A light bulb takes in 10 joules of electrical energy and gives off 2 joules as light. The rest becomes heat.\n\nHow many joules become heat?',
              answer: 8,
              explain: 'Energy in equals energy out: `10 - 2 = 8` joules of heat. That is why bulbs get hot.'
            }
          ]
        }
      ]
    },
    {
      id: 'l3',
      title: 'Experiments & Evidence',
      summary: 'Design fair tests and judge which claims deserve your trust.',
      lessons: [
        {
          id: 'l3-1',
          title: 'Fair Tests',
          minutes: 5,
          xp: 15,
          steps: [
            {
              type: 'info',
              title: 'Change one thing at a time',
              body: 'In a **fair test** you change just **one** thing, measure the result, and keep everything else the same.\n\nThe unchanged group is called the **control**. Without it, you cannot tell what caused the difference.'
            },
            {
              type: 'choice',
              prompt: 'You want to know whether fertilizer helps plants grow. Which setup is a fair test?',
              options: ['A fertilized plant in the sun and an unfertilized plant in the shade', 'Two plants with the same sun, water and soil, and only one gets fertilizer', 'Two plants that both get fertilizer'],
              answer: 1,
              explain: 'Only the fertilizer differs, so any difference in growth can be pinned on it. In the first setup, sunlight could be the real cause.'
            },
            {
              type: 'choice',
              prompt: 'In that experiment, the height of each plant is...',
              options: ['The thing you measure', 'The thing you change on purpose', 'The thing you keep the same'],
              answer: 0,
              explain: 'You change the fertilizer, keep sun, water and soil the same, and measure the height to see the effect.'
            },
            {
              type: 'input',
              prompt: 'One throw can be a fluke, so you repeat. You test 3 paper airplane designs and throw each one 5 times.\n\nHow many throws is that in total?',
              answer: 15,
              explain: '`3 * 5 = 15` throws. Repeating trials and averaging makes lucky or unlucky throws matter less.'
            }
          ]
        },
        {
          id: 'l3-2',
          title: 'Weighing the Evidence',
          minutes: 6,
          xp: 20,
          steps: [
            {
              type: 'info',
              title: 'Together is not the same as because',
              body: 'When two things rise and fall together, that is a **correlation**. It does not prove that one **causes** the other.\n\nOften a hidden third factor drives both. Good scientists look for it before drawing conclusions.'
            },
            {
              type: 'choice',
              prompt: 'In one town, ice cream sales and sunburns go up in the same months.\n\nWhat is the most likely explanation?',
              options: ['Ice cream causes sunburn', 'Sunburn makes people buy ice cream', 'Hot sunny weather increases both'],
              answer: 2,
              explain: 'Sunny weather is the hidden third factor: it sends people outside and makes them want ice cream.'
            },
            {
              type: 'choice',
              prompt: 'An ad claims a bracelet improves your balance. Which evidence is strongest?',
              options: ['A friend says it worked for them', 'A test where people do not know if their bracelet is real or fake', 'The ad shows a person in a lab coat'],
              answer: 1,
              explain: 'If people do not know which bracelet they have, their expectations cannot sway the result. Stories and lab coats are not tests.'
            },
            {
              type: 'choice',
              prompt: 'You predicted that plants grow faster with music. After a careful, fair test, the data shows no difference.\n\nWhat should a good scientist do?',
              options: ['Accept the result and rethink the idea', 'Ignore the data and keep the prediction', 'Repeat it until one run agrees, then report only that run'],
              answer: 0,
              explain: 'Evidence beats expectations. A prediction that fails a fair test is still useful, because it tells you the idea needs revising.'
            }
          ]
        }
      ]
    }
  ]
}
