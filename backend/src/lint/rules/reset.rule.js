export default {
  id: "RTL-RESET-001",
  severity: "CRITICAL",

  check(code) {
    const findings = [];
    const alwaysBlocks = code.match(/always\s*@\([^)]+\)[\s\S]*?end/g) || [];

    alwaysBlocks.forEach(block => {
      if (
        /posedge|negedge/.test(block) &&
        !/reset|rst/.test(block)
      ) {
        findings.push({
          ruleId: this.id,
          severity: this.severity,
          message: "Sequential logic without reset",
          explanation:
            "Registers without reset can power up in unknown states.",
          fix:
            "Add synchronous or asynchronous reset logic.",
        });
      }
    });

    return findings;
  },
};
