export default {
  id: "RTL-DRV-001",
  severity: "CRITICAL",

  check(code) {
    const findings = [];
    const assigns = {};
    const matches = code.matchAll(/(\w+)\s*(<=|=)/g);

    for (const match of matches) {
      const signal = match[1];
      assigns[signal] = (assigns[signal] || 0) + 1;
    }

    Object.entries(assigns).forEach(([signal, count]) => {
      if (count > 1) {
        findings.push({
          ruleId: this.id,
          severity: this.severity,
          message: `Signal "${signal}" has multiple drivers`,
          explanation:
            "Multiple drivers cause undefined hardware behavior.",
          fix:
            "Ensure signal is assigned in only one always or assign block.",
        });
      }
    });

    return findings;
  },
};
