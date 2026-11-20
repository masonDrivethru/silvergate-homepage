/**
 * 가상 MBR 샘플. 제품·공정·수치는 전부 지어낸 것이다.
 *
 * v1.0 → v1.1 변경 내역 (데모에서 보여줄 것):
 *   수정  1.2 배양 온도 36.5 → 37.0
 *   수정  2.2 심층 여과 지시문 문장 일부 변경 (텍스트 diff 시연)
 *   수정  1.1 배지 투입 스펙 범위 440~460 → 445~455
 *   추가  1.4 중간 샘플링 (새 스텝)
 *   추가  3.1 Protein A 크로마토그래피에 "유속" 파라미터
 *   삭제  2.3 여과 전 육안 검사
 *   그대로 1.3, 2.1, 3.2, 3.3
 */

import { mbrV10En, mbrV11En } from './sample-data-en.js';

/** @type {import('./types.js').MbrDocument} */
export const mbrV10 = {
  version: '1.0',
  productName: 'SGB-101 Monoclonal Antibody',
  effectiveDate: '2026-03-01',
  groups: [
    {
      groupId: 'G1',
      title: 'Cell Culture',
      steps: [
        {
          stepId: '1.1',
          title: '배지 투입',
          instruction: '멸균 배지를 바이오리액터에 투입한다.',
          params: [
            { key: 'volume', label: '투입량', value: '450', unit: 'L', spec: { lcl: 440, ucl: 460 } },
          ],
        },
        {
          stepId: '1.2',
          title: '배양 온도 설정',
          instruction: '배양 온도를 설정하고 안정화될 때까지 기다린다.',
          params: [
            { key: 'temperature', label: '설정 온도', value: '36.5', unit: '°C', spec: { lcl: 36.0, ucl: 37.5 } },
          ],
        },
        {
          stepId: '1.3',
          title: 'pH 설정',
          instruction: 'CO2와 염기 투입으로 pH를 유지한다.',
          params: [
            { key: 'ph', label: '설정 pH', value: '7.0', spec: { lcl: 6.8, ucl: 7.2 } },
          ],
        },
      ],
    },
    {
      groupId: 'G2',
      title: 'Harvest',
      steps: [
        {
          stepId: '2.1',
          title: '원심분리',
          instruction: '배양액을 연속식 원심분리기로 옮겨 세포를 분리한다.',
          params: [
            { key: 'speed', label: '회전 속도', value: '8000', unit: 'rpm', spec: { lcl: 7500, ucl: 8500 } },
          ],
        },
        {
          stepId: '2.2',
          title: '심층 여과',
          instruction: '원심분리 상등액을 심층 여과 필터에 통과시킨 뒤 여과액을 회수 탱크에 모은다.',
          params: [
            { key: 'pressure', label: '최대 차압', value: '1.5', unit: 'bar', spec: { ucl: 1.5 } },
          ],
        },
        {
          stepId: '2.3',
          title: '여과 전 육안 검사',
          instruction: '필터 하우징의 누수와 손상 여부를 육안으로 확인한다.',
          params: [],
        },
      ],
    },
    {
      groupId: 'G3',
      title: 'Purification',
      steps: [
        {
          stepId: '3.1',
          title: 'Protein A 크로마토그래피',
          instruction: '여과액을 Protein A 컬럼에 로딩하고 세척 후 용출한다.',
          params: [
            { key: 'load', label: '로딩량', value: '35', unit: 'g/L resin', spec: { ucl: 40 } },
          ],
        },
        {
          stepId: '3.2',
          title: '저 pH 바이러스 불활성화',
          instruction: '용출액의 pH를 낮춰 정해진 시간 동안 유지한다.',
          params: [
            { key: 'ph', label: '유지 pH', value: '3.6', spec: { lcl: 3.5, ucl: 3.7 } },
            { key: 'hold', label: '유지 시간', value: '60', unit: 'min', spec: { lcl: 60, ucl: 90 } },
          ],
        },
        {
          stepId: '3.3',
          title: '중화',
          instruction: '염기 용액으로 pH를 중성 범위로 되돌린다.',
          params: [
            { key: 'ph', label: '목표 pH', value: '7.5', spec: { lcl: 7.3, ucl: 7.7 } },
          ],
        },
      ],
    },
  ],
};

/** @type {import('./types.js').MbrDocument} */
export const mbrV11 = {
  version: '1.1',
  productName: 'SGB-101 Monoclonal Antibody',
  effectiveDate: '2026-06-15',
  groups: [
    {
      groupId: 'G1',
      title: 'Cell Culture',
      steps: [
        {
          stepId: '1.1',
          title: '배지 투입',
          instruction: '멸균 배지를 바이오리액터에 투입한다.',
          params: [
            // 스펙 범위 변경
            { key: 'volume', label: '투입량', value: '450', unit: 'L', spec: { lcl: 445, ucl: 455 } },
          ],
        },
        {
          stepId: '1.2',
          title: '배양 온도 설정',
          instruction: '배양 온도를 설정하고 안정화될 때까지 기다린다.',
          params: [
            // 설정값 변경
            { key: 'temperature', label: '설정 온도', value: '37.0', unit: '°C', spec: { lcl: 36.0, ucl: 37.5 } },
          ],
        },
        {
          stepId: '1.3',
          title: 'pH 설정',
          instruction: 'CO2와 염기 투입으로 pH를 유지한다.',
          params: [
            { key: 'ph', label: '설정 pH', value: '7.0', spec: { lcl: 6.8, ucl: 7.2 } },
          ],
        },
        {
          // 새 스텝
          stepId: '1.4',
          title: '중간 샘플링',
          instruction: '배양 3일차에 무균 샘플링 포트로 시료를 채취해 세포 수와 생존율을 측정한다.',
          params: [
            { key: 'viability', label: '세포 생존율', value: '≥ 90', unit: '%', spec: { lcl: 90 } },
          ],
        },
      ],
    },
    {
      groupId: 'G2',
      title: 'Harvest',
      steps: [
        {
          stepId: '2.1',
          title: '원심분리',
          instruction: '배양액을 연속식 원심분리기로 옮겨 세포를 분리한다.',
          params: [
            { key: 'speed', label: '회전 속도', value: '8000', unit: 'rpm', spec: { lcl: 7500, ucl: 8500 } },
          ],
        },
        {
          stepId: '2.2',
          title: '심층 여과',
          // 지시문 일부 변경
          instruction: '원심분리 상등액을 2단 심층 여과 필터에 순서대로 통과시킨 뒤 여과액을 멸균된 회수 탱크에 모은다.',
          params: [
            { key: 'pressure', label: '최대 차압', value: '1.5', unit: 'bar', spec: { ucl: 1.5 } },
          ],
        },
        // 2.3 여과 전 육안 검사 — 삭제
      ],
    },
    {
      groupId: 'G3',
      title: 'Purification',
      steps: [
        {
          stepId: '3.1',
          title: 'Protein A 크로마토그래피',
          instruction: '여과액을 Protein A 컬럼에 로딩하고 세척 후 용출한다.',
          params: [
            { key: 'load', label: '로딩량', value: '35', unit: 'g/L resin', spec: { ucl: 40 } },
            // 파라미터 추가
            { key: 'flowRate', label: '유속', value: '150', unit: 'cm/h', spec: { lcl: 120, ucl: 180 } },
          ],
        },
        {
          stepId: '3.2',
          title: '저 pH 바이러스 불활성화',
          instruction: '용출액의 pH를 낮춰 정해진 시간 동안 유지한다.',
          params: [
            { key: 'ph', label: '유지 pH', value: '3.6', spec: { lcl: 3.5, ucl: 3.7 } },
            { key: 'hold', label: '유지 시간', value: '60', unit: 'min', spec: { lcl: 60, ucl: 90 } },
          ],
        },
        {
          stepId: '3.3',
          title: '중화',
          instruction: '염기 용액으로 pH를 중성 범위로 되돌린다.',
          params: [
            { key: 'ph', label: '목표 pH', value: '7.5', spec: { lcl: 7.3, ucl: 7.7 } },
          ],
        },
      ],
    },
  ],
};

export const samples = { '1.0': mbrV10, '1.1': mbrV11 };

/**
 * 언어별 샘플. 키·수치는 같고 문구만 다르다.
 * @param {string} locale  "ko" | "en"
 * @returns {Object<string, import('./types.js').MbrDocument>}  버전 → 문서
 */
export function getSamples(locale) {
  return locale === 'ko' ? samples : { '1.0': mbrV10En, '1.1': mbrV11En };
}
