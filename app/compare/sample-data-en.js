/**
 * 가상 MBR 샘플 — 영어판. 구조·키·수치는 sample-data.js(한국어판)와 똑같고 문구만 영어.
 */

/** @type {import('./types.js').MbrDocument} */
export const mbrV10En = {
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
          title: 'Media charge',
          instruction: 'Charge sterile media into the bioreactor.',
          params: [{ key: 'volume', label: 'Volume', value: '450', unit: 'L', spec: { lcl: 440, ucl: 460 } }],
        },
        {
          stepId: '1.2',
          title: 'Set culture temperature',
          instruction: 'Set the culture temperature and wait until it is stable.',
          params: [{ key: 'temperature', label: 'Set point', value: '36.5', unit: '°C', spec: { lcl: 36.0, ucl: 37.5 } }],
        },
        {
          stepId: '1.3',
          title: 'Set pH',
          instruction: 'Hold pH with CO2 sparging and base addition.',
          params: [{ key: 'ph', label: 'Set pH', value: '7.0', spec: { lcl: 6.8, ucl: 7.2 } }],
        },
      ],
    },
    {
      groupId: 'G2',
      title: 'Harvest',
      steps: [
        {
          stepId: '2.1',
          title: 'Centrifugation',
          instruction: 'Transfer the culture to the continuous centrifuge to remove cells.',
          params: [{ key: 'speed', label: 'Speed', value: '8000', unit: 'rpm', spec: { lcl: 7500, ucl: 8500 } }],
        },
        {
          stepId: '2.2',
          title: 'Depth filtration',
          instruction: 'Pass the centrifuge supernatant through the depth filter and collect the filtrate in the harvest tank.',
          params: [{ key: 'pressure', label: 'Max. ΔP', value: '1.5', unit: 'bar', spec: { ucl: 1.5 } }],
        },
        {
          stepId: '2.3',
          title: 'Pre-filtration visual check',
          instruction: 'Check the filter housing for leaks and damage.',
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
          title: 'Protein A chromatography',
          instruction: 'Load the filtrate onto the Protein A column, wash, then elute.',
          params: [{ key: 'load', label: 'Load', value: '35', unit: 'g/L resin', spec: { ucl: 40 } }],
        },
        {
          stepId: '3.2',
          title: 'Low-pH viral inactivation',
          instruction: 'Lower the eluate pH and hold for the set time.',
          params: [
            { key: 'ph', label: 'Hold pH', value: '3.6', spec: { lcl: 3.5, ucl: 3.7 } },
            { key: 'hold', label: 'Hold time', value: '60', unit: 'min', spec: { lcl: 60, ucl: 90 } },
          ],
        },
        {
          stepId: '3.3',
          title: 'Neutralization',
          instruction: 'Bring pH back to neutral with base solution.',
          params: [{ key: 'ph', label: 'Target pH', value: '7.5', spec: { lcl: 7.3, ucl: 7.7 } }],
        },
      ],
    },
  ],
};

/** @type {import('./types.js').MbrDocument} */
export const mbrV11En = {
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
          title: 'Media charge',
          instruction: 'Charge sterile media into the bioreactor.',
          params: [{ key: 'volume', label: 'Volume', value: '450', unit: 'L', spec: { lcl: 445, ucl: 455 } }],
        },
        {
          stepId: '1.2',
          title: 'Set culture temperature',
          instruction: 'Set the culture temperature and wait until it is stable.',
          params: [{ key: 'temperature', label: 'Set point', value: '37.0', unit: '°C', spec: { lcl: 36.0, ucl: 37.5 } }],
        },
        {
          stepId: '1.3',
          title: 'Set pH',
          instruction: 'Hold pH with CO2 sparging and base addition.',
          params: [{ key: 'ph', label: 'Set pH', value: '7.0', spec: { lcl: 6.8, ucl: 7.2 } }],
        },
        {
          stepId: '1.4',
          title: 'In-process sampling',
          instruction: 'On day 3, take a sample through the aseptic port and measure cell count and viability.',
          params: [{ key: 'viability', label: 'Viability', value: '≥ 90', unit: '%', spec: { lcl: 90 } }],
        },
      ],
    },
    {
      groupId: 'G2',
      title: 'Harvest',
      steps: [
        {
          stepId: '2.1',
          title: 'Centrifugation',
          instruction: 'Transfer the culture to the continuous centrifuge to remove cells.',
          params: [{ key: 'speed', label: 'Speed', value: '8000', unit: 'rpm', spec: { lcl: 7500, ucl: 8500 } }],
        },
        {
          stepId: '2.2',
          title: 'Depth filtration',
          instruction: 'Pass the centrifuge supernatant through the two-stage depth filter in order and collect the filtrate in the sterile harvest tank.',
          params: [{ key: 'pressure', label: 'Max. ΔP', value: '1.5', unit: 'bar', spec: { ucl: 1.5 } }],
        },
      ],
    },
    {
      groupId: 'G3',
      title: 'Purification',
      steps: [
        {
          stepId: '3.1',
          title: 'Protein A chromatography',
          instruction: 'Load the filtrate onto the Protein A column, wash, then elute.',
          params: [
            { key: 'load', label: 'Load', value: '35', unit: 'g/L resin', spec: { ucl: 40 } },
            { key: 'flowRate', label: 'Flow rate', value: '150', unit: 'cm/h', spec: { lcl: 120, ucl: 180 } },
          ],
        },
        {
          stepId: '3.2',
          title: 'Low-pH viral inactivation',
          instruction: 'Lower the eluate pH and hold for the set time.',
          params: [
            { key: 'ph', label: 'Hold pH', value: '3.6', spec: { lcl: 3.5, ucl: 3.7 } },
            { key: 'hold', label: 'Hold time', value: '60', unit: 'min', spec: { lcl: 60, ucl: 90 } },
          ],
        },
        {
          stepId: '3.3',
          title: 'Neutralization',
          instruction: 'Bring pH back to neutral with base solution.',
          params: [{ key: 'ph', label: 'Target pH', value: '7.5', spec: { lcl: 7.3, ucl: 7.7 } }],
        },
      ],
    },
  ],
};
