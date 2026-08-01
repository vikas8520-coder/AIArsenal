/**
 * Architecture Analyzer — detects topology issues and suggests corrected architectures.
 * Uses tool compatibility matrix and pattern recognition.
 */

// Tool categories that define architectural roles
export const ARCH_ROLES = {
  // Orchestration layer - the brain
  ORCHESTRATOR: ['LangChain', 'LangGraph', 'AutoGen', 'CrewAI', 'Semantic Kernel', 'OpenClaw', 'Khoj', 'aidaemon'],
  
  // LLM Serving - parallel alternatives
  LLM_SERVING_DEV: ['Ollama', 'LM Studio', 'Jan', 'GPT4All', 'KoboldCPP', 'Llama.cpp', 'ExLlamaV2'],
  LLM_SERVING_PROD: ['vLLM', 'TGI', 'TensorRT-LLM', 'SGLang'],
  LLM_API: ['OpenAI API', 'Anthropic API', 'Google Gemini API', 'Groq', 'Together AI', 'Fireworks AI', 'DeepSeek API', 'Mistral API', 'Cohere API', 'AI21 API'],
  
  // Voice/Audio processing - input processors
  SPEECH_TO_TEXT: ['Whisper', 'Whisper.cpp', 'Faster-Whisper', 'Distil-Whisper', 'Deepgram', 'AssemblyAI', 'Google Speech-to-Text', 'Azure Speech', 'AWS Transcribe'],
  TEXT_TO_SPEECH: ['ElevenLabs', 'Coqui TTS', 'Piper', 'Bark', 'Tortoise TTS', 'StyleTTS2', 'Azure TTS', 'Google TTS', 'AWS Polly'],
  
  // Backend/Storage - persistence layer
  BACKEND_DB: ['PocketBase', 'Supabase', 'Appwrite', 'Firebase', 'PlanetScale', 'Neon', 'Turso', 'SQLite', 'PostgreSQL', 'MySQL'],
  VECTOR_DB: ['Pinecone', 'Weaviate', 'Chroma', 'Qdrant', 'Milvus', 'LanceDB', 'pgvector', 'Vespa', 'Elasticsearch', 'Redis', 'FAISS'],
  CACHE: ['Redis', 'Valkey', 'Dragonfly', 'Memcached', 'Upstash', 'GPTCache'],
  
  // Orchestration/Automation - workflow engines
  WORKFLOW_ENGINE: ['n8n', 'Activepieces', 'Zapier', 'Make', 'Windmill', 'Prefect', 'Airflow', 'Temporal', 'Dagster'],
  AGENT_FRAMEWORK: ['LangChain', 'LangGraph', 'AutoGen', 'CrewAI', 'Semantic Kernel', 'OpenClaw', 'Khoj', 'aidaemon'],
  
  // Observability
  MONITORING: ['Sentry', 'Datadog', 'New Relic', 'LogRocket', 'PostHog', 'Grafana', 'Prometheus', 'LangSmith', 'Weights & Biases', 'MLflow', 'ClearML', 'Comet', 'Neptune'],
  
  // Frontend/UI
  FRONTEND_FRAMEWORK: ['Next.js', 'React', 'Vue', 'Svelte', 'Remix', 'Astro', 'Vite', 'Nuxt'],
  UI_COMPONENTS: ['Tailwind CSS', 'shadcn/ui', 'Radix UI', 'Headless UI', 'MUI', 'Chakra UI', 'Ant Design'],
  
  // Infrastructure
  HOSTING: ['Vercel', 'Netlify', 'Railway', 'Render', 'Fly.io', 'Cloudflare Pages', 'AWS', 'GCP', 'Azure', 'DigitalOcean', 'Hetzner', 'Linode'],
  CONTAINER: ['Docker', 'Kubernetes', 'Coolify', 'CapRover', 'Dokku'],
  
  // AI/ML Libraries
  ML_FRAMEWORK: ['PyTorch', 'TensorFlow', 'JAX', 'Hugging Face Transformers', 'Sentence Transformers', 'LlamaIndex', 'LangChain'],
  TRAINING: ['Axolotl', 'LLaMA-Factory', 'Unsloth', 'DeepSpeed', 'FSDP', 'LoRA', 'QLoRA'],
  
  // Data/Ingestion
  SCRAPING: ['Firecrawl', 'Tavily', 'Bright Data', 'Apify', 'Scrapy', 'Playwright', 'Puppeteer'],
  ETL: ['Airbyte', 'Fivetran', 'Stitch', 'Dagster', 'Prefect'],
};

// Compatibility rules: source role → allowed target roles
export const COMPATIBILITY = {
  // Orchestrators can call anything
  ORCHESTRATOR: ['LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API', 'SPEECH_TO_TEXT', 'TEXT_TO_SPEECH', 'BACKEND_DB', 'VECTOR_DB', 'CACHE', 'WORKFLOW_ENGINE', 'SCRAPING', 'MONITORING', 'ML_FRAMEWORK'],
  
  // LLM serving is called BY orchestrators, calls vector DBs for RAG
  LLM_SERVING_DEV: ['VECTOR_DB', 'CACHE', 'MONITORING'],
  LLM_SERVING_PROD: ['VECTOR_DB', 'CACHE', 'MONITORING'],
  LLM_API: ['VECTOR_DB', 'CACHE', 'MONITORING'],
  
  // Speech-to-text feeds INTO orchestrators/LLMs
  SPEECH_TO_TEXT: ['ORCHESTRATOR', 'LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API', 'BACKEND_DB'],
  TEXT_TO_SPEECH: ['ORCHESTRATOR', 'BACKEND_DB'],
  
  // Backends store everything
  BACKEND_DB: ['VECTOR_DB', 'CACHE', 'MONITORING'],
  VECTOR_DB: ['MONITORING'],
  CACHE: ['MONITORING'],
  
  // Workflow engines orchestrate everything
  WORKFLOW_ENGINE: ['ORCHESTRATOR', 'LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API', 'SPEECH_TO_TEXT', 'TEXT_TO_SPEECH', 'BACKEND_DB', 'VECTOR_DB', 'CACHE', 'SCRAPING', 'MONITORING', 'HOSTING'],
  AGENT_FRAMEWORK: ['LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API', 'SPEECH_TO_TEXT', 'TEXT_TO_SPEECH', 'BACKEND_DB', 'VECTOR_DB', 'CACHE', 'SCRAPING', 'MONITORING', 'ML_FRAMEWORK'],
  
  // Scraping feeds into vector DBs and backends
  SCRAPING: ['VECTOR_DB', 'BACKEND_DB', 'ORCHESTRATOR'],
  
  // Frontend calls backends/APIs
  FRONTEND_FRAMEWORK: ['BACKEND_DB', 'LLM_API', 'ORCHESTRATOR', 'WORKFLOW_ENGINE', 'HOSTING'],
  UI_COMPONENTS: ['FRONTEND_FRAMEWORK'],
  
  // Infrastructure hosts everything
  HOSTING: ['CONTAINER', 'BACKEND_DB', 'VECTOR_DB', 'CACHE', 'MONITORING'],
  CONTAINER: ['HOSTING'],
  
  // Monitoring observes everything
  MONITORING: [],
};

// Anti-patterns to detect
export const ANTI_PATTERNS = [
  {
    id: 'SERIAL_LLM_CHAIN',
    name: 'Serial LLM Chain',
    description: 'Multiple LLM serving tools chained in sequence',
    detect: (edges, nodeRoles) => {
      const llmRoles = ['LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API'];
      for (const edge of edges) {
        const sourceRole = nodeRoles[edge.source];
        const targetRole = nodeRoles[edge.target];
        if (llmRoles.includes(sourceRole) && llmRoles.includes(targetRole)) {
          return { source: edge.source, target: edge.target };
        }
      }
      return null;
    },
    fix: 'LLM serving tools are parallel alternatives (dev vs prod vs API). Pick one per environment, don\'t chain them.',
  },
  {
    id: 'ORCHESTRATOR_AT_END',
    name: 'Orchestrator at Pipeline End',
    description: 'Orchestration framework placed downstream instead of as hub',
    detect: (edges, nodeRoles) => {
      const orchestratorNodes = Object.keys(nodeRoles).filter(n => nodeRoles[n] === 'ORCHESTRATOR' || nodeRoles[n] === 'AGENT_FRAMEWORK');
      for (const node of orchestratorNodes) {
        // Check if it has incoming edges but no outgoing edges (sink)
        const incoming = edges.filter(e => e.target === node);
        const outgoing = edges.filter(e => e.source === node);
        if (incoming.length > 0 && outgoing.length === 0) {
          return { node };
        }
      }
      return null;
    },
    fix: 'Orchestrators (LangChain, LangGraph, etc.) should be the central hub calling other tools, not a downstream consumer.',
  },
  {
    id: 'INPUT_PROCESSOR_DOWNSTREAM',
    name: 'Input Processor Downstream of Storage',
    description: 'Speech-to-text or scrapers placed after database',
    detect: (edges, nodeRoles) => {
      const inputRoles = ['SPEECH_TO_TEXT', 'SCRAPING'];
      for (const edge of edges) {
        const sourceRole = nodeRoles[edge.source];
        const targetRole = nodeRoles[edge.target];
        if (inputRoles.includes(targetRole) && ['BACKEND_DB', 'VECTOR_DB'].includes(sourceRole)) {
          return { source: edge.source, target: edge.target };
        }
      }
      return null;
    },
    fix: 'Input processors (Whisper, scrapers) should feed INTO the pipeline, not receive data from storage.',
  },
  {
    id: 'MISSING_PERSISTENCE',
    name: 'No Persistence Layer',
    description: 'Pipeline has no database/backend for storage',
    detect: (edges, nodeRoles) => {
      const hasBackend = Object.values(nodeRoles).some(r => ['BACKEND_DB', 'VECTOR_DB'].includes(r));
      const hasLlmOrOrchestrator = Object.values(nodeRoles).some(r => ['ORCHESTRATOR', 'AGENT_FRAMEWORK', 'LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API'].includes(r));
      if (hasLlmOrOrchestrator && !hasBackend) {
        return { missing: 'BACKEND_DB' };
      }
      return null;
    },
    fix: 'Add a backend (PocketBase, Supabase, Appwrite) or vector DB (Chroma, Pinecone) for persistence.',
  },
  {
    id: 'MISSING_OBSERVABILITY',
    name: 'No Observability',
    description: 'Production pipeline without monitoring',
    detect: (edges, nodeRoles) => {
      const hasProd = Object.values(nodeRoles).some(r => ['LLM_SERVING_PROD', 'HOSTING'].includes(r));
      const hasMonitoring = Object.values(nodeRoles).some(r => r === 'MONITORING');
      if (hasProd && !hasMonitoring) {
        return { missing: 'MONITORING' };
      }
      return null;
    },
    fix: 'Add monitoring (Sentry, LangSmith, Grafana) for production workloads.',
  },
];

// Map tool names to architectural roles
function getToolRole(toolName, toolCategory, toolSubcategory) {
  for (const [role, tools] of Object.entries(ARCH_ROLES)) {
    if (tools.some(t => t.toLowerCase() === toolName.toLowerCase())) {
      return role;
    }
  }
  // Fallback: infer from category
  const categoryMap = {
    'Agent Frameworks': 'AGENT_FRAMEWORK',
    'Workflow Automation': 'WORKFLOW_ENGINE',
    'APIs & Inference': 'LLM_API',
    'Free Compute & GPUs': 'HOSTING',
    'Coding Assistants': 'LLM_SERVING_DEV',
    'Chatbots': 'LLM_API',
    'Image Generation': 'ML_FRAMEWORK',
    'Video Generation': 'ML_FRAMEWORK',
    'Music Generation': 'ML_FRAMEWORK',
    'Large Language Models': 'LLM_SERVING_DEV',
    'Image & Audio': 'ML_FRAMEWORK',
    'Free Courses': 'ML_FRAMEWORK',
    'Research Papers': 'ML_FRAMEWORK',
    'Datasets & Benchmarks': 'ML_FRAMEWORK',
    'Data & Intelligence APIs': 'SCRAPING',
    'Educational Tools': 'ML_FRAMEWORK',
    'Analytics & BI': 'MONITORING',
    'CRM & Marketing': 'BACKEND_DB',
    'Customer Service': 'WORKFLOW_ENGINE',
    'AI Service Platforms': 'ORCHESTRATOR',
    'Token Economy': 'LLM_API',
    'AI Income': 'LLM_API',
    'Cost Optimization': 'MONITORING',
    'Personal AI': 'ORCHESTRATOR',
    'CLI Tools': 'LLM_SERVING_DEV',
    'MCP Servers': 'ORCHESTRATOR',
    'Git Repos': 'LLM_SERVING_DEV',
    'Open-Source Models': 'LLM_SERVING_DEV',
    'End-User Tools': 'LLM_API',
    'Creative AI': 'ML_FRAMEWORK',
    'Infrastructure': 'HOSTING',
    'Research & ED': 'ML_FRAMEWORK',
    'Agents & Auto': 'AGENT_FRAMEWORK',
    'Business AI': 'ORCHESTRATOR',
    'Safety & Ethics': 'MONITORING',
    'Developer Tools': 'LLM_SERVING_DEV',
  };
  return categoryMap[toolCategory] || 'UNKNOWN';
}

/**
 * Analyze canvas topology and return issues + corrected architecture
 */
export function analyzeArchitecture(nodes, edges) {
  // Build node role map
  const nodeRoles = {};
  for (const node of nodes) {
    if (node.type === 'tool' && node.data?.label) {
      nodeRoles[node.id] = getToolRole(
        node.data.label,
        node.data.category,
        node.data.subcategory
      );
    } else if (['trigger', 'condition', 'action', 'output'].includes(node.type)) {
      // Flow control nodes
      const flowMap = { trigger: 'WORKFLOW_ENGINE', condition: 'ORCHESTRATOR', action: 'WORKFLOW_ENGINE', output: 'BACKEND_DB' };
      nodeRoles[node.id] = flowMap[node.type] || 'UNKNOWN';
    } else {
      nodeRoles[node.id] = 'UNKNOWN';
    }
  }

  // Detect anti-patterns
  const issues = [];
  for (const pattern of ANTI_PATTERNS) {
    const match = pattern.detect(edges, nodeRoles);
    if (match) {
      issues.push({ ...pattern, match });
    }
  }

  // Generate corrected architecture
  const corrected = generateCorrectedArchitecture(nodes, edges, nodeRoles, issues);

  return {
    nodeRoles,
    issues,
    corrected,
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      issueCount: issues.length,
      hasOrchestrator: Object.values(nodeRoles).some(r => ['ORCHESTRATOR', 'AGENT_FRAMEWORK'].includes(r)),
      hasPersistence: Object.values(nodeRoles).some(r => ['BACKEND_DB', 'VECTOR_DB'].includes(r)),
      hasMonitoring: Object.values(nodeRoles).some(r => r === 'MONITORING'),
    },
  };
}

/**
 * Generate corrected architecture based on detected issues
 */
function generateCorrectedArchitecture(nodes, edges, nodeRoles, issues) {
  const presentRoles = new Set(Object.values(nodeRoles).filter(r => r !== 'UNKNOWN'));
  
  // Determine what type of app this is
  const appType = detectAppType(nodes, nodeRoles);
  
  // Base layers that should exist
  const layers = [];
  
  // Layer 1: Orchestration (always recommended)
  if (presentRoles.has('ORCHESTRATOR') || presentRoles.has('AGENT_FRAMEWORK') || presentRoles.has('WORKFLOW_ENGINE')) {
    layers.push({
      name: 'Orchestration',
      role: 'ORCHESTRATOR',
      tools: getRecommendedTools('ORCHESTRATOR', presentRoles),
      description: 'Central brain — calls LLMs, tools, stores results',
    });
  } else if (presentRoles.has('LLM_SERVING_DEV') || presentRoles.has('LLM_SERVING_PROD') || presentRoles.has('LLM_API')) {
    layers.push({
      name: 'Orchestration (recommended)',
      role: 'ORCHESTRATOR',
      tools: ['LangGraph', 'LangChain', 'Custom Python'],
      description: 'Add an orchestration layer to coordinate your stack',
    });
  }
  
  // Layer 2: LLM Serving (parallel)
  const llmRoles = ['LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API'].filter(r => presentRoles.has(r));
  if (llmRoles.length > 0) {
    layers.push({
      name: 'LLM Serving',
      roles: llmRoles,
      tools: llmRoles.flatMap(r => getRecommendedTools(r, presentRoles)),
      description: 'Parallel alternatives — pick one per environment',
      parallel: true,
    });
  }
  
  // Layer 3: Input Processors
  const inputRoles = ['SPEECH_TO_TEXT', 'TEXT_TO_SPEECH', 'SCRAPING'].filter(r => presentRoles.has(r));
  if (inputRoles.length > 0) {
    layers.push({
      name: 'Input Processing',
      roles: inputRoles,
      tools: inputRoles.flatMap(r => getRecommendedTools(r, presentRoles)),
      description: 'Feed INTO the pipeline (audio→text, web→data)',
    });
  }
  
  // Layer 4: Memory/RAG
  if (presentRoles.has('VECTOR_DB')) {
    layers.push({
      name: 'Vector Memory (RAG)',
      role: 'VECTOR_DB',
      tools: getRecommendedTools('VECTOR_DB', presentRoles),
      description: 'Semantic search and context retrieval',
    });
  }
  
  // Layer 5: Persistence
  const persistenceRoles = ['BACKEND_DB', 'VECTOR_DB'].filter(r => presentRoles.has(r));
  if (persistenceRoles.length > 0) {
    layers.push({
      name: 'Persistence',
      roles: persistenceRoles,
      tools: persistenceRoles.flatMap(r => getRecommendedTools(r, presentRoles)),
      description: 'Storage, auth, realtime — everything writes here',
    });
  } else {
    // Recommend persistence
    layers.push({
      name: 'Persistence (recommended)',
      role: 'BACKEND_DB',
      tools: ['PocketBase', 'Supabase', 'Appwrite'],
      description: 'Add a backend for storage, auth, and realtime',
      recommended: true,
    });
  }
  
  // Layer 6: Observability
  if (presentRoles.has('MONITORING')) {
    layers.push({
      name: 'Observability',
      role: 'MONITORING',
      tools: getRecommendedTools('MONITORING', presentRoles),
      description: 'Monitoring, tracing, debugging',
    });
  } else if (presentRoles.has('LLM_SERVING_PROD') || presentRoles.has('HOSTING')) {
    layers.push({
      name: 'Observability (recommended)',
      role: 'MONITORING',
      tools: ['Sentry', 'LangSmith', 'Grafana'],
      description: 'Add monitoring for production workloads',
      recommended: true,
    });
  }
  
  // Generate Mermaid diagram
  const mermaid = generateMermaid(layers);
  
  return {
    appType,
    layers,
    mermaid,
    recommendations: generateRecommendations(issues, layers),
  };
}

function detectAppType(nodes, nodeRoles) {
  const roles = Object.values(nodeRoles);
  if (roles.includes('SPEECH_TO_TEXT') && roles.includes('LLM_SERVING_DEV')) return 'Voice LLM App';
  if (roles.includes('AGENT_FRAMEWORK') && roles.includes('WORKFLOW_ENGINE')) return 'Agent/Automation Platform';
  if (roles.includes('VECTOR_DB') && roles.includes('SCRAPING')) return 'RAG Knowledge Base';
  if (roles.includes('LLM_SERVING_DEV') && roles.includes('BACKEND_DB')) return 'LLM App with Backend';
  if (roles.includes('LLM_API') && roles.includes('FRONTEND_FRAMEWORK')) return 'Frontend LLM App';
  return 'Custom AI Stack';
}

function getRecommendedTools(role, presentRoles) {
  const roleTools = ARCH_ROLES[role] || [];
  // Prefer tools already on canvas, then add recommendations
  const onCanvas = roleTools.filter(t => presentRoles.has(getToolRole(t)));
  const recommended = roleTools.filter(t => !presentRoles.has(getToolRole(t))).slice(0, 3);
  return [...onCanvas, ...recommended];
}
// Generate Mermaid diagram - hub-and-spoke from orchestrator
function generateMermaid(layers) {
  let mermaid = 'graph TD\n';
  let nodeId = 0;
  
  // Find the orchestrator layer (first layer with ORCHESTRATOR role or parallel LLM)
  const orchestratorLayer = layers.find(l => 
    l.role === 'ORCHESTRATOR' || 
    l.roles?.includes('ORCHESTRATOR') || 
    l.name.includes('Orchestration')
  );
  
  // Find persistence layer
  const persistenceLayer = layers.find(l => 
    l.roles?.includes('BACKEND_DB') || 
    l.roles?.includes('VECTOR_DB') ||
    l.name.includes('Persistence')
  );
  
  // Find LLM serving layer
  const llmLayer = layers.find(l => 
    l.parallel === true ||
    l.roles?.some(r => ['LLM_SERVING_DEV', 'LLM_SERVING_PROD', 'LLM_API'].includes(r))
  );
  
  // Find input layer
  const inputLayer = layers.find(l => 
    l.roles?.some(r => ['SPEECH_TO_TEXT', 'SCRAPING', 'TEXT_TO_SPEECH'].includes(r))
  );
  
  // Find observability layer
  const obsLayer = layers.find(l => 
    l.roles?.includes('MONITORING') ||
    l.name.includes('Observability')
  );
  
  // Build nodes by layer
  const layerNodeIds = {};
  
  // Orchestrator (center)
  if (orchestratorLayer) {
    const tools = orchestratorLayer.tools || [];
    layerNodeIds.orchestrator = [];
    mermaid += `  subgraph "${orchestratorLayer.name}"\n`;
    for (const tool of tools) {
      const id = `n${nodeId++}`;
      mermaid += `    ${id}["${tool}"]\n`;
      layerNodeIds.orchestrator.push(id);
    }
    mermaid += `  end\n`;
  }
  
  // LLM Serving (parallel - left of orchestrator)
  if (llmLayer) {
    const tools = llmLayer.tools || [];
    layerNodeIds.llm = [];
    mermaid += `  subgraph "${llmLayer.name}"\n`;
    for (const tool of tools) {
      const id = `n${nodeId++}`;
      mermaid += `    ${id}["${tool}"]\n`;
      layerNodeIds.llm.push(id);
    }
    mermaid += `  end\n`;
  }
  
  // Input Processing (right of orchestrator)
  if (inputLayer) {
    const tools = inputLayer.tools || [];
    layerNodeIds.input = [];
    mermaid += `  subgraph "${inputLayer.name}"\n`;
    for (const tool of tools) {
      const id = `n${nodeId++}`;
      mermaid += `    ${id}["${tool}"]\n`;
      layerNodeIds.input.push(id);
    }
    mermaid += `  end\n`;
  }
  
  // Persistence (bottom)
  if (persistenceLayer) {
    const tools = persistenceLayer.tools || [];
    layerNodeIds.persistence = [];
    mermaid += `  subgraph "${persistenceLayer.name}"\n`;
    for (const tool of tools) {
      const id = `n${nodeId++}`;
      mermaid += `    ${id}["${tool}"]\n`;
      layerNodeIds.persistence.push(id);
    }
    mermaid += `  end\n`;
  }
  
  // Observability (bottom right)
  if (obsLayer) {
    const tools = obsLayer.tools || [];
    layerNodeIds.obs = [];
    mermaid += `  subgraph "${obsLayer.name}"\n`;
    for (const tool of tools) {
      const id = `n${nodeId++}`;
      mermaid += `    ${id}["${tool}"]\n`;
      layerNodeIds.obs.push(id);
    }
    mermaid += `  end\n`;
  }
  
  // Hub-and-spoke connections from orchestrator
  const orchestratorIds = layerNodeIds.orchestrator || [];
  const llmIds = layerNodeIds.llm || [];
  const inputIds = layerNodeIds.input || [];
  const persistenceIds = layerNodeIds.persistence || [];
  const obsIds = layerNodeIds.obs || [];
  
  // Orchestrator calls LLM serving (parallel)
  if (orchestratorIds.length > 0 && llmIds.length > 0) {
    for (const o of orchestratorIds) {
      for (const l of llmIds) {
        mermaid += `  ${o} --> ${l}\n`;
      }
    }
  }
  
  // Orchestrator calls Input processors
  if (orchestratorIds.length > 0 && inputIds.length > 0) {
    for (const o of orchestratorIds) {
      for (const i of inputIds) {
        mermaid += `  ${o} --> ${i}\n`;
      }
    }
  }
  
  // Orchestrator writes to Persistence
  if (orchestratorIds.length > 0 && persistenceIds.length > 0) {
    for (const o of orchestratorIds) {
      for (const p of persistenceIds) {
        mermaid += `  ${o} --> ${p}\n`;
      }
    }
  }
  
  // Input processors also write to Persistence
  if (inputIds.length > 0 && persistenceIds.length > 0) {
    for (const i of inputIds) {
      for (const p of persistenceIds) {
        mermaid += `  ${i} --> ${p}\n`;
      }
    }
  }
  
  // LLM serving can also write to Persistence
  if (llmIds.length > 0 && persistenceIds.length > 0) {
    for (const l of llmIds) {
      for (const p of persistenceIds) {
        mermaid += `  ${l} --> ${p}\n`;
      }
    }
  }
  
  // Observability watches everything
  if (obsIds.length > 0) {
    const allIds = [...orchestratorIds, ...llmIds, ...inputIds, ...persistenceIds];
    for (const o of obsIds) {
      for (const a of allIds) {
        mermaid += `  ${a} -.-> ${o}\n`;  // dotted line for monitoring
      }
    }
  }
  
  return mermaid;
}

function generateRecommendations(issues, layers) {
  const recs = [];
  
  for (const issue of issues) {
    recs.push({
      type: 'fix',
      title: `Fix: ${issue.name}`,
      description: issue.fix,
    });
  }
  
  // Add missing layer recommendations
  for (const layer of layers) {
    if (layer.recommended) {
      recs.push({
        type: 'add',
        title: `Add ${layer.name}`,
        description: `Recommended: ${layer.tools.join(', ')}`,
      });
    }
  }
  
  // Check for parallel LLM serving
  const llmLayers = layers.filter(l => l.parallel);
  if (llmLayers.length > 0) {
    recs.push({
      type: 'info',
      title: 'Parallel LLM Serving',
      description: 'Ollama (dev) and vLLM (prod) are alternatives — pick one per environment, don\'t chain them.',
    });
  }
  
  return recs;
}