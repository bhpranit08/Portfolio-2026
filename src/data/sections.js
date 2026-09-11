export const sections = {
  // About copy is intentionally placeholder content; replace these values together.
  about: {
    id: 'about', number: '02', label: 'ABOUT', title: 'I DESIGN.\nI BUILD.\nI SHIP.',
    fields: [
      ['NAME', '[YOUR NAME]'],
      ['ROLE', 'INDEPENDENT DEVELOPER'],
      ['LOCATION', 'NEPAL'],
      ['FOCUS', 'PRODUCT / SYSTEMS / WEB'],
      ['CURRENTLY', 'BUILDING THINGS'],
      ['STATUS', 'AVAILABLE'],
    ],
  },
  activity: { id: 'activity', number: '03', label: 'ACTIVITY', title: 'DAYS I CODE', note: 'Small inputs. A daily practice.\nOne year at a time.' },
  work: { id: 'work', number: '04', label: 'WORK', title: 'SELECTED\nOUTPUT.', note: 'Ideas, made tangible.\nProject records / placeholders.' },
  stack: { id: 'stack', number: '05', label: 'STACK', title: 'TOOLS OF\nTHE TRADE.', note: 'Different tools. One intent.\nAn editable technology index.' },
  lab: { id: 'lab', number: '06', label: 'LAB', title: 'ROOM FOR THE\nUNFINISHED.', note: 'A place to ask: what if?\nExperimental records / placeholders.' },
  contact: { id: 'contact', number: '07', label: 'CONTACT', title: 'SYSTEM\nCOMPLETE.', note: 'READY TO BUILD?' },
}

export const navigation = [{ id: 'hero', number: '01', label: 'HERO' }, ...Object.values(sections)]
