import Section from '../components/Section.jsx'
import ContributionGraph from '../components/ContributionGraph.jsx'
import { sections } from '../data/sections.js'
import { contributionYear, contributions } from '../data/contributions.js'

export default function Activity() {
  return <Section {...sections.activity}><ContributionGraph year={contributionYear} contributions={contributions} /></Section>
}
