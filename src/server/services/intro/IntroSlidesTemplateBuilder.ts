/**
 * IntroSlidesTemplateBuilder.ts
 *
 * Template-based intro slides generation with automatic language detection
 * Guarantees 100% success rate with instant generation
 */

import type { IntroSlides, Slide1Discovery, Slide2Suspects, Slide3Challenge } from '@/shared/types';

interface CaseData {
  victim: { name: string; background: string };
  suspects: Array<{ id: string; name: string; archetype: string }>;
  weapon: { name: string };
  location: { name: string };
}

type Language = 'ko' | 'en';

/**
 * Template builder for intro slides
 * Uses simple templates with case data filled in
 */
export class IntroSlidesTemplateBuilder {
  /**
   * Build all 3 slides using templates
   */
  build(caseData: CaseData): IntroSlides {
    const language = this.detectLanguage(caseData);

    return {
      discovery: this.buildSlide1Template(caseData, language),
      suspects: this.buildSlide2Template(caseData, language),
      challenge: this.buildSlide3Template(caseData, language)
    };
  }

  /**
   * Detect language from victim/suspect names
   * Korean characters: 가-힣
   * Otherwise: English
   */
  private detectLanguage(caseData: CaseData): Language {
    const koreanPattern = /[가-힣]/;

    // Check victim name
    if (koreanPattern.test(caseData.victim.name)) {
      return 'ko';
    }

    // Check suspect names
    const hasKoreanSuspect = caseData.suspects.some(s =>
      koreanPattern.test(s.name)
    );

    return hasKoreanSuspect ? 'ko' : 'en';
  }

  /**
   * Build Slide 1: Discovery
   */
  private buildSlide1Template(caseData: CaseData, language: Language): Slide1Discovery {
    if (language === 'ko') {
      return {
        timeLocation: `${this.getCurrentDate()} 자정\n${caseData.location.name}에서`,
        victimStatement: `${caseData.victim.name}이(가) 시체로 발견되었다`,
        constraint: '문은 안에서 잠겨 있었고, 현장에는 수 명이 있었다'
      };
    } else {
      return {
        timeLocation: `Midnight - ${caseData.location.name}`,
        victimStatement: `${caseData.victim.name} found dead at the scene`,
        constraint: 'All doors were locked from inside, several were present'
      };
    }
  }

  /**
   * Build Slide 2: Suspects
   */
  private buildSlide2Template(caseData: CaseData, language: Language): Slide2Suspects {
    const suspectCards = caseData.suspects.map(suspect => ({
      suspectId: suspect.id,
      name: suspect.name,
      role: this.translateArchetype(suspect.archetype, language),
      claim: language === 'ko'
        ? '그 시간 현장에 있었다고 주장한다'
        : 'Claims to have been present at the time',
      hasProfileImage: true
    }));

    if (language === 'ko') {
      return {
        suspectCards,
        constraintStatement: '모두가 그 시간, 그 장소에 있었다고 주장한다',
        tensionLine: '하지만 누군가는 거짓말을 하고 있다'
      };
    } else {
      return {
        suspectCards,
        constraintStatement: 'All claim to have been at the location during the critical time',
        tensionLine: 'But someone is lying'
      };
    }
  }

  /**
   * Build Slide 3: Challenge
   */
  private buildSlide3Template(caseData: CaseData, language: Language): Slide3Challenge {
    const suspectCount = caseData.suspects.length;

    if (language === 'ko') {
      return {
        statementLine1: `${suspectCount}명의 용의자`,
        statementLine2: '하나의 진실',
        statementLine3: '시간이 촉박하다',
        question: `누가 ${caseData.victim.name}을(를) 죽였는가?`,
        cta: '수사 시작'
      };
    } else {
      return {
        statementLine1: `${suspectCount} suspects`,
        statementLine2: 'One truth',
        statementLine3: 'Time is running out',
        question: `Who killed ${caseData.victim.name}?`,
        cta: 'START INVESTIGATION'
      };
    }
  }

  /**
   * Get current date in Korean format
   */
  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}년 ${month}월 ${day}일`;
  }

  /**
   * Translate archetype to appropriate role
   */
  private translateArchetype(archetype: string, language: Language): string {
    if (language === 'ko') {
      const koMap: Record<string, string> = {
        'business-partner': '사업 파트너',
        'wealthy-heir': '부유한 상속인',
        'talented-artist': '재능있는 예술가',
        'loyal-butler': '충성스러운 집사',
        'former-police-officer': '전직 경찰관'
      };
      return koMap[archetype] || archetype;
    } else {
      const enMap: Record<string, string> = {
        'business-partner': 'Business Partner',
        'wealthy-heir': 'Wealthy Heir',
        'talented-artist': 'Artist',
        'loyal-butler': 'Butler',
        'former-police-officer': 'Former Officer'
      };
      return enMap[archetype] || archetype;
    }
  }
}
