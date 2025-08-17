import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import "../index.css"

gsap.registerPlugin(GSAPSplitText);

const SplitText = ({
  text,
  className = "font-main",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current || !text) return;

    const el = ref.current;

    if (splitType === "lines") el.style.position = "relative";

    let splitter;
    try {
      splitter = new GSAPSplitText(el, {
        type: splitType,
        linesClass: "split-line",
      });
    } catch (err) {
      console.error("Failed to split text:", err);
      return;
    }

    const targets =
      splitType === "lines"
        ? splitter.lines
        : splitType === "words"
        ? splitter.words
        : splitter.chars;

    if (!targets || targets.length === 0) {
      splitter.revert();
      return;
    }

    targets.forEach((t) => {
      t.style.willChange = "transform, opacity";
    });

    const tl = gsap.timeline({
      onComplete: () => {
        animationCompletedRef.current = true;
        gsap.set(targets, { ...to, clearProps: "willChange" });
        onLetterAnimationComplete?.();
      },
    });

    tl.set(targets, { ...from, immediateRender: false, force3D: true });
    tl.to(targets, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      force3D: true,
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(targets);
      splitter?.revert();
    };
  }, []); // ← empty dependency: only run once on mount

  return (
    <p
      ref={ref}
      className={`split-parent ${className} main-font`}
      style={{
        textAlign,
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
      }}
    >
      {text}
    </p>
  );
};

export default SplitText;
