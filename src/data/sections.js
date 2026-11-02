export const sections = {
  about: {
    id: 'about', number: '02', label: 'THE HUMAN', title: 'CURIOUS.\nBY DESIGN.',
    bio: 'I’m Pranit, a self-taught full-stack developer from Kathmandu. I learn by making things: business software, community platforms, and experiments that connect code to the physical world.',
    personal: 'Away from the keyboard, you’ll usually find me mountain biking, hiking, or looking for the next trail.',
    fields: [
      ['BASED IN', 'KATHMANDU, NEPAL'],
      ['APPROACH', 'LEARN → BUILD → REPEAT'],
      ['FOCUS', 'FULL-STACK / AI / INTERACTION'],
      ['BEYOND CODE', 'BIKES, TRAILS & THE OUTDOORS'],
    ],
  },
  work: { id: 'work', number: '03', label: 'SELECTED WORK', title: 'BUILT FROM\nCURIOSITY.', note: 'Five projects. Different problems.\nThe same urge to figure things out.' },
  stack: { id: 'stack', number: '04', label: 'THE TOOLKIT', title: 'WHATEVER\nIT TAKES.', note: 'The tools behind the work.\nChosen for the problem in front of me.' },
  activity: { id: 'activity', number: '05', label: 'THE PRACTICE', title: 'KEEP SHOWING UP.', note: 'A little more, every day.\nMy last year in code.' },
  lab: { id: 'lab', number: '06', label: 'PLAYGROUND', title: 'YOUR TURN\nAT THE CONTROLS.', note: 'Take the machine apart. Put it back together.\nA small experiment in curiosity.' },
  contact: { id: 'contact', number: '07', label: 'NEXT CHAPTER', title: 'LET’S BUILD\nSOMETHING.', note: 'An idea, a question, a good problem.\nI’d like to hear it.' },
}
export const navigation = [{ id: 'hero', number: '01', label: 'THE BEGINNING' }, ...Object.values(sections)]
