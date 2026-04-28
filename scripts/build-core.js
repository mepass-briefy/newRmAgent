// 원본 jsx에서 컴포넌트 영역(line 582 ~ 3687)을 추출하여 RmAppCore.jsx 생성
// 중복된 상수/헬퍼 블록(line 803~1019)은 lib에서 import 하므로 제거.
// FirstSetup/Login/Root은 별도 파일로 이동했으므로 포함하지 않음.
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..', 'crm_rm', 'rm_work_board_v2.jsx');
const DEST = path.resolve(__dirname, '..', 'app', 'components', '_core', 'RmAppCore.jsx');

const lines = fs.readFileSync(SRC, 'utf8').split('\n');
// 원본 1-indexed → 0-indexed slice
// 추출 범위: 582 ~ 3687 (Login 직전까지). FirstSetup이 3688부터 시작.
const sliced = lines.slice(581, 3687);
// 그 안에서 중복 const 블록(원본 803~1019) 제거
// 추출본 기준으로는 803-582 = 221부터, 1019-582 = 437까지 (양쪽 inclusive 0-index 기준 222~437)
const before = sliced.slice(0, 803 - 582);     // 0..221
const after  = sliced.slice(1019 - 582 + 1);   // 438..end
const body = before.concat(after).join('\n');

const header = `"use client";
// 자동 생성: scripts/build-core.js
// 원본 crm_rm/rm_work_board_v2.jsx의 line 582-3687 (FirstSetup 이전까지) 추출.
// 중복된 const 블록(원본 803-1019)은 @/app/lib/{constants,utils}로 이동되어 제거.

import React, { useState, useEffect, useRef } from "react";
import { useTheme, useRates, useCategories } from "@/app/lib/context";
import { store } from "@/app/lib/store";
import { callClaude } from "@/app/lib/ai";
import {
  H, STATUS_MAP, STAGE_ORDER, STATUSES, INDUSTRIES, DEVICES, WORKER_TYPES,
  GRADE_ORDER, ROLES, DEFAULT_PERMS, MENU_LABELS,
  DEFAULT_RATES, DEFAULT_CATEGORIES, CATEGORIES_KEY,
  AI_DISCOUNT_RATE, AI_DURATION_REDUCTION, HARNESS_RATE_MULTIPLIER,
  VARIANT_MODES, CONTRACT_TYPES,
  DEFAULT_AI_CONFIG, DEFAULT_PROPOSAL,
  PATTERN_KEY, PATTERN_LIMIT,
  HARNESS_INDICATOR_COLOR, APP_VERSION,
} from "@/app/lib/constants";
import {
  todayInfo, migrateRates, getCompletedStages, autoStatus, applyCorrections,
  withId, migrateMember, newVariant, migrateProposal, normalizeMember,
  harnessMul, effectiveRate,
  calcAmount, calcMemberMonthAmount, calcVariantMonthSplit, calcVariantMonthHuman,
  calcVariantSplitTotal, calcVariantHumanTotal, calcVariantAvgMonthly, calcVariantTotals,
  readFileAsBase64, readFileAsText, loadCustomers,
  getPatterns, setPatterns, buildRevisionPatternsBlock, isSimilarPattern, addPattern,
  roleGroupOf,
} from "@/app/lib/utils";
import { Btn, Inp, Card, Badge, Toggle, Loading, BackBtn, ChipBtn, IC } from "@/app/components/ui";

// 원본의 "todayStr / todayDate / korDay"는 useTheme에서 매번 호출되지 않아
// 모듈 평가 시점에 한 번 계산되었음. 동일 거동 재현.
const _today = todayInfo();
const todayStr = _today.str;
const todayDate = _today.date;
const korDay = _today.korDay;

`;

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, header + body + '\n');
console.log("✅ wrote", DEST, body.split('\n').length, "lines (+ header)");
