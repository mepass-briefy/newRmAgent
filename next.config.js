/** @type {import('next').NextConfig} */
const nextConfig = {
  // 기존 컴포넌트들이 마운트 시 다중 비동기 store I/O를 수행해 더블 이펙트와 잘 안 맞음 (참고: 원본 v4.3 결정)
  reactStrictMode: false,
  // rmai.local 로컬 도메인 허용
  allowedDevHosts: ["rmai.local"],
};

module.exports = nextConfig;
