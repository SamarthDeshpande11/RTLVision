export default {
  id: "RTL-LATCH-001",
  severity: "CRITICAL",

  check(code) {
    const findings = [];
    const alwaysComb = code.match(/always\s*@\(\*\)[\s\S]*?end/g) || [];

    alwaysComb.forEach(block => {
      if (/if\s*\(.+\)\s*(?!else)/.test(block)) {
        findings.push({
          ruleId: this.id,
          severity: this.severity,
          message: "Unintended latch inferred",
          explanation:
            "Not all branches assign values in combinational logic.",
          fix:
            "Assign all outputs in every conditional path.",
        });
      }
    });

    return findings;
  },
};
