const fmtDeg = (x) => {
  const dDeg = Math.floor(x);
  const mIn = Math.floor((x - dDeg) * 60);
  return `${dDeg}°${String(mIn).padStart(2, "0")}′`;
};

export { fmtDeg };
