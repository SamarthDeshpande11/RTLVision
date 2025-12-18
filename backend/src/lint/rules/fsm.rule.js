export default {
  id: "RTL-FSM-001",
  severity: "WARNING",

  check(code) {
    const findings = [];
    const caseBlocks = code.match(/case\s*\([^)]+\)[\s\S]*?endcase/g) || [];

    caseBlocks.forEach(block => {
      if (!/default\s*:/.test(block)) {
        findings.push({
          ruleId: this.id,
          severity: this.severity,
          message: "FSM missing default case",
          explanation:
            "FSM without default case may enter illegal states.",
          fix:
            "Add a default case to handle illegal states.",
        });
      }
    });

    return findings;
  },
};
