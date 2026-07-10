import { createClientFromRequest } from 'npm:@base44/sdk@0.8.14';
import createDOMPurify from 'npm:dompurify@3.1.7';
import { JSDOM } from 'npm:jsdom@25.0.1';

// Sanitize LLM-generated HTML (worksheet-generator) to prevent stored XSS.
function sanitizeWorksheetHtml(html) {
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    return DOMPurify.sanitize(String(html ?? ''), {
        // Worksheets rely on inline SVG for diagrams, so allow SVG/MathML profiles.
        USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true }
    });
}

const TOOL_PROMPTS = {
  // TEACHER TOOLS
  'teacher-email-generator': (inputs) => `
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
  'iep-accommodations': (inputs) => {
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
  'rubric-generator': (inputs) => `
      You are a master educator specializing in assessment design. Create a detailed grading rubric for the following assignment.

      - **Assignment Title:** ${inputs.assignment_title}
      - **Key Criteria (one per line):**\n${inputs.criteria}
      - **Number of Performance Levels:** 4 (Exemplary, Proficient, Developing, Needs Improvement)

      For each criterion provided, write clear, detailed descriptions for each of the four performance levels. The descriptions should be specific and actionable.
      Format the entire output as a clean Markdown table.
    `,
  'teacher-question-generator': (inputs) => `
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
  'worksheet-generator': (inputs) => `
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
  'report-card-comments': (inputs) => `
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
  'assignment-scaffolder': (inputs) => `
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
  'teacher-wellness-support': (inputs) => `
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
  'ai-detector': (inputs) => `
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

  // STUDENT TOOLS
  'writing-feedback': (inputs) => `
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
  'text-summarizer': (inputs) => `
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
  'student-question-generator': (inputs) => `
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
  'concept-explainer': (inputs) => `
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
  'student-email-generator': (inputs) => `
      You are a student writing a respectful email to a teacher. The tone should be polite and clear.

      - **Teacher's Name:** Mr./Ms./Mrs. ${inputs.teacher_name}
      - **Subject/Topic of Email:** ${inputs.topic}
      - **Key Points to communicate:**\n${inputs.key_points}

      **Instructions:**
      - Draft a complete email, including a subject line, a proper greeting (e.g., "Dear Mr. Smith,"), the body, and a closing (e.g., "Thank you,").
      - The email should clearly state its purpose and communicate the key points effectively and respectfully.
      - Format the output in clean Markdown, starting with a subject line.
    `,
  'student-wellness-support': (inputs) => `
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
};


Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { toolId, inputs, file_urls, language } = await req.json();

        if (!TOOL_PROMPTS[toolId]) {
            return Response.json({ error: 'Invalid tool ID' }, { status: 400 });
        }

        const promptTemplate = TOOL_PROMPTS[toolId];
        const prompt = promptTemplate(inputs);

        const llmPayload = {
            prompt: prompt,
            file_urls: file_urls || [],
            add_context_from_internet: false // Default
        };

        // Enable internet context for tools that need it (if no file is uploaded)
        const toolsWithInternet = [
            'teacher-question-generator', 
            'worksheet-generator', 
            'student-question-generator'
        ];
        
        const hasFile = file_urls && file_urls.length > 0;
        if (toolsWithInternet.includes(toolId) && !hasFile) {
            llmPayload.add_context_from_internet = true;
        }

        // Call LLM Integration
        let result = await base44.integrations.Core.InvokeLLM(llmPayload);

        // Translate if needed
        if (language && language !== 'EN' && result) {
            const languageNames = {
                ES: 'Spanish',
                ZH: 'Chinese (Simplified)',
                KO: 'Korean',
                FR: 'French'
            };
            const targetLang = languageNames[language] || 'English';
            
            const translationResult = await base44.integrations.Core.InvokeLLM({
                prompt: `Translate the following text to ${targetLang}. Keep all markdown formatting intact. Only translate, do not add any commentary or explanations:\n\n${result}`
            });
            result = translationResult;
        }

        // The worksheet-generator returns raw HTML that is rendered via dangerouslySetInnerHTML
        // on the client. Sanitize it server-side to strip scripts/event handlers (stored XSS).
        if (toolId === 'worksheet-generator' && typeof result === 'string') {
            result = sanitizeWorksheetHtml(result);
        }

        return Response.json({ result });
    } catch (error) {
        console.error("Error running AI tool:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});