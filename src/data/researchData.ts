export interface ResearchDivision {
  id: string;
  code: string;
  name: string;
  shortName: string;
  summary: string;
  focusAreas: string[];
  researchQuestions: string;
}

export interface ResearchDossierTab {
  id: 'overview' | 'problem' | 'methodology' | 'objectives' | 'status';
  label: string;
  heading: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

export interface ApproachStage {
  step: string;
  title: string;
  summary: string;
  deliverables: string[];
}

export interface PublicationItem {
  id: string;
  title: string;
  category: 'paper' | 'report' | 'dataset' | 'experiment';
  authors: string[];
  year: number;
  abstract: string;
  url?: string;
}

export const RESEARCH_DIVISIONS: ResearchDivision[] = [
  {
    id: 'intelligence',
    code: '01',
    name: 'NepMatics Intelligence',
    shortName: 'Intelligence',
    summary:
      'Artificial intelligence, machine learning, reasoning, model architectures and intelligent systems.',
    focusAreas: [
      'Structured reasoning & compositional generalization',
      'Sample-efficient model architectures',
      'Uncertainty calibration in high-stakes inference',
    ],
    researchQuestions:
      'Investigating how compact, structured learning architectures can reason reliably under domain shift and scarce supervision.',
  },
  {
    id: 'vision',
    code: '02',
    name: 'NepMatics Vision',
    shortName: 'Vision',
    summary:
      'Computer vision, satellite imagery, geospatial intelligence and environmental understanding.',
    focusAreas: [
      'Multispectral & temporal Earth observation',
      'Topographic & Himalayan terrain representation',
      'Data-centric curation for remote sensing AI',
    ],
    researchQuestions:
      'Developing representations that preserve physical elevation, seasonal dynamics, and geographic context in satellite imagery.',
  },
  {
    id: 'robotics',
    code: '03',
    name: 'NepMatics Robotics',
    shortName: 'Robotics',
    summary:
      'Robotics, autonomous systems, machine intelligence and automation.',
    focusAreas: [
      'Perception-action loops in unstructured terrain',
      'Robust localization without dense infrastructure',
      'Electromechanical systems & control theory',
    ],
    researchQuestions:
      'Exploring resilient autonomy and mechanical intelligence capable of operating across complex physical environments.',
  },
  {
    id: 'computing',
    code: '04',
    name: 'NepMatics Computing',
    shortName: 'Computing',
    summary:
      'Advanced computing architectures, optimization, computational systems and future technologies.',
    focusAreas: [
      'Hardware-aware numerical optimization',
      'Distributed & edge-constrained computation',
      'Next-generation computational paradigms',
    ],
    researchQuestions:
      'Examining how algorithmic structure and systems architecture co-evolve to reduce energy and memory bottlenecks.',
  },
  {
    id: 'cyber',
    code: '05',
    name: 'NepMatics Cyber',
    shortName: 'Cyber',
    summary:
      'Cybersecurity research, secure systems and privacy-preserving technology.',
    focusAreas: [
      'Verifiable systems & resilient protocol design',
      'Privacy-preserving computation & telemetry',
      'Adversarial robustness in automated infrastructure',
    ],
    researchQuestions:
      'Studying foundational security guarantees for critical digital systems and privacy-sensitive machine learning pipelines.',
  },
  {
    id: 'energy',
    code: '06',
    name: 'NepMatics Energy',
    shortName: 'Energy',
    summary:
      'Intelligent energy systems, hydropower optimization and infrastructure technology.',
    focusAreas: [
      'Hydrological forecasting & dispatch modeling',
      'Grid stability under variable generation',
      'Resilient mountain energy infrastructure',
    ],
    researchQuestions:
      'Applying control theory and predictive modeling to maximize reliability and efficiency in hydropower-anchored grids.',
  },
  {
    id: 'innovations',
    code: '07',
    name: 'NepMatics Innovations',
    shortName: 'Innovations',
    summary:
      'Exploration of new technological concepts, experimental engineering and interdisciplinary inventions.',
    focusAreas: [
      'Cross-disciplinary instrumentation & tooling',
      'Early-stage feasibility studies & prototypes',
      'Unconventional engineering concepts',
    ],
    researchQuestions:
      'Providing an open experimental sandbox for ideas that cross traditional boundaries between software, physics, and hardware.',
  },
];

export const GEOMIND_DOSSIER: ResearchDossierTab[] = [
  {
    id: 'overview',
    label: 'Research Overview',
    heading: 'Data-Centric Geospatial Representation for Complex Terrain',
    paragraphs: [
      'GeoMind × DataForge is an experimental research initiative investigating intelligent training-data quality, geographic context, temporal diversity and data-efficient learning for satellite imagery AI.',
      'Rather than treating orbital imagery as generic natural photographs, the project examines how explicit geospatial metadata, elevation priors, and multi-season sampling shape representation quality when labeled ground truth is limited.',
    ],
    bulletPoints: [
      'Focus domain: Multispectral satellite imagery and geospatial machine learning',
      'Primary lens: Training-corpus composition over brute-force parameter scaling',
      'Target environment: High-relief topography, heterogeneous land cover, and sparse-label regions',
    ],
  },
  {
    id: 'problem',
    label: 'Problem Statement',
    heading: 'Why Conventional Vision Datasets Struggle on Real-World Terrain',
    paragraphs: [
      'Large-scale remote sensing models frequently degrade in mountainous and ecologically diverse geographies where shadows, atmospheric haze, steep elevation gradients, and seasonal snow cover confound standard visual features.',
      'Indiscriminate web-scale or uniform tile sampling introduces redundancy across homogeneous regions while under-representing rare morphological transitions, inflating compute costs without proportional gains in generalization.',
    ],
    bulletPoints: [
      'Geographic bias toward flat, well-mapped urban corridors',
      'Temporal collapse when single-timestamp snapshots replace seasonal trajectories',
      'Lack of principled quality scoring prior to expensive model pretraining',
    ],
  },
  {
    id: 'methodology',
    label: 'Proposed Methodology',
    heading: 'Coupling Geographic Context with Automated Corpus Curation',
    paragraphs: [
      'The proposed architecture pairs GeoMind—a representation framework conditioned on geographic coordinates, elevation derivatives, and seasonal phase—with DataForge, a curation pipeline designed to evaluate tile informativeness prior to training.',
      'DataForge explores stratified spatial-temporal sampling and redundancy pruning so models receive balanced exposure across topography, climate regimes, and spectral conditions.',
    ],
    bulletPoints: [
      'GeoMind: Metadata-aware self-supervised and weakly supervised encoding',
      'DataForge: Spatial-temporal diversity scoring and near-duplicate filtering',
      'Controlled ablation protocol comparing curated subsets against uniform baselines',
    ],
  },
  {
    id: 'objectives',
    label: 'Experimental Objectives',
    heading: 'Testable Hypotheses Under Investigation',
    paragraphs: [
      'All experiments are structured to test falsifiable hypotheses around sample efficiency and cross-region transfer without relying on unverified synthetic claims.',
    ],
    bulletPoints: [
      'Measure downstream segmentation and change-detection stability across high-relief terrain splits',
      'Quantify training-compute savings achievable through DataForge corpus pruning relative to uncurated sampling',
      'Evaluate whether explicit temporal diversity improves resilience to seasonal cloud and illumination shifts',
      'Document reproducible dataset curation criteria and failure modes openly',
    ],
  },
  {
    id: 'status',
    label: 'Progress Status',
    heading: 'Experimental & Under Active Development',
    paragraphs: [
      'GeoMind × DataForge is currently in an early experimental and architectural prototyping stage. Pipeline specifications, data-quality heuristics, and controlled evaluation protocols are actively being engineered.',
      'No benchmark claims or finalized empirical results are published yet; findings will be released only after controlled ablation trials and reproducibility checks are complete.',
    ],
    bulletPoints: [
      'Stage: Experimental formulation & curation pipeline prototyping',
      'Benchmark status: Evaluation splits and baseline protocols under design',
      'Publication horizon: Pending reproducible validation',
    ],
  },
];

export const APPROACH_STAGES: ApproachStage[] = [
  {
    step: '01',
    title: 'Discover',
    summary:
      'Identify foundational technical bottlenecks and high-leverage scientific questions grounded in real-world constraints.',
    deliverables: [
      'Problem framing from first principles',
      'Constraint & physical-reality mapping',
      'Literature & prior-art synthesis',
    ],
  },
  {
    step: '02',
    title: 'Research',
    summary:
      'Formulate clear, falsifiable hypotheses and design mathematical, algorithmic, or architectural frameworks.',
    deliverables: [
      'Formal hypothesis specification',
      'Model & system architecture design',
      'Evaluation & failure-mode criteria',
    ],
  },
  {
    step: '03',
    title: 'Experiment',
    summary:
      'Build controlled prototypes, run disciplined ablation studies, and measure behavior honestly against baselines.',
    deliverables: [
      'Controlled empirical prototypes',
      'Ablation & sensitivity analysis',
      'Reproducibility verification',
    ],
  },
  {
    step: '04',
    title: 'Engineer',
    summary:
      'Translate validated findings into clean, reliable software, hardware, and open technical documentation.',
    deliverables: [
      'Production-grade systems implementation',
      'Performance & reliability hardening',
      'Technical reports & reproducible artifacts',
    ],
  },
];
