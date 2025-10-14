/**
 * CaseElementLibrary.ts
 *
 * Spirit of Kiro 패턴: word-lists
 * 일관된 케이스 품질을 위한 요소 라이브러리
 * Date seed 기반으로 매일 다른 요소 조합 생성
 */

export interface Weapon {
  name: string;
  description: string;
  keywords: string[];
}

export interface Motive {
  category: string;
  description: string;
  keywords: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface Location {
  name: string;
  description: string;
  props: string[];
  atmosphere: string;
}

export interface Suspect {
  archetype: string;
  traits: string[];
  backgroundKeywords: string[];
}

export interface Evidence {
  type: string;
  description: string;
  relevance: 'critical' | 'important' | 'minor';
}

/**
 * 케이스 생성을 위한 요소 라이브러리
 */
export class CaseElementLibrary {
  /**
   * 무기 라이브러리
   */
  static readonly weapons: Weapon[] = [
    {
      name: '독극물',
      description: '검출하기 어려운 독극물',
      keywords: ['독약', '음독', '중독', '화학물질']
    },
    {
      name: '둔기',
      description: '무딘 물체로 가격',
      keywords: ['타격', '둔기', '충격', '골절']
    },
    {
      name: '날카로운 흉기',
      description: '칼이나 날카로운 물체',
      keywords: ['자상', '절상', '칼', '예리한']
    },
    {
      name: '총기',
      description: '소형 화기',
      keywords: ['총상', '발사', '탄환', '화약']
    },
    {
      name: '질식',
      description: '목 조르기 또는 질식',
      keywords: ['질식사', '압박', '호흡곤란', '경부']
    },
    {
      name: '추락',
      description: '높은 곳에서 떨어짐',
      keywords: ['추락사', '낙하', '고소', '충격']
    }
  ];

  /**
   * 동기 라이브러리
   */
  static readonly motives: Motive[] = [
    {
      category: '금전',
      description: '재산 관련 동기',
      keywords: ['유산', '보험금', '빚', '재산', '금고', '계좌'],
      severity: 'high'
    },
    {
      category: '복수',
      description: '과거 원한에 대한 복수',
      keywords: ['배신', '원한', '모욕', '과거', '앙갚음', '보복'],
      severity: 'high'
    },
    {
      category: '질투',
      description: '연인이나 성공에 대한 질투',
      keywords: ['질투', '시기', '경쟁', '연인', '삼각관계'],
      severity: 'medium'
    },
    {
      category: '비밀 은폐',
      description: '숨기고 싶은 비밀',
      keywords: ['비밀', '스캔들', '폭로', '증거', '은폐'],
      severity: 'high'
    },
    {
      category: '우발적',
      description: '계획되지 않은 돌발 상황',
      keywords: ['우발적', '실수', '충동', '감정폭발', '순간'],
      severity: 'low'
    }
  ];

  /**
   * 장소 라이브러리
   */
  static readonly locations: Location[] = [
    {
      name: '밀실 서재',
      description: '고급스러운 개인 서재',
      props: ['책장', '금고', '비밀 통로', '고서적', '앤티크 가구'],
      atmosphere: '고요하고 지적인 분위기'
    },
    {
      name: '저택 정원',
      description: '넓은 정원이 딸린 저택',
      props: ['분수', '동상', '장미 덤불', '정자', '연못'],
      atmosphere: '우아하지만 음산한 분위기'
    },
    {
      name: '미술관 전시실',
      description: '현대 미술관 전시 공간',
      props: ['조각상', '그림', 'CCTV', '조명', '벨벳 로프'],
      atmosphere: '세련되고 정적인 분위기'
    },
    {
      name: '호화 요트',
      description: '대형 개인 요트',
      props: ['갑판', '선실', '구명보트', '앵커', '조타실'],
      atmosphere: '럭셔리하지만 고립된 분위기'
    },
    {
      name: '극장 무대 뒤',
      description: '오래된 극장 백스테이지',
      props: ['의상실', '소품', '조명실', '무대 장치', '분장실'],
      atmosphere: '화려하지만 어두운 분위기'
    }
  ];

  /**
   * 용의자 원형 라이브러리
   */
  static readonly suspectArchetypes: Suspect[] = [
    {
      archetype: '부유한 상속자',
      traits: ['거만함', '특권의식', '냉소적'],
      backgroundKeywords: ['재벌가', '유산', '사업가', '투자자']
    },
    {
      archetype: '충실한 집사',
      traits: ['정중함', '관찰력', '비밀스러움'],
      backgroundKeywords: ['오랜 근무', '신뢰', '집안 사정', '목격자']
    },
    {
      archetype: '예술가',
      traits: ['감성적', '불안정', '열정적'],
      backgroundKeywords: ['창작', '영감', '작품', '전시']
    },
    {
      archetype: '사업 동업자',
      traits: ['계산적', '실용적', '야심적'],
      backgroundKeywords: ['계약', '파트너십', '이해관계', '경쟁']
    },
    {
      archetype: '전직 경찰',
      traits: ['분석적', '의심 많음', '직설적'],
      backgroundKeywords: ['수사 경험', '관찰', '범죄학', '증거']
    }
  ];

  /**
   * 증거 타입 라이브러리
   */
  static readonly evidenceTypes: Evidence[] = [
    {
      type: '물리적 증거',
      description: '현장에서 발견된 물건',
      relevance: 'critical'
    },
    {
      type: '목격자 증언',
      description: '사건 전후 목격 내용',
      relevance: 'important'
    },
    {
      type: '재무 기록',
      description: '금융 거래 내역',
      relevance: 'important'
    },
    {
      type: '통신 기록',
      description: '전화, 메시지 기록',
      relevance: 'critical'
    },
    {
      type: '알리바이 증거',
      description: '용의자 위치 증명',
      relevance: 'critical'
    }
  ];

  /**
   * Date seed 기반 요소 선택
   * Spirit of Kiro 패턴: 같은 날짜는 같은 요소 조합
   */
  static selectByDateSeed<T>(array: T[], date: Date): T {
    const seed = date.getFullYear() * 10000 +
                 (date.getMonth() + 1) * 100 +
                 date.getDate();
    const index = seed % array.length;
    return array[index];
  }

  /**
   * Date seed 기반 복수 요소 선택
   */
  static selectMultipleByDateSeed<T>(array: T[], date: Date, count: number): T[] {
    const seed = date.getFullYear() * 10000 +
                 (date.getMonth() + 1) * 100 +
                 date.getDate();

    const selected: T[] = [];
    for (let i = 0; i < count && i < array.length; i++) {
      const index = (seed + i * 7) % array.length; // 7은 중복 방지 offset
      selected.push(array[index]);
    }

    return selected;
  }

  /**
   * 오늘의 케이스 요소 조합 생성
   */
  static getTodaysCaseElements(date: Date = new Date()) {
    return {
      weapon: this.selectByDateSeed(this.weapons, date),
      motive: this.selectByDateSeed(this.motives, date),
      location: this.selectByDateSeed(this.locations, date),
      suspects: this.selectMultipleByDateSeed(this.suspectArchetypes, date, 3),
      evidenceTypes: this.selectMultipleByDateSeed(this.evidenceTypes, date, 4)
    };
  }
}
