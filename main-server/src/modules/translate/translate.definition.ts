/**
 * Safety setting that can be sent as part of request parameters.
 * @public
 */
export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

/**
 * Threshold above which a prompt or candidate will be blocked.
 * @public
 */
export enum HarmBlockThreshold {
  HARM_BLOCK_THRESHOLD_UNSPECIFIED = 'HARM_BLOCK_THRESHOLD_UNSPECIFIED',
  BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
  BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
  BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
  BLOCK_NONE = 'BLOCK_NONE',
}

/**
 * Harm categories that would cause prompts or candidates to be blocked.
 * @public
 */
export enum HarmCategory {
  HARM_CATEGORY_UNSPECIFIED = 'HARM_CATEGORY_UNSPECIFIED',
  HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
  HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
  HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
}

export interface LearningSet {
  // 한글 단어를 영어로 번역한 결과
  translation: string;

  // 한글 단어에 대한 유의어
  synonyms: string | null;

  // 한글 단어에 대한 반의어
  antonyms: string | null;

  // 한글 단어의 발음 기호
  pronunciation: string;

  // 학습을 위한 응용 문제
  exercises: string[];

  // 한글 단어에 대한 주의사항
  caution: string | null;
}
