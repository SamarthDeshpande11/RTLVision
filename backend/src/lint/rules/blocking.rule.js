export default {
  id: "RTL-SEQ-001",
  severity: "CRITICAL",

  check(code) {
    const findings = [];
    const alwaysBlocks = code.match(/always\s*@\([^)]+\)[\s\S]*?end/g) || [];

    alwaysBlocks.forEach(block => {
      if (/posedge|negedge/.test(block) && /=\s*[^=]/.test(block)) {
        findings.push({
          ruleId: this.id,
          severity: this.severity,
          message: "Blocking assignment used in sequential logic",
          explanation:
            "Blocking assignments in clocked always blocks can cause race conditions.",
          fix:
            "Use non-blocking assignments (<=) for sequential logic.",
        });
      }
    });

    return findings;
  },
};
