import {exec} from 'child_process';
import path from 'path';

export const runIcarusSimulation=(rtlFilePath)=>{
    return new Promise((resolve,reject)=>{
        const outputFile=rtlFilePath.replace(".v",".out");
        const compileCmd=`iverilog ${rtlFilePath} -o${outputFile}`;
        const runCmd=`vvp ${outputFile}`;

        exec(compileCmd,(compileErr,compileStdout,compileStderr)=>{
            if(compileErr){
                return reject({
                    stage:"compile",
                    error:compileStderr||compileErr.message,
                });
            }
            exec(runCmd,(runErr,runStdout,runStderr)=>{
                if(runErr){
                    return reject({
                        stage:"run",
                        error:runStderr||runErr.message,
                    });
                }
                return resolve({
                    compileOutput:compileStdout,
                    runOutput:runStdout,
                });
            });
        });
    });
};