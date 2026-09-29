const HUES = [355, 18, 42, 68, 90, 125, 160, 188, 212, 240, 268];
const LETTERS = "Streamsicle".split("");

export function Logo({ size = 84 }: { size?: number }) {
  return (
    <h1
      style={{
        fontFamily: "var(--font-creepster), cursive",
        fontWeight: 400,
        fontSize: size,
        letterSpacing: "0.02em",
        margin: 0,
        lineHeight: 1,
      }}
      aria-label="Streamsicle"
    >
      {LETTERS.map((letter, i) => (
        <span key={i} style={{ color: `oklch(0.74 0.16 ${HUES[i]})` }}>
          {letter}
        </span>
      ))}
    </h1>
  );
}
