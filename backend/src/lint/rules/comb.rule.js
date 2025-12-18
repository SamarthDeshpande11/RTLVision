export default {
  id: "RTL-COMB-001",
  severity: "WARNING",

  check(code) {
    const findings = [];
    const regex = /always\s*@\((?!\*)[^)]+\)/g;

    if (regex.test(code)) {
      findings.push({
        ruleId: this.id,
        severity: this.severity,
        message: "Incomplete sensitivity list",
        explanation:
          "Missing signals in sensitivity list can cause simulation-synthesis mismatch.",
        fix:
          "Use always @(*) for combinational logic.",
      });
    }

    return findings;
  },
};
