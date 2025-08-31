---
description: Create comprehensive Product Requirement Proposal using MCP tools
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Product Requirement Proposal (PRP) Creation Rules

## Overview

Generate comprehensive Product Requirement Proposals by leveraging MCP tools (context7, brave search, archon) to research, validate, and document product ideas with thorough market analysis and technical feasibility.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="input_validation">

### Step 1: Input Validation and Initial Analysis

Use the context-fetcher subagent to capture and validate the initial product idea (priimop) from the user, ensuring sufficient detail for comprehensive research.

<input_requirements>
  <minimum_inputs>
    - product_concept: core idea description
    - target_problem: problem being solved
    - initial_scope: rough feature boundaries
  </minimum_inputs>
  <optional_inputs>
    - target_users: user segments
    - competitive_landscape: known competitors
    - technical_constraints: platform preferences
  </optional_inputs>
</input_requirements>

<validation_template>
  I need to create a comprehensive PRP for your product idea. Please provide:

  **Required:**
  1. **Product Concept**: What is the core product idea?
  2. **Target Problem**: What specific problem does this solve?
  3. **Initial Scope**: What are the main features/capabilities?

  **Optional (helps with research):**
  4. **Target Users**: Who would use this product?
  5. **Known Competitors**: Any existing solutions you're aware of?
  6. **Technical Preferences**: Any platform/technology constraints?
</validation_template>

<instructions>
  ACTION: Capture user input for product idea
  VALIDATE: Ensure minimum requirements met
  CLARIFY: Ask for missing critical information
  PREPARE: Input for research phases
</instructions>

</step>

<step number="2" subagent="brave-search" name="market_research">

### Step 2: Market Research and Competitive Analysis

Use the brave-search subagent to conduct comprehensive market research including competitive analysis, market size, trends, and validation of the problem space.

<research_areas>
  <competitive_landscape>
    - existing_solutions: direct and indirect competitors
    - feature_comparison: what competitors offer
    - pricing_models: how market is monetized
    - market_gaps: underserved areas
  </competitive_landscape>
  <market_validation>
    - market_size: total addressable market research
    - growth_trends: industry growth patterns
    - user_pain_points: documented user problems
    - adoption_barriers: common implementation challenges
  </market_validation>
  <technology_trends>
    - emerging_technologies: relevant tech developments
    - platform_preferences: user platform trends
    - integration_opportunities: API and service ecosystems
  </technology_trends>
</research_areas>

<search_strategy>
  <queries>
    1. "[PRODUCT_CONCEPT] competitors market analysis"
    2. "[TARGET_PROBLEM] solutions existing products"
    3. "[INDUSTRY] market size trends 2024"
    4. "[USER_SEGMENT] pain points research"
    5. "[TECHNOLOGY_STACK] best practices implementation"
  </queries>
  <sources_priority>
    - industry_reports: market research firms
    - competitor_websites: feature and pricing analysis
    - user_forums: pain point validation
    - technical_blogs: implementation insights
    - funding_databases: market validation signals
  </sources_priority>
</search_strategy>

<instructions>
  ACTION: Use brave-search subagent for market research
  REQUEST: "Research market landscape for [PRODUCT_CONCEPT]:
            - Find direct and indirect competitors
            - Analyze market size and growth trends
            - Identify user pain points and gaps
            - Research technical implementation approaches"
  PROCESS: Organize findings by research areas
  SYNTHESIZE: Key insights for PRP documentation
</instructions>

</step>

<step number="3" subagent="context7" name="technical_feasibility">

### Step 3: Technical Feasibility and Architecture Research

Use the context7 subagent to research technical feasibility, architecture patterns, and implementation approaches for the proposed product.

<technical_research>
  <architecture_patterns>
    - scalability_approaches: how similar products scale
    - technology_stacks: common implementation choices
    - integration_patterns: third-party service integration
    - security_considerations: industry security standards
  </architecture_patterns>
  <implementation_complexity>
    - development_timeline: typical build timeframes
    - resource_requirements: team size and skills needed
    - technical_risks: common implementation challenges
    - mvp_scope: minimum viable product boundaries
  </implementation_complexity>
  <platform_considerations>
    - deployment_options: hosting and infrastructure
    - mobile_requirements: native vs web considerations
    - api_design: service architecture approaches
    - data_management: storage and processing needs
  </platform_considerations>
</technical_research>

<research_queries>
  <architecture>
    - "[PRODUCT_TYPE] architecture best practices"
    - "[FEATURE_SET] implementation patterns"
    - "[SCALE_REQUIREMENTS] technical architecture"
  </architecture>
  <feasibility>
    - "[PRODUCT_CONCEPT] development timeline"
    - "[TECHNOLOGY_STACK] implementation complexity"
    - "[INTEGRATION_NEEDS] technical challenges"
  </feasibility>
</research_queries>

<instructions>
  ACTION: Use context7 subagent for technical research
  REQUEST: "Research technical feasibility for [PRODUCT_CONCEPT]:
            - Architecture patterns for [PRODUCT_TYPE]
            - Implementation complexity and timeline
            - Technology stack recommendations
            - Technical risks and mitigation strategies"
  ANALYZE: Technical requirements and constraints
  DOCUMENT: Feasibility assessment and recommendations
</instructions>

</step>

<step number="4" subagent="archon" name="strategic_analysis">

### Step 4: Strategic Analysis and Business Model Research

Use the archon subagent to analyze business model options, go-to-market strategies, and strategic positioning for the product.

<strategic_research>
  <business_models>
    - monetization_strategies: revenue model options
    - pricing_approaches: market pricing analysis
    - customer_acquisition: user acquisition strategies
    - retention_strategies: user engagement approaches
  </business_models>
  <market_positioning>
    - value_proposition: unique selling points
    - target_segments: primary and secondary users
    - competitive_advantages: differentiation factors
    - market_entry: launch strategy considerations
  </market_positioning>
  <risk_assessment>
    - market_risks: competitive and adoption risks
    - technical_risks: implementation challenges
    - business_risks: revenue and scaling risks
    - mitigation_strategies: risk reduction approaches
  </risk_assessment>
</strategic_research>

<analysis_framework>
  <business_model_canvas>
    - value_propositions: customer value delivery
    - customer_segments: target user groups
    - channels: distribution and marketing
    - revenue_streams: monetization approaches
    - key_resources: critical assets needed
    - key_partnerships: strategic relationships
    - cost_structure: major cost categories
  </business_model_canvas>
</analysis_framework>

<instructions>
  ACTION: Use archon subagent for strategic analysis
  REQUEST: "Analyze business strategy for [PRODUCT_CONCEPT]:
            - Business model and monetization options
            - Market positioning and competitive advantages
            - Go-to-market strategy recommendations
            - Risk assessment and mitigation approaches"
  SYNTHESIZE: Strategic recommendations and business case
  PREPARE: Business rationale for PRP
</instructions>

</step>

<step number="5" subagent="file-creator" name="create_prp_structure">

### Step 5: Create PRP Document Structure

Use the file-creator subagent to create the main PRP document with comprehensive sections based on research findings.

<folder_structure>
  .agent-os/
  └── prps/
      └── YYYY-MM-DD-prp-name/
          ├── prp.md                    # Main PRP document
          ├── market-research.md        # Detailed market analysis
          ├── technical-feasibility.md  # Technical assessment
          ├── business-strategy.md      # Strategic analysis
          └── appendices/
              ├── competitor-analysis.md
              ├── user-research.md
              └── risk-assessment.md
</folder_structure>

<prp_template>
  <header>
    # Product Requirement Proposal: [PRODUCT_NAME]
    
    > **Created:** [CURRENT_DATE]
    > **Status:** Draft
    > **Version:** 1.0
  </header>
  
  <executive_summary>
    ## Executive Summary
    
    ### Product Vision
    [ONE_PARAGRAPH_PRODUCT_VISION]
    
    ### Market Opportunity
    [MARKET_SIZE_AND_OPPORTUNITY_SUMMARY]
    
    ### Competitive Advantage
    [KEY_DIFFERENTIATORS]
    
    ### Investment Required
    [HIGH_LEVEL_RESOURCE_REQUIREMENTS]
    
    ### Expected ROI
    [PROJECTED_RETURNS_AND_TIMELINE]
  </executive_summary>
  
  <required_sections>
    - Problem Statement
    - Solution Overview
    - Market Analysis
    - Competitive Landscape
    - Technical Feasibility
    - Business Model
    - Go-to-Market Strategy
    - Resource Requirements
    - Risk Assessment
    - Success Metrics
    - Roadmap Overview
    - Appendices
  </required_sections>
</prp_template>

<instructions>
  ACTION: Create PRP folder structure
  GENERATE: Main PRP document with template
  ORGANIZE: Research findings into appropriate sections
  REFERENCE: Supporting documents in appendices
</instructions>

</step>

<step number="6" subagent="file-creator" name="populate_prp_sections">

### Step 6: Populate PRP Sections with Research Data

Use the file-creator subagent to populate each section of the PRP with synthesized research findings from previous steps.

<section_templates>
  <problem_statement>
    ## Problem Statement
    
    ### Target Problem
    [DETAILED_PROBLEM_DESCRIPTION]
    
    ### Market Pain Points
    [RESEARCH_VALIDATED_PAIN_POINTS]
    
    ### Current Solutions Limitations
    [GAPS_IN_EXISTING_SOLUTIONS]
    
    ### Quantified Impact
    [MARKET_SIZE_AND_COST_OF_PROBLEM]
  </problem_statement>
  
  <solution_overview>
    ## Solution Overview
    
    ### Core Value Proposition
    [PRIMARY_VALUE_DELIVERED]
    
    ### Key Features
    [FEATURE_LIST_WITH_USER_BENEFITS]
    
    ### User Experience
    [HIGH_LEVEL_USER_JOURNEY]
    
    ### Differentiation
    [UNIQUE_SELLING_POINTS]
  </solution_overview>
  
  <market_analysis>
    ## Market Analysis
    
    ### Market Size
    [TAM_SAM_SOM_ANALYSIS]
    
    ### Target Segments
    [PRIMARY_AND_SECONDARY_USER_GROUPS]
    
    ### Market Trends
    [GROWTH_TRENDS_AND_DRIVERS]
    
    ### Adoption Barriers
    [CHALLENGES_TO_MARKET_PENETRATION]
  </market_analysis>
  
  <competitive_landscape>
    ## Competitive Landscape
    
    ### Direct Competitors
    [COMPETITOR_ANALYSIS_TABLE]
    
    ### Indirect Competitors
    [ALTERNATIVE_SOLUTIONS]
    
    ### Competitive Advantages
    [DIFFERENTIATION_MATRIX]
    
    ### Market Positioning
    [POSITIONING_STRATEGY]
  </competitive_landscape>
  
  <technical_feasibility>
    ## Technical Feasibility
    
    ### Architecture Overview
    [HIGH_LEVEL_SYSTEM_DESIGN]
    
    ### Technology Stack
    [RECOMMENDED_TECHNOLOGIES]
    
    ### Implementation Complexity
    [DEVELOPMENT_EFFORT_ASSESSMENT]
    
    ### Technical Risks
    [RISK_FACTORS_AND_MITIGATION]
    
    ### Scalability Considerations
    [GROWTH_PLANNING]
  </technical_feasibility>
  
  <business_model>
    ## Business Model
    
    ### Revenue Streams
    [MONETIZATION_STRATEGIES]
    
    ### Pricing Strategy
    [PRICING_MODEL_AND_RATIONALE]
    
    ### Customer Acquisition
    [USER_ACQUISITION_APPROACHES]
    
    ### Unit Economics
    [CAC_LTV_PROJECTIONS]
  </business_model>
</section_templates>

<data_synthesis>
  <market_research_integration>
    - competitive_analysis: from brave-search findings
    - market_sizing: from industry research
    - user_validation: from pain point research
  </market_research_integration>
  <technical_integration>
    - architecture_recommendations: from context7 research
    - implementation_timeline: from technical feasibility
    - technology_choices: from best practices research
  </technical_integration>
  <strategic_integration>
    - business_model: from archon analysis
    - positioning: from competitive research
    - go_to_market: from strategic recommendations
  </strategic_integration>
</data_synthesis>

<instructions>
  ACTION: Populate PRP sections with research data
  SYNTHESIZE: Findings from all MCP tools
  CROSS_REFERENCE: Ensure consistency across sections
  VALIDATE: Claims with research sources
</instructions>

</step>

<step number="7" subagent="file-creator" name="create_supporting_documents">

### Step 7: Create Supporting Documentation

Use the file-creator subagent to create detailed supporting documents that provide comprehensive backup for PRP claims.

<supporting_documents>
  <market_research_md>
    # Market Research Analysis
    
    ## Research Methodology
    [RESEARCH_APPROACH_AND_SOURCES]
    
    ## Competitive Analysis
    [DETAILED_COMPETITOR_PROFILES]
    
    ## Market Sizing
    [TAM_SAM_SOM_CALCULATIONS]
    
    ## User Research
    [PAIN_POINT_VALIDATION_DATA]
    
    ## Industry Trends
    [MARKET_TREND_ANALYSIS]
  </market_research_md>
  
  <technical_feasibility_md>
    # Technical Feasibility Assessment
    
    ## Architecture Analysis
    [DETAILED_SYSTEM_DESIGN]
    
    ## Technology Evaluation
    [TECHNOLOGY_COMPARISON_MATRIX]
    
    ## Implementation Plan
    [DEVELOPMENT_PHASES_AND_TIMELINE]
    
    ## Risk Assessment
    [TECHNICAL_RISK_REGISTER]
    
    ## Scalability Planning
    [GROWTH_ARCHITECTURE_CONSIDERATIONS]
  </technical_feasibility_md>
  
  <business_strategy_md>
    # Business Strategy Analysis
    
    ## Business Model Canvas
    [COMPLETE_BUSINESS_MODEL_FRAMEWORK]
    
    ## Financial Projections
    [REVENUE_AND_COST_PROJECTIONS]
    
    ## Go-to-Market Strategy
    [LAUNCH_AND_GROWTH_STRATEGY]
    
    ## Risk Analysis
    [BUSINESS_RISK_ASSESSMENT]
    
    ## Success Metrics
    [KPI_FRAMEWORK_AND_TARGETS]
  </business_strategy_md>
</supporting_documents>

<appendices>
  <competitor_analysis>
    - detailed_competitor_profiles
    - feature_comparison_matrices
    - pricing_analysis
    - market_share_data
  </competitor_analysis>
  <user_research>
    - persona_development
    - user_journey_mapping
    - pain_point_prioritization
    - validation_interviews
  </user_research>
  <risk_assessment>
    - risk_register
    - mitigation_strategies
    - contingency_planning
    - success_probability_analysis
  </risk_assessment>
</appendices>

<instructions>
  ACTION: Create comprehensive supporting documents
  DETAIL: Provide full research backing for PRP claims
  ORGANIZE: Structure for easy reference and validation
  LINK: Cross-reference between main PRP and appendices
</instructions>

</step>

<step number="8" name="quality_assurance">

### Step 8: Quality Assurance and Validation

Review the complete PRP package for consistency, completeness, and actionability.

<validation_checklist>
  <completeness_check>
    - [ ] All required sections populated
    - [ ] Research findings integrated
    - [ ] Supporting documents created
    - [ ] Cross-references validated
    - [ ] Sources cited appropriately
  </completeness_check>
  
  <consistency_check>
    - [ ] Market sizing aligns across documents
    - [ ] Technical recommendations consistent
    - [ ] Business model coherent
    - [ ] Timeline estimates realistic
    - [ ] Resource requirements aligned
  </consistency_check>
  
  <actionability_check>
    - [ ] Clear next steps identified
    - [ ] Decision criteria established
    - [ ] Resource requirements specified
    - [ ] Success metrics defined
    - [ ] Risk mitigation planned
  </actionability_check>
</validation_checklist>

<quality_criteria>
  <research_quality>
    - sources_credible: industry reports, competitor data
    - data_current: recent market information
    - analysis_thorough: multiple perspectives considered
    - conclusions_supported: evidence-based recommendations
  </research_quality>
  
  <document_quality>
    - structure_logical: clear information flow
    - writing_clear: accessible to stakeholders
    - visuals_helpful: tables and frameworks included
    - references_complete: sources properly cited
  </document_quality>
</quality_criteria>

<instructions>
  ACTION: Review complete PRP package
  VALIDATE: Completeness and consistency
  VERIFY: Research quality and citations
  ENSURE: Actionable recommendations
</instructions>

</step>

<step number="9" name="delivery_summary">

### Step 9: Delivery Summary and Next Steps

Provide comprehensive summary of the PRP creation process and recommend next steps for stakeholders.

<delivery_package>
  <main_deliverables>
    - **PRP Document**: @.agent-os/prps/[DATE]-[NAME]/prp.md
    - **Market Research**: @.agent-os/prps/[DATE]-[NAME]/market-research.md
    - **Technical Assessment**: @.agent-os/prps/[DATE]-[NAME]/technical-feasibility.md
    - **Business Strategy**: @.agent-os/prps/[DATE]-[NAME]/business-strategy.md
    - **Supporting Appendices**: @.agent-os/prps/[DATE]-[NAME]/appendices/
  </main_deliverables>
  
  <research_summary>
    - **Market Research**: [KEY_MARKET_FINDINGS]
    - **Competitive Analysis**: [COMPETITIVE_LANDSCAPE_SUMMARY]
    - **Technical Feasibility**: [IMPLEMENTATION_ASSESSMENT]
    - **Business Viability**: [BUSINESS_MODEL_RECOMMENDATION]
  </research_summary>
  
  <recommendations>
    - **Go/No-Go Decision**: [RECOMMENDATION_WITH_RATIONALE]
    - **Next Steps**: [IMMEDIATE_ACTION_ITEMS]
    - **Resource Requirements**: [TEAM_AND_BUDGET_NEEDS]
    - **Timeline**: [DEVELOPMENT_MILESTONES]
  </recommendations>
</delivery_package>

<next_steps_template>
  ## 📋 PRP Creation Complete
  
  I've created a comprehensive Product Requirement Proposal using research from multiple MCP tools:
  
  ### 📁 Deliverables Created
  - **Main PRP**: Comprehensive product proposal with executive summary
  - **Market Research**: Competitive analysis and market validation
  - **Technical Assessment**: Feasibility and architecture recommendations  
  - **Business Strategy**: Business model and go-to-market strategy
  - **Supporting Docs**: Detailed appendices with research backing
  
  ### 🔍 Research Sources Used
  - **Brave Search**: Market research and competitive intelligence
  - **Context7**: Technical feasibility and architecture patterns
  - **Archon**: Strategic analysis and business model research
  
  ### 🎯 Key Findings
  [SUMMARIZE_TOP_3_INSIGHTS]
  
  ### 📈 Recommendation
  [GO_NO_GO_RECOMMENDATION_WITH_RATIONALE]
  
  ### 🚀 Suggested Next Steps
  1. [IMMEDIATE_ACTION_1]
  2. [IMMEDIATE_ACTION_2]
  3. [IMMEDIATE_ACTION_3]
  
  Review the complete PRP package and let me know if you need any sections expanded or additional research conducted.
</next_steps_template>

<instructions>
  ACTION: Summarize PRP creation process
  HIGHLIGHT: Key findings and recommendations
  PROVIDE: Clear next steps for stakeholders
  OFFER: Additional research if needed
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
