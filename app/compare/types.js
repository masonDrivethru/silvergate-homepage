/**
 * SilverBio Compare — 데이터 타입 정의 (JSDoc)
 *
 * 공개 표준 ISA-88의 절차 계층(Procedure → Unit Procedure → Operation)을
 * 단순화한 일반적인 배치 기록 구조:  문서 → 그룹 → 스텝 → 파라미터.
 * 실제 고객사 구조와 무관하다.
 */

/**
 * 파라미터 허용 범위. 하한/상한 중 하나만 있어도 된다.
 * @typedef {Object} Spec
 * @property {number} [lcl]  하한 (Lower Control Limit)
 * @property {number} [ucl]  상한 (Upper Control Limit)
 */

/**
 * @typedef {Object} Param
 * @property {string} key       매칭 키 (스텝 안에서 유일)
 * @property {string} label     표시 이름
 * @property {string} value     설정값 (문자열로 보관: "36.5", "7.0 ± 0.2")
 * @property {string} [unit]
 * @property {Spec}   [spec]
 */

/**
 * @typedef {Object} Step
 * @property {string} [stepId]       매칭 키 우선순위 1
 * @property {string} title          매칭 키 우선순위 2 (stepId 없을 때)
 * @property {string} [instruction]  작업 지시문
 * @property {Param[]} [params]
 */

/**
 * @typedef {Object} Group
 * @property {string} [groupId]      매칭 키 우선순위 1
 * @property {string} title          매칭 키 우선순위 2 (groupId 없을 때)
 * @property {Step[]} [steps]
 */

/**
 * MBR 문서 한 버전.
 * @typedef {Object} MbrDocument
 * @property {string} version
 * @property {string} productName
 * @property {string} [effectiveDate]  YYYY-MM-DD
 * @property {Group[]} groups
 */

/** @typedef {"added" | "modified" | "deleted"} ChangeType */
/** @typedef {"group" | "step" | "param"} ChangeLevel */

/**
 * diff-match-patch 형식: [op, text]  (op: -1 삭제, 0 동일, 1 추가)
 * @typedef {[(-1|0|1), string]} DiffOp
 */

/**
 * 변경 1건.
 * @typedef {Object} Change
 * @property {ChangeType}  type
 * @property {ChangeLevel} level
 * @property {string}      groupId      매칭에 쓴 그룹 키
 * @property {string}      groupTitle
 * @property {string|null} stepId       level이 group이면 null
 * @property {string|null} stepTitle
 * @property {string|null} paramKey     level이 param일 때만
 * @property {string|null} field        무엇이 바뀌었나: "title" | "instruction" | "value" 등. 추가/삭제면 null
 * @property {string[]}    [fields]     param 수정일 때 바뀐 속성 목록 (value, unit, spec, label)
 * @property {string}      label        대상 이름 (그룹·스텝 제목 또는 파라미터 label).
 *                                     엔진은 화면 문구를 만들지 않는다. "지시문 수정" 같은 표시는
 *                                     UI가 field 값으로 i18n(ko.json/en.json) 문구를 고른다.
 * @property {string|null} left         이전 값 (추가면 null)
 * @property {string|null} right        새 값 (삭제면 null)
 * @property {DiffOp[]|null} diffs      수정일 때만
 * @property {string}      anchorId     스크롤 대상 DOM id
 */

/**
 * 좌우 정렬된 트리. UI는 이것만 보고 양쪽 패널을 같은 줄 높이로 그린다.
 * left/right 중 한쪽이 null이면 그쪽은 빈 자리(갭)로 그린다.
 * @typedef {Object} AlignedParam
 * @property {string} key
 * @property {Param|null} left
 * @property {Param|null} right
 * @property {ChangeType|null} status   null = 변경 없음
 * @property {string} anchorId
 *
 * @typedef {Object} AlignedStep
 * @property {string} key
 * @property {Step|null} left
 * @property {Step|null} right
 * @property {ChangeType|null} status   하위 변경이 롤업된 상태
 * @property {AlignedParam[]} params
 * @property {string} anchorId
 *
 * @typedef {Object} AlignedGroup
 * @property {string} key
 * @property {Group|null} left
 * @property {Group|null} right
 * @property {ChangeType|null} status
 * @property {AlignedStep[]} steps
 * @property {string} anchorId
 */

/**
 * @typedef {Object} ChangeSet
 * @property {{added:number, modified:number, deleted:number}} stats
 * @property {Change[]} changes                       문서 순서대로
 * @property {Object<string, ChangeType>} groupFlags  그룹 키 → 롤업 상태
 * @property {Object<string, ChangeType>} stepFlags   "그룹키/스텝키" → 롤업 상태
 * @property {AlignedGroup[]} aligned
 * @property {{left:string, right:string}} versions
 */

/**
 * @typedef {Object} CompareOptions
 * @property {"step"|"param"} [countBy="step"]  집계 단위
 * @property {number} [longTextMin=20]  이 길이 이상이면 의미 단위로 diff 정리
 */

export {};
