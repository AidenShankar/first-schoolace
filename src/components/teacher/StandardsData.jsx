export const STANDARDS_DATA = {
  "NGSS (Science)": {
    "MS-LS1": [
      { code: "MS-LS1-1", description: "Conduct an investigation to provide evidence that living things are made of cells; either one cell or many different numbers and types of cells." },
      { code: "MS-LS1-2", description: "Develop and use a model to describe the function of a cell as a whole and ways parts of cells contribute to the function." },
      { code: "MS-LS1-3", description: "Use argument supported by evidence for how the body is a system of interacting subsystems composed of groups of cells." },
      { code: "MS-LS1-4", description: "Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction of animals and plants respectively." },
      { code: "MS-LS1-5", description: "Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms." },
      { code: "MS-LS1-6", description: "Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy into and out of organisms." },
      { code: "MS-LS1-7", description: "Develop a model to describe how food is rearranged through chemical reactions forming new molecules that support growth and/or release energy as this matter moves through an organism." },
      { code: "MS-LS1-8", description: "Gather and synthesize information that sensory receptors respond to stimuli by sending messages to the brain for immediate behavior or storage as memories." }
    ],
    "MS-LS2": [
      { code: "MS-LS2-1", description: "Analyze and interpret data to provide evidence for the effects of resource availability on organisms and populations of organisms in an ecosystem." },
      { code: "MS-LS2-2", description: "Construct an explanation that predicts patterns of interactions among organisms across multiple ecosystems." },
      { code: "MS-LS2-3", description: "Develop a model to describe the cycling of matter and flow of energy among living and nonliving parts of an ecosystem." },
      { code: "MS-LS2-4", description: "Construct an argument supported by empirical evidence that changes to physical or biological components of an ecosystem affect populations." },
      { code: "MS-LS2-5", description: "Evaluate competing design solutions for maintaining biodiversity and ecosystem services." }
    ],
    "MS-LS3": [
      { code: "MS-LS3-1", description: "Develop and use a model to describe why structural changes to genes (mutations) located on chromosomes may affect proteins and may result in harmful, beneficial, or neutral effects to the structure and function of the organism." },
      { code: "MS-LS3-2", description: "Develop and use a model to describe why asexual reproduction results in offspring with identical genetic information and sexual reproduction results in offspring with genetic variation." }
    ],
    "MS-LS4": [
      { code: "MS-LS4-1", description: "Analyze and interpret data for patterns in the fossil record that document the existence, diversity, extinction, and change of life forms throughout the history of life on Earth under the assumption that natural laws operate today as in the past." },
      { code: "MS-LS4-2", description: "Apply scientific ideas to construct an explanation for the anatomical similarities and differences among modern organisms and between modern and fossil organisms to infer evolutionary relationships." },
      { code: "MS-LS4-3", description: "Analyze displays of pictorial data to compare patterns of similarities in the embryological development across multiple species to identify relationships not evident in the fully formed anatomy." },
      { code: "MS-LS4-4", description: "Construct an explanation based on evidence that describes how genetic variations of traits in a population increase some individuals’ probability of surviving and reproducing in a specific environment." },
      { code: "MS-LS4-5", description: "Gather and synthesize information about the technologies that have changed the way humans influence the inheritance of desired traits in organisms." },
      { code: "MS-LS4-6", description: "Use mathematical representations to support explanations of how natural selection may lead to increases and decreases of specific traits in populations over time." }
    ]
  }
};

export const getStandardDescription = (standardSet, code) => {
  const set = STANDARDS_DATA[standardSet];
  if (!set) return null;
  
  // Search through all categories (MS-LS1, MS-LS2, etc)
  for (const category in set) {
    const found = set[category].find(s => s.code === code);
    if (found) return found.description;
  }
  return null;
};