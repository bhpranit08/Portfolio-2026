export const experiments = ['WEBGL', 'PHYSICS', 'GENERATIVE', 'AI', 'SHADERS', 'INTERACTION'].map((category, index) => ({
  number: String(index + 1).padStart(2, '0'),
  category,
  title: 'EXPERIMENT PLACEHOLDER',
  description: 'An experiment will be documented here. No live demo is attached yet.',
  status: 'NOT CONNECTED',
  url: null,
}))
