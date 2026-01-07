import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Sparkles, BookOpen, ClipboardCheck, ListChecks, FileSignature, Wand2, FileText, Lightbulb, Mail, HeartHandshake, Wind, Shield } from 'lucide-react';
import ToolCard from '../components/ai_tools/ToolCard';
import ToolRunner from '../components/ai_tools/ToolRunner';
import MarkdownOutput from '../components/ai_tools/outputs/MarkdownOutput';
import WorksheetOutput from '../components/ai_tools/outputs/WorksheetOutput';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import FileUpload from '../components/ai_tools/inputs/FileUpload';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { motion } from "framer-motion";
import { useTranslation } from '../components/i18n/useTranslation';

// --- Tool Definitions ---

const getTeacherTools = (t) => [
   {
    id: 'email-generator',
    name: t('aiTools.emailGenerator'),
    description: t('aiTools.emailGeneratorDesc'),
    icon: Mail,
    promptTemplate: (inputs) => `
      You are an experienced teacher drafting an email. The tone should be professional and clear.

      - **Recipient:** ${inputs.recipient}
      - **Student Name:** ${inputs.student_name}
      - **Subject/Topic of Email:** ${inputs.topic}
      - **Key Points to Include:**\n${inputs.key_points}
      - **Desired Tone:** ${inputs.tone}

      **Instructions:**
      - Draft a complete email, including a subject line, greeting, body, and closing.
      - The email should clearly and concisely communicate the key points.
      - The body of the email should be 3-5 sentences long.
      - Format the output in clean Markdown, starting with a subject line.
    `,
    getInputSchema: (t) => [
        { id: 'recipient', label: t('aiTools.emailTo'), component: Select, props: { items: [t('aiTools.aParentGuardian'), t('aiTools.aStudent')] }, required: true},
        { id: 'student_name', label: t('aiTools.studentName'), component: Input, props: { placeholder: 'e.g., Jane Doe' }, required: true },
        { id: 'topic', label: t('aiTools.emailSubject'), component: Input, props: { placeholder: 'e.g., Upcoming Test, Behavior Update' }, required: true },
        { id: 'key_points', label: t('aiTools.keyPointsToInclude'), component: Textarea, props: { placeholder: 'e.g., Test is on Friday. It will cover chapters 4-6. Jane has been doing well in class.' }, required: true },
        { id: 'tone', label: t('aiTools.tone'), component: Select, props: { items: [t('aiTools.formalEncouraging'), t('aiTools.positiveCasual'), t('aiTools.directInformative')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'iep-accommodations',
    name: t('aiTools.iepAccommodations'),
    description: t('aiTools.iepAccommodationsDesc'),
    icon: FileSignature,
    promptTemplate: (inputs) => {
      if (inputs.output_type === 'Full Report') {
        return `You are a special education expert with deep knowledge of IEPs and student accommodations. Generate a comprehensive IEP support report for the student detailed below.

---
### **Confidential IEP Support Document**

**Student Name:** ${inputs.student_name}  
**Grade Level:** ${inputs.grade_level}  
**Area of Need:** ${inputs.area_of_need}
---

**Student's Specific Challenges:**
${inputs.challenges}

**Instructions:**
Based *only* on the information provided above, create a detailed, comprehensive report that includes:
1.  **Student Profile Summary:** A brief, professional overview of the student's needs and challenges.
2.  **Recommended Accommodations:** A list of 8-10 specific, practical accommodations for the classroom.
3.  **SMART Goals:** 2-3 well-defined SMART (Specific, Measurable, Achievable, Relevant, Time-bound) goals related to the area of need.
4.  **Classroom Strategies:** Specific teaching strategies and environmental modifications to support the student.
5.  **Parent Communication Plan:** A brief outline of how to effectively communicate with parents about the student's progress and the supports being implemented.
6.  **Progress Monitoring:** Suggestions on how to track and measure the student's progress toward their goals.

Format the entire output in clean, professional Markdown with clear headings and bullet points.`;
      }

      let prompt = `You are a special education expert with deep knowledge of IEPs and student accommodations. Generate practical, actionable support materials based on the following student information.

      - **Student Name:** ${inputs.student_name}
      - **Student's Grade Level:** ${inputs.grade_level}
      - **Area of Need:** ${inputs.area_of_need}
      - **Specific Challenges:** ${inputs.challenges}
      - **Desired Output:** ${inputs.output_type}

      **Instructions:**
      Based on the desired output, generate the requested content. Ensure the suggestions are specific, measurable, and appropriate for the student's grade level and area of need.
      `;

      if (inputs.output_type === 'List of Accommodations') {
        prompt += `
      - If "List of Accommodations" is chosen, provide a clear, bulleted list of 5-7 practical accommodations for the classroom, specifically addressing the described challenges.
        `;
      } else if (inputs.output_type === 'SMART Goal') {
        prompt += `
      - If "SMART Goal" is chosen, write one clear, specific, measurable, achievable, relevant, and time-bound goal related to the area of need and challenges.
        `;
      } else if (inputs.output_type === 'Email to Parent') {
        prompt += `
      - If "Email to Parent" is chosen, draft a professional and empathetic email to the parent/guardian of **${inputs.student_name}** outlining proposed supports and asking for collaboration, specifically mentioning the challenges and area of need.
        `;
      }

      prompt += `
      Format the entire output in clean, easy-to-read Markdown.
      `;
      return prompt;
    },
    getInputSchema: (t) => [
      { id: 'student_name', label: t('aiTools.studentName'), component: Input, props: { placeholder: 'e.g., Jane Doe' }, required: true },
      { id: 'grade_level', label: t('aiTools.gradeLevel'), component: Select, props: { 
          items: [t('aiTools.kindergarten'), t('aiTools.grade1'), t('aiTools.grade2'), t('aiTools.grade3'), t('aiTools.grade4'), t('aiTools.grade5'), t('aiTools.grade6'), t('aiTools.grade7'), t('aiTools.grade8'), t('aiTools.grade9'), t('aiTools.grade10'), t('aiTools.grade11'), t('aiTools.grade12')] 
      }, required: true },
      { id: 'area_of_need', label: t('aiTools.areaOfNeed'), component: Input, props: { placeholder: 'e.g., ADHD, Dyslexia, Autism, Anxiety' }, required: true },
      { id: 'challenges', label: t('aiTools.describeStudentChallenges'), component: Textarea, props: { placeholder: 'e.g., "Student struggles to stay on task for more than 5 minutes," or "Has difficulty decoding multi-syllable words."' }, required: true },
      { id: 'output_type', label: t('aiTools.whatToGenerate'), component: Select, props: { items: [t('aiTools.fullReport'), t('aiTools.listOfAccommodations'), t('aiTools.smartGoal'), t('aiTools.emailToParent')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'rubric-generator',
    name: t('aiTools.rubricGenerator'),
    description: t('aiTools.rubricGeneratorDesc'),
    icon: ClipboardCheck,
    promptTemplate: (inputs) => `
      You are a master educator specializing in assessment design. Create a detailed grading rubric for the following assignment.

      - **Assignment Title:** ${inputs.assignment_title}
      - **Key Criteria (one per line):**\n${inputs.criteria}
      - **Number of Performance Levels:** 4 (Exemplary, Proficient, Developing, Needs Improvement)

      For each criterion provided, write clear, detailed descriptions for each of the four performance levels. The descriptions should be specific and actionable.
      Format the entire output as a clean Markdown table.
    `,
    getInputSchema: (t) => [
      { id: 'assignment_title', label: t('aiTools.assignmentTitle'), component: Input, props: { placeholder: 'e.g., History of Rome Essay' }, required: true },
      { id: 'criteria', label: t('aiTools.gradingCriteria'), component: Textarea, props: { placeholder: 'e.g., Thesis Statement\nEvidence and Analysis\nClarity and Organization\nGrammar and Mechanics' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'question-generator',
    name: t('aiTools.questionGenerator'),
    description: t('aiTools.questionGeneratorDesc'),
    icon: ListChecks,
    useInternetContext: true,
    promptTemplate: (inputs) => `
      You are an expert curriculum developer. Generate a set of assessment questions.
      
      **CRITICAL INSTRUCTIONS:**
      - Your primary source of context should be the **YouTube Transcript** if provided.
      - If no transcript, use the **Uploaded Document** if provided.
      - If no document, use the **Website URL** as the context.
      - If none of the above, generate questions based on the general **Topic**.
      - Base the questions *only* on the highest-priority context available.

      **Context:**
      - **Topic:** ${inputs.topic || 'Not provided'}
      - **Website URL:** ${inputs.context_url || 'Not provided'}
      - **YouTube Transcript:** ${inputs.youtube_transcript || 'Not provided'}
      
      **Requirements:**
      - **Number of Questions:** ${inputs.num_questions}
      - **Question Type:** ${inputs.question_type}
      - **Difficulty:** ${inputs.difficulty}

      Generate exactly ${inputs.num_questions} questions of the specified type and difficulty. If 'Multiple Choice' is selected, provide 4 options (A, B, C, D) and clearly indicate the correct answer.
      Format the output in clean Markdown.
    `,
    getInputSchema: (t) => [
      { id: 'topic', label: t('aiTools.topicIfNoContent'), component: Input, props: { placeholder: 'e.g., The American Revolution' }, required: false },
      { id: 'context_url', label: t('aiTools.websiteUrlOptional'), component: Input, props: { placeholder: 'e.g., https://www.history.com/topics/american-revolution' }, required: false },
      { id: 'youtube_transcript', label: t('aiTools.youtubeTranscript'), component: Textarea, props: { placeholder: 'Paste the full transcript from a YouTube video here...', className: "h-32" }, required: false },
      { id: 'file_upload', label: t('aiTools.uploadDocumentOptional'), component: FileUpload, required: false },
      { id: 'question_type', label: t('aiTools.questionType'), component: Select, props: { items: [t('aiTools.multipleChoice'), t('aiTools.trueFalse'), t('aiTools.shortAnswer')] }, required: true },
      { id: 'num_questions', label: t('aiTools.numberOfQuestions'), component: Input, props: { type: 'number', placeholder: 'e.g., 5' }, required: true },
      { id: 'difficulty', label: t('aiTools.difficulty'), component: Select, props: { items: [t('aiTools.easy'), t('aiTools.medium'), t('aiTools.hard')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'worksheet-generator',
    name: t('aiTools.worksheetGenerator'),
    description: t('aiTools.worksheetGeneratorDesc'),
    icon: FileText,
    useInternetContext: true,
    hasBetaTag: true, // Added beta tag
    promptTemplate: (inputs) => `
      You are an expert educator specializing in creating professional, well-formatted worksheets. Generate a complete worksheet based on the provided context and instructions.
      
      **CRITICAL INSTRUCTIONS:**
      - Your primary source of context should be the **YouTube Transcript** if provided.
      - If no transcript, use the **Uploaded Document** if provided.
      - If no document, use the **Website URL** as the context.
      - If none of the above, generate content based on the general **Topic**.
      - Base the worksheet content *only* on the highest-priority context available.

      **Context:**
      - **Topic:** ${inputs.topic || 'Not provided'}
      - **Website URL:** ${inputs.context_url || 'Not provided'}
      - **YouTube Transcript:** ${inputs.youtube_transcript || 'Not provided'}
      
      **Worksheet Requirements:**
      - **Layout Instructions:** ${inputs.worksheet_instructions}

      **FORMAT REQUIREMENTS:**
      Create a professional worksheet using HTML formatting that looks like a real school worksheet. Include:

      1. **Header Section:**
         - Title of the worksheet (centered and bold)
         - Name: _________________ Date: _____________ Period: _______

      2. **Content Section:**
         - Follow the teacher's specific layout instructions
         - Use proper formatting for different question types
         - Include clear instructions for students
         - Use HTML formatting for visual appeal

      3. **Visual Elements:**
         - Use tables, borders, and spacing for professional appearance
         - Include answer blanks, checkboxes, or circles as needed
         - Use colors and formatting to make it visually appealing
         - Ensure it looks like a real worksheet students would receive
         - **For diagrams, you MUST use inline SVG to draw them. Do not use \`<img>\` tags.**

      **Example Question Types to Support:**
      - Multiple choice (A, B, C, D options)
      - True/False questions
      - Fill-in-the-blank
      - Short answer questions
      - Matching exercises (with lines to draw)
      - Circle the correct answer
      - Word problems
      - Diagrams with labels (using SVG)

      Generate the worksheet in clean HTML format that can be easily printed or shared with students.
    `,
    getInputSchema: (t) => [
      { id: 'topic', label: t('aiTools.topicIfNoContent'), component: Input, props: { placeholder: 'e.g., The Water Cycle' }, required: false },
      { id: 'context_url', label: t('aiTools.websiteUrlOptional'), component: Input, props: { placeholder: 'e.g., https://www.nationalgeographic.org/encyclopedia/water-cycle/' }, required: false },
      { id: 'youtube_transcript', label: t('aiTools.youtubeTranscript'), component: Textarea, props: { placeholder: 'Paste the full transcript from a YouTube video here...', className: "h-32" }, required: false },
      { id: 'file_upload', label: t('aiTools.uploadDocumentOptional'), component: FileUpload, required: false },
      { id: 'worksheet_instructions', label: t('aiTools.worksheetInstructions'), component: Textarea, props: { placeholder: 'e.g., Create a worksheet with 5 multiple choice questions, 3 true/false questions, and 2 short answer questions about the water cycle. Include a diagram for students to label. Make it colorful and engaging for 4th graders.', className: "h-32" }, required: true },
    ],
    outputComponent: WorksheetOutput
  },
  {
    id: 'report-card-comments',
    name: t('aiTools.reportCardComments'),
    description: t('aiTools.reportCardCommentsDesc'),
    icon: FileSignature,
    promptTemplate: (inputs) => `
      You are an experienced teacher writing a report card. Your tone should be constructive and supportive.

      - **Student Name:** ${inputs.student_name}
      - **Tone:** ${inputs.tone}

      **Performance Details:**
      - **Strengths to highlight:** ${inputs.strengths}
      - **Areas for improvement:** ${inputs.areas_for_improvement}

      **Instructions:**
      - Write a balanced and personalized comment for ${inputs.student_name}.
      - The comment should be 2-4 sentences long.
      - Start by highlighting the strengths, then gently introduce the areas for improvement with a suggestion for growth.
      - Format the output in clean Markdown.
    `,
    getInputSchema: (t) => [
      { id: 'student_name', label: t('aiTools.studentName'), component: Input, props: { placeholder: 'e.g., Jane Doe' }, required: true },
      { id: 'strengths', label: t('aiTools.studentStrengths'), component: Textarea, props: { placeholder: 'e.g., Excellent participation, creative problem-solver, helps peers' }, required: true },
      { id: 'areas_for_improvement', label: t('aiTools.areasForImprovement'), component: Textarea, props: { placeholder: 'e.g., Double-checking work for careless errors, speaking up in group discussions' }, required: true },
      { id: 'tone', component: Select, props: { items: [t('aiTools.encouraging'), t('aiTools.formal'), t('aiTools.direct')] }, required: true, label: t('aiTools.tone') },
    ],
    outputComponent: MarkdownOutput
  },
  
  {
    id: 'assignment-scaffolder',
    name: t('aiTools.assignmentScaffolder'),
    description: t('aiTools.assignmentScaffolderDesc'),
    icon: BookOpen,
    promptTemplate: (inputs) => `
      You are an expert at differentiated instruction. Take the following assignment and create scaffolded versions for different learner needs.

      **Original Assignment:**
      ${inputs.original_assignment}

      **Grade Level:** ${inputs.grade_level}
      **Subject:** ${inputs.subject}

      **Instructions:**
      Create three differentiated versions:
      
      1. **For Struggling Students:**
      - Simplified language and shorter tasks
      - Graphic organizers and sentence starters
      - Clear step-by-step instructions
      - Reduced complexity while maintaining core learning objectives
      
      2. **For On-Level Students:**
      - The original assignment with minor clarifications
      - Optional support materials
      - Clear rubric expectations
      
      3. **For Advanced Students:**
      - Extended challenges and higher-order thinking tasks
      - Additional research or analysis components
      - Opportunities for creativity and independent exploration
      - Connections to real-world applications

      Format the output in clean Markdown with clear headings for each level.
    `,
    getInputSchema: (t) => [
      { id: 'original_assignment', label: t('aiTools.originalAssignment'), component: Textarea, props: { placeholder: 'e.g., Write a 5-paragraph essay on how climate change affects different parts of the world.' }, required: true },
      { id: 'grade_level', component: Select, props: { 
          items: [t('aiTools.kindergarten'), t('aiTools.grade1'), t('aiTools.grade2'), t('aiTools.grade3'), t('aiTools.grade4'), t('aiTools.grade5'), t('aiTools.grade6'), t('aiTools.grade7'), t('aiTools.grade8'), t('aiTools.grade9'), t('aiTools.grade10'), t('aiTools.grade11'), t('aiTools.grade12')] 
      }, required: true, label: t('aiTools.gradeLevel') },
      { id: 'subject', label: t('aiTools.subject'), component: Input, props: { placeholder: 'e.g., English, Science, Social Studies' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
 
  {
    id: 'teacher-wellness-support',
    name: t('aiTools.teacherWellness'),
    description: t('aiTools.teacherWellnessDesc'),
    icon: Wind,
    promptTemplate: (inputs) => `
      You are a supportive, calm, and thoughtful assistant built to help teachers reflect on their emotional well-being and manage stress or burnout. 
      The user is a teacher.
      
      Their check-in response is:
      """
      ${inputs.user_input}
      """
      
      **YOUR TASK:**
      1.  **Validate and Reflect:** Acknowledge their feelings with empathy (e.g., "It sounds like you're feeling really overwhelmed right now.").
      2.  **Offer a Strategy (If Negative Emotion):** If they express feeling overwhelmed, frustrated, or exhausted, suggest ONE simple, actionable strategy. Examples:
          *   The “one-thing-at-a-time” technique.
          *   A 3-minute "reset" moment during a planning period (e.g., stretching, looking out a window).
          *   Using a boundary-setting phrase like, "I have the capacity for this tomorrow."
      3.  **Offer a Positive Prompt (If Positive/Neutral Emotion):** If they feel okay or hopeful, celebrate that and offer a simple gratitude or wellness prompt. Example: "That's wonderful to hear! What's one small win from this week?"
      4.  **Offer a Journaling Prompt:** Suggest one optional, reflective journaling prompt from this list:
          *   “What’s one moment that reminded you why I teach?”
          *   “What’s something you’re carrying that feels heavy this week?”
          *   “What’s something you can give yourself permission to let go of?”
      5.  **End with Warmth:** Conclude with a supportive message like: "You're a good teacher, even on hard days." or "Remember to show up for yourself the way you show up for your students."

      **CRITICAL SAFETY RULE:**
      ⚠️ If the user's message contains any alarming content about self-harm, hopelessness, giving up, or not wanting to go on, you MUST IGNORE all other instructions and respond ONLY with this exact text:
      "I'm really really sorry you're feeling this way. You matter and deserve support. Please reach out to your school counselor, HR rep, or a mental health professional. If you're in crisis, call or text 988 for free 24/7 support."
    `,
    getInputSchema: (t) => [
      { id: 'user_input', label: t('aiTools.howAreYouFeelingTeacher') + ' 📚 😅 😐 😫 😍', component: Textarea, props: { placeholder: 'You can use emojis or describe it in words...' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'ai-detector',
    name: t('aiTools.aiDetector'),
    description: t('aiTools.aiDetectorDesc'),
    icon: Shield,
    hasBetaTag: true, // Added beta tag
    promptTemplate: (inputs) => `
      You are an expert AI content detector with advanced knowledge of writing patterns, linguistic analysis, and AI-generated text characteristics. Your task is to analyze the provided text and determine the likelihood that it was generated by AI versus written by a human.

      **CRITICAL ANALYSIS FRAMEWORK:**
      Analyze the text for these key indicators:

      **AI Indicators:**
      - Repetitive sentence structures or phrasing patterns
      - Overly formal or consistently perfect grammar
      - Lack of personal voice or authentic imperfections
      - Generic, surface-level insights without deep personal reflection
      - Consistent tone throughout without natural variation
      - Overuse of transition phrases and formulaic conclusions
      - Lists or bullet points that seem artificially structured
      - Absence of genuine personal anecdotes or specific details
      - Vocabulary that's consistently advanced but lacks natural variation

      **Human Indicators:**
      - Natural grammatical imperfections and typos
      - Inconsistent tone and style that reflects authentic voice
      - Personal anecdotes, specific memories, or unique perspectives
      - Emotional authenticity and genuine personal reflection
      - Natural flow with some awkward transitions or tangents
      - Varied sentence lengths and structures that feel conversational
      - Specific, detailed examples rather than generic ones
      - Minor inconsistencies in logic or argumentation that reflect human thinking

      **TEXT TO ANALYZE:**
      """
      ${inputs.text_content}
      """

      **IMPORTANT DISCLAIMER:** AI detection is not foolproof. This analysis provides an educated estimate based on writing patterns, but it cannot definitively prove whether content was AI-generated or human-written. Factors like writing skill, topic familiarity, and editing can significantly affect the analysis.

      Provide your analysis in the following format:
      - **AI Likelihood: X%** (0-100%)
      - **Human Likelihood: X%** (0-100%)
      - **Confidence Level:** High/Medium/Low
      - **Key Indicators Found:** List 3-5 specific patterns that influenced your assessment
      - **Recommendation:** Brief guidance on how to interpret these results
      - **Limitations:** Reminder about the limitations of AI detection

      Be thorough but concise in your analysis.
    `,
    getInputSchema: (t) => [
      { id: 'text_content', label: t('aiTools.textToAnalyze'), component: Textarea, props: { placeholder: 'Paste the text you want to analyze for AI detection...', className: "h-48" }, required: false },
      { id: 'file_upload', label: t('aiTools.orUploadDocument'), component: FileUpload, required: false },
    ],
    outputComponent: MarkdownOutput
  }
];

const getStudentTools = (t) => [
  {
    id: 'writing-feedback',
    name: t('aiTools.writingFeedback'),
    description: t('aiTools.writingFeedbackDesc'),
    icon: Wand2,
    promptTemplate: (inputs) => `
      You are a supportive and helpful writing tutor. Your goal is to help a student improve their writing, not to do the work for them.
      Analyze the following text written by the student.

      **Student's Text:**
      """
      ${inputs.student_text}
      """

      Provide constructive feedback based on the following areas. Be specific and provide examples from the text.
      1.  **Clarity & Concision:** Is the message clear? Are there wordy sentences that could be shortened?
      2.  **Grammar & Spelling:** Identify any grammatical errors or spelling mistakes. Explain the correct rule briefly.
      3.  **Style & Tone:** Is the tone appropriate? Is the writing engaging?
      4.  **Structure & Organization:** Does the text flow logically? Are the ideas well-organized?

      Do NOT rewrite the text. Frame your feedback positively and encouragingly. Format the output in clean Markdown.
    `,
    getInputSchema: (t) => [
      { id: 'student_text', label: t('aiTools.pasteTextHere'), component: Textarea, props: { placeholder: 'Enter the writing you want feedback on...', className: "h-48" }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'text-summarizer',
    name: t('aiTools.textSummarizer'),
    description: t('aiTools.textSummarizerDesc'),
    icon: FileText,
    promptTemplate: (inputs) => `
      You are an expert summarizer. Distill the following text into its most essential points.
      The summary should be concise, accurate, and easy to understand.

      - **Desired Length:** ${inputs.length}
      
      **Original Text:**
      """
      ${inputs.text_to_summarize}
      """

      Produce a summary that captures the main ideas and core arguments of the text.
      Format the output in clean Markdown.
    `,
    getInputSchema: (t) => [
      { id: 'text_to_summarize', label: t('aiTools.textToSummarize'), component: Textarea, props: { placeholder: 'Enter the article or text...', className: "h-48" }, required: true },
      { id: 'length', label: t('aiTools.summaryLength'), component: Select, props: { items: [t('aiTools.shortSentences'), t('aiTools.mediumParagraph'), t('aiTools.detailedBullets')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'question-generator',
    name: t('aiTools.checkUnderstanding'),
    description: t('aiTools.checkUnderstandingDesc'),
    icon: ListChecks,
    useInternetContext: true,
    promptTemplate: (inputs) => `
      You are a helpful study buddy. Generate a set of questions to help a student check their understanding.
      
      **CRITICAL INSTRUCTIONS:**
      - Your primary source of context should be the **YouTube Transcript** if provided.
      - If no transcript, use the **Uploaded Document** if provided.
      - If no document, use the **Website URL** as the context.
      - If none of the above, generate questions based on the general **Topic**.
      - Base the questions *only* on the highest-priority context available.

      **Context:**
      - **Topic:** ${inputs.topic || 'Not provided'}
      - **Website URL:** ${inputs.context_url || 'Not provided'}
      - **YouTube Transcript:** ${inputs.youtube_transcript || 'Not provided'}
      
      **Requirements:**
      - **Number of Questions:** ${inputs.num_questions}
      - **Question Type:** ${inputs.question_type}
      - **Difficulty:** ${inputs.difficulty}

      Generate exactly ${inputs.num_questions} questions of the specified type and difficulty. If 'Multiple Choice' is selected, provide 4 options (A, B, C, D) and clearly indicate the correct answer.
      Format the output in clean Markdown.
    `,
    getInputSchema: (t) => [
      { id: 'topic', label: t('aiTools.topicIfNoContent'), component: Input, props: { placeholder: 'e.g., The Water Cycle' }, required: false },
      { id: 'context_url', label: t('aiTools.websiteUrlOptional'), component: Input, props: { placeholder: 'e.g., https://www.nationalgeographic.org/encyclopedia/water-cycle/' }, required: false },
      { id: 'youtube_transcript', label: t('aiTools.youtubeTranscript'), component: Textarea, props: { placeholder: 'Paste the full transcript from a YouTube video here...', className: "h-32" }, required: false },
      { id: 'file_upload', label: t('aiTools.uploadDocumentOptional'), component: FileUpload, required: false },
      { id: 'question_type', label: t('aiTools.questionType'), component: Select, props: { items: [t('aiTools.multipleChoice'), t('aiTools.trueFalse'), t('aiTools.shortAnswer')] }, required: true },
      { id: 'num_questions', label: t('aiTools.numberOfQuestions'), component: Input, props: { type: 'number', placeholder: 'e.g., 5' }, required: true },
      { id: 'difficulty', component: Select, props: { items: [t('aiTools.easy'), t('aiTools.medium'), t('aiTools.hard')] }, required: true, label: t('aiTools.difficulty') },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'concept-explainer',
    name: t('aiTools.conceptExplainer'),
    description: t('aiTools.conceptExplainerDesc'),
    icon: Lightbulb,
    promptTemplate: (inputs) => `
      You are a friendly and knowledgeable tutor. Explain the following concept in a simple and clear way.

      - **Concept:** ${inputs.concept}
      - **Explain it like I'm:** ${inputs.explain_like_im}

      **Instructions:**
      - Break down the concept into its most important parts.
      - Use a real-world analogy or example to make it easier to understand.
      - Avoid jargon where possible, or explain it if you must use it.
      - The goal is clarity and comprehension.
      - Format the output in clean Markdown.
    `,
    getInputSchema: (t) => [
      { id: 'concept', label: t('aiTools.conceptToExplain'), component: Input, props: { placeholder: 'e.g., Photosynthesis, The Pythagorean Theorem, Blockchain' }, required: true },
      { id: 'explain_like_im', label: t('aiTools.explainLikeIm'), component: Select, props: { items: [t('aiTools.a5thGrader'), t('aiTools.aHighSchoolStudent'), t('aiTools.aCompleteBeginber')] }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'email-generator',
    name: t('aiTools.studentEmailGenerator'),
    description: t('aiTools.studentEmailGeneratorDesc'),
    icon: Mail,
    promptTemplate: (inputs) => `
      You are a student writing a respectful email to a teacher. The tone should be polite and clear.

      - **Teacher's Name:** Mr./Ms./Mrs. ${inputs.teacher_name}
      - **Subject/Topic of Email:** ${inputs.topic}
      - **Key Points to communicate:**\n${inputs.key_points}

      **Instructions:**
      - Draft a complete email, including a subject line, a proper greeting (e.g., "Dear Mr. Smith,"), the body, and a closing (e.g., "Thank you,").
      - The email should clearly state its purpose and communicate the key points effectively and respectfully.
      - Format the output in clean Markdown, starting with a subject line.
    `,
    getInputSchema: (t) => [
        { id: 'teacher_name', label: t('aiTools.teacherLastName'), component: Input, props: { placeholder: 'e.g., Smith' }, required: true },
        { id: 'topic', label: t('aiTools.emailSubject'), component: Input, props: { placeholder: 'e.g., Question about homework, Request for extension' }, required: true },
        { id: 'key_points', label: t('aiTools.whatYouNeedToSay'), component: Textarea, props: { placeholder: 'e.g., I was absent on Monday and need the makeup work. I am struggling with question 5 on the worksheet.' }, required: true },
    ],
    outputComponent: MarkdownOutput
  },
  {
    id: 'student-wellness-support',
    name: t('aiTools.studentWellness'),
    description: t('aiTools.studentWellnessDesc'),
    icon: HeartHandshake,
    promptTemplate: (inputs) => `
      You are a kind, empathetic, and safe mental health companion for students ages 10–18. Your job is to support their emotional well-being in a friendly and non-judgemental way.

      The student's check-in response is:
      """
      ${inputs.user_input}
      """

      **YOUR TASK:**
      1.  **Reflect and Validate:** Start by kindly reflecting their emotion back (e.g., "It sounds like you're feeling really stressed today.").
      2.  **Offer Support:** Based on their feeling, gently offer ONE relevant type of support:
          *   If they feel **sad, angry, anxious, or overwhelmed** → Offer ONE simple coping strategy (e.g., a short breathing exercise, a journaling prompt, the 5-4-3-2-1 grounding technique, a suggestion to stretch or listen to a favorite song).
          *   If they feel **okay or good** → Offer a positive affirmation or a gratitude journaling prompt (e.g., "What's one thing, no matter how small, that made you smile today?").
          *   If you're **unsure** how they feel → Ask a gentle, open-ended question like, "Thanks for sharing. Would it help to talk more about what's on your mind?"
      3.  **Ask an Open-Ended Question:** Include one optional follow-up question to encourage them to share more if they want to, like:
          *   "Want to tell me more about that?"
          *   "What's one thing that might make today feel a little bit better?"
          *   "Is there someone you trust that you could talk to about this?"
      4.  **End with Warmth:** Always conclude with a warm, supportive message. Examples: "You're doing your best, and that matters. ❤️" or "I'm proud of you for checking in today. I'm here anytime you need to talk."

      **CRITICAL SAFETY RULE:**
      ⚠️ If the student's message contains any alarming content about self-harm, wanting to die, feeling hopeless, or being unsafe, you MUST IGNORE all other instructions and respond ONLY with this exact text:
      "I'm really really sorry you're feeling this way. You're not alone. Please talk to a school counselor or a trusted adult right away. You can also call or text 988 to talk to someone who cares 24/7."
    `,
    getInputSchema: (t) => [
      { id: 'user_input', label: t('aiTools.howAreYouFeelingStudent') + ' 😊 😐 😢 😡 😰 😴', component: Textarea, props: { placeholder: 'You can describe it in words or emojis if you want...' }, required: true },
    ],
    outputComponent: MarkdownOutput
  }
];

export default function AITools() {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [tools, setTools] = useState([]);
    const [selectedTool, setSelectedTool] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pinnedTools, setPinnedTools] = useState([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchUserAndTools = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const userPinnedTools = userData.pinned_ai_tools || [];
                setPinnedTools(userPinnedTools);
                
                const userTools = userData.app_role === 'teacher' ? getTeacherTools(t) : getStudentTools(t);
                
                const sortedTools = [
                    ...userTools.filter(tool => userPinnedTools.includes(tool.id)),
                    ...userTools.filter(tool => !userPinnedTools.includes(tool.id))
                ];
                setTools(sortedTools);
                
                // Check for URL param to select a tool
                const urlParams = new URLSearchParams(window.location.search);
                const toolIdFromUrl = urlParams.get('tool');
                const messageFromUrl = urlParams.get('message');
                
                if (toolIdFromUrl) {
                    const toolToSelect = sortedTools.find(tool => tool.id === toolIdFromUrl);
                    if (toolToSelect) {
                        if (messageFromUrl) {
                            const toolWithInitialMessage = { ...toolToSelect, initialMessage: messageFromUrl };
                            setSelectedTool(toolWithInitialMessage);
                        } else {
                            setSelectedTool(toolToSelect);
                        }
                    } else if (sortedTools.length > 0) {
                        setSelectedTool(sortedTools[0]);
                    }
                } else if (sortedTools.length > 0 && !selectedTool) {
                    setSelectedTool(sortedTools[0]);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserAndTools();
    }, [t]);

    const handlePinToggle = async (toolId) => {
        try {
            const newPinnedTools = pinnedTools.includes(toolId)
                ? pinnedTools.filter(id => id !== toolId)
                : [...pinnedTools, toolId];
            
            await User.updateMyUserData({ pinned_ai_tools: newPinnedTools });
            setPinnedTools(newPinnedTools);
            
            // Re-sort tools
            const currentUserTools = user.app_role === 'teacher' ? getTeacherTools(t) : getStudentTools(t);
            const sortedTools = [
                ...currentUserTools.filter(tool => newPinnedTools.includes(tool.id)),
                ...currentUserTools.filter(tool => !newPinnedTools.includes(tool.id))
            ];
            setTools(sortedTools);
        } catch (error) {
            console.error("Failed to update pinned tools:", error);
        }
    };

    if (pageLoading) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[9999]">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-center"
                    >
                        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
                            {t('aiTools.title')}
                        </h1>
                        <p className="text-lg text-slate-500 mt-4 font-medium tracking-wide">
                            {t('common.poweredByACE')}
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">{t('aiTools.loadingAITools')}</div>;
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center px-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{t('aiTools.locked')}</h2>
                <p className="text-slate-600 max-w-sm">
                    {t('aiTools.lockedDescription')}
                </p>
                <Button 
                    onClick={async () => {
                        const redirectUrl = window.location.origin + createPageUrl('Dashboard');
                        await User.loginWithRedirect(redirectUrl);
                    }} 
                    className="mt-4 px-6 py-3"
                >
                    {t('aiTools.signInToContinue')}
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('aiTools.title')}</h1>
                    <p className="text-slate-600 mt-1">{t('aiTools.subtitle')}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/3 lg:w-1/4 space-y-3">
                    <h2 className="text-lg font-semibold text-slate-800 px-2">
                      {user.app_role === 'teacher' ? t('aiTools.teacherTools') : t('aiTools.studentTools')}
                    </h2>
                    {tools.map((tool, index) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ToolCard 
                                icon={tool.icon}
                                title={tool.name}
                                description={tool.description}
                                isSelected={selectedTool?.id === tool.id}
                                isPinned={pinnedTools.includes(tool.id)}
                                hasBetaTag={tool.hasBetaTag} // Passed the new prop
                                onSelect={() => {
                                // Find the original tool object from the current 'tools' state.
                                // This ensures we're working with the most up-to-date version of the tool.
                                const toolToSelect = tools.find(t => t.id === tool.id);
                                if (toolToSelect) {
                                    // Create a new object without the 'initialMessage' property
                                    // if it exists, ensuring subsequent selections don't retain old URL messages.
                                    const cleanedTool = { ...toolToSelect };
                                    if (cleanedTool.initialMessage !== undefined) {
                                        delete cleanedTool.initialMessage;
                                    }
                                    setSelectedTool(cleanedTool);
                                }
                            }}
                            onPinToggle={() => handlePinToggle(tool.id)}
                        />
                        </motion.div>
                    ))}
                </aside>
                <main className="flex-1">
                    {selectedTool && (
                        <ToolRunner key={selectedTool.id} tool={selectedTool} />
                    )}
                </main>
            </div>
        </div>
    );
}