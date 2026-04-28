// 서버측 세션 헬퍼 — 쿠키에 userId만 보관 (POC 수준)
import { cookies } from "next/headers";

const COOKIE_NAME = "rm_session";
const ONE_DAY = 60 * 60 * 24;

export function getSessionUserId() {
  try {
    const c = cookies().get(COOKIE_NAME);
    return c ? c.value : null;
  } catch (e) {
    return null;
  }
}

export function setSessionUserId(userId) {
  cookies().set(COOKIE_NAME, userId, {
    path: "/",
    maxAge: ONE_DAY * 30,
    sameSite: "lax",
    httpOnly: false, // POC: 클라이언트에서도 읽을 수 있게. 운영 시 httpOnly:true + 별도 me 엔드포인트
  });
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}
