import fs from "fs";

export const runLintRules=(filePath,rules)=>{
    const code=fs.readFileSync(filePath,"utf-8");
    const findings=[];
    for(const rule of rules){
        const result=rule.check(code);
        if(result) findings.push(...result);
    }
    return findings;
};